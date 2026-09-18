import { AgentSetupPanel } from "@/client/features/ai-mcp/AgentSetupPanel";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { CopyButton } from "@/client/features/ai-mcp/SetupControls";
import { getAgentSetupPrompt } from "@/client/features/ai-mcp/agentSetupPrompt";

export type CompactTreatment = "panel" | "simple" | "preview";

export function CompactAgentPrompt({
  treatment,
  onBack,
  onFinish,
}: {
  treatment: CompactTreatment;
  onBack: () => void;
  onFinish: () => void;
}) {
  const prompt = getAgentSetupPrompt(
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const copy = (
    <div className="[&>button]:h-11 [&>button]:w-full [&>button]:gap-2 [&>button]:text-sm">
      <CopyButton
        primary
        value={prompt}
        label="Copy setup prompt"
        successMessage="Setup prompt copied"
      />
    </div>
  );
  const manual = (
    <a
      href="https://openseo.so/docs/mcp"
      target="_blank"
      rel="noreferrer"
      className="text-xs text-base-content/60 underline decoration-base-content/25 underline-offset-4 hover:text-base-content"
    >
      Manual setup
    </a>
  );

  return (
    <div>
      {treatment === "panel" && <AgentSetupPanel prompt={prompt} />}
      {treatment === "simple" && (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Sightline plugin</span>
            <span className="rounded-md border border-base-300 px-2 py-1 text-xs text-base-content/60">
              MCP + skills
            </span>
          </div>
          {copy}
          <div className="mt-4 text-center">{manual}</div>
        </>
      )}
      {treatment === "preview" && (
        <>
          <div className="overflow-hidden rounded-xl border border-base-300">
            <div className="flex items-center justify-between gap-3 border-b border-base-300 bg-base-200/40 px-5 py-3.5">
              <span className="flex items-center gap-2 text-xs font-medium">
                <FileText className="size-3.5 text-base-content/60" /> Setup
                prompt
              </span>
              <span className="text-xs text-base-content/45">Sightline</span>
            </div>
            <div className="p-5">
              <p className="text-sm font-medium">
                Set up Sightline in this agent.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-base-content/60">
                Detect the agent. Install the plugin (MCP + skills).
                <br className="hidden sm:block" /> Guide me through sign-in and
                verify the connection.
              </p>
            </div>
            <div className="border-t border-base-300 p-4">{copy}</div>
          </div>
          <div className="mt-4 text-center">{manual}</div>
        </>
      )}
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-base-300 pt-5">
        <button
          type="button"
          className="flex min-h-10 items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-2"
          onClick={onFinish}
        >
          Go to dashboard <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
