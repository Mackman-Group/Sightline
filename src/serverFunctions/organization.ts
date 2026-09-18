import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { hasOrgPermission } from "@/lib/org-permissions";
import { consumeInvitationSendBudget } from "@/server/auth/invitation-send-limit";
import { requireOrgPermission } from "@/server/auth/org-gate";
import { AuthRepository } from "@/server/auth/repositories/AuthRepository";
import { AppError } from "@/server/lib/errors";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

// The client's source of truth for "who am I in this organization": the active
// org, the caller's role from their member row (resolved server-side by
// ensure-user), and every organization they belong to (for the switcher). Used
// to gate billing/team UI; the server functions and better-auth endpoints
// re-enforce every permission regardless.
export const getOrganizationContext = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const memberships = await AuthRepository.listMembershipsForUser(
      context.userId,
    );
    const active = memberships.find(
      (membership) => membership.organizationId === context.organizationId,
    );

    return {
      organizationId: context.organizationId,
      organizationName: active?.organizationName ?? "Organization",
      role: context.role,
      organizations: memberships,
    };
  });

// Team data for the organization settings tab. Pending invitations are
// sensitive (invitee emails, inviter ids) and should only be visible to callers
// who can manage invitations; the server filters them here so the client cannot
// bypass the gate by calling the underlying endpoint directly.
export const getTeam = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) => {
    const fullOrganization = await getAuth().api.getFullOrganization({
      headers: getRequest().headers,
      query: { organizationId: context.organizationId },
    });
    if (!fullOrganization) {
      throw new AppError("NOT_FOUND");
    }

    const canViewInvitations = hasOrgPermission(context.role, {
      invitation: ["create"],
    });
    const now = Date.now();
    const pendingInvitations = canViewInvitations
      ? (fullOrganization.invitations ?? []).filter(
          (invitation) =>
            invitation.status === "pending" &&
            new Date(invitation.expiresAt).getTime() > now,
        )
      : [];

    return {
      members: fullOrganization.members ?? [],
      pendingInvitations,
    };
  });

const switchOrganizationSchema = z.object({
  organizationId: z.string().min(1),
});

// Switch the active organization and persist the choice so the next sign-in
// lands in the same org (session hook reads user.lastActiveOrganizationId).
export const switchOrganization = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(switchOrganizationSchema)
  .handler(async ({ data, context }) => {
    const membership = await AuthRepository.getMembership(
      context.userId,
      data.organizationId,
    );
    if (!membership) {
      throw new AppError("NOT_FOUND");
    }

    await getAuth().api.setActiveOrganization({
      headers: getRequest().headers,
      body: { organizationId: data.organizationId },
    });
    await AuthRepository.setLastActiveOrganization(
      context.userId,
      data.organizationId,
    );

    return { organizationId: data.organizationId };
  });

const sendInvitationSchema = z.object({ email: z.string().email() });

// Invite (or re-invite) a teammate. better-auth creates the pending
// invitation — its server-side checks (inviter must be a member with invite
// permission, admin-only role lock, 20-pending cap) all still run. resend:
// true refreshes an existing pending invitation's link and expiry.
export const sendTeamInvitation = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(sendInvitationSchema)
  .handler(async ({ data, context }) => {
    // Defense in depth: fail-closed locally before touching the rate-limit
    // budget or calling the plugin, so the budget cannot be exhausted by
    // low-privilege callers.
    requireOrgPermission(context, { invitation: ["create"] });

    await consumeInvitationSendBudget(context.organizationId, data.email);

    const invitation = await getAuth().api.createInvitation({
      headers: getRequest().headers,
      body: {
        email: data.email,
        role: "admin",
        resend: true,
        // Bind the invitation to the request's resolved org, not the session's
        // active-organization hint, which can be stale after a switch.
        organizationId: context.organizationId,
      },
    });

    // This fork has no hosted transactional email provider wired up, so the
    // invitation row is created but nobody is emailed — the invitation link
    // has to be shared with the invitee out of band until hosted mode gets a
    // mail provider.
    return { invitationId: invitation.id };
  });
