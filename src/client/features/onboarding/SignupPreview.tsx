import { AGENT_SETUP_DESCRIPTION } from "@/client/features/ai-mcp/AgentSetupPanel";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Moon, Sun } from "lucide-react";
import { CopyButton } from "@/client/features/ai-mcp/SetupControls";
import { getAgentSetupPrompt } from "@/client/features/ai-mcp/agentSetupPrompt";
import { SignupPreviewLayout, type PreviewDesign } from "./SignupPreviewLayout";
import { INTEREST_OPTIONS, ONBOARDING_OPTION_LABELS } from "./onboardingModel";
import {
  CompactAgentPrompt,
  type CompactTreatment,
} from "./CompactAgentPrompt";

const DESIGNS = [
  { id: "quiet", label: "01 Quiet" },
  { id: "split", label: "02 Split" },
  { id: "compact", label: "03 Compact" },
  { id: "editorial", label: "04 Editorial" },
  { id: "workspace", label: "05 Workspace" },
] as const;

type Screen = "goal" | "agent" | "prompt" | "done";
type PreviewSearch = {
  design: PreviewDesign;
  screen: Screen;
  treatment: CompactTreatment;
};

export function SignupPreview({
  design,
  screen,
  treatment,
  onChange,
}: PreviewSearch & {
  onChange: (search: PreviewSearch) => void;
}) {
  const [dark, setDark] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const go = (next: Screen) => onChange({ design, screen: next, treatment });
  const step = screen === "goal" ? 1 : 2;
  const title =
    screen === "goal"
      ? "What brings you here?"
      : screen === "agent"
        ? "Already use an AI agent?"
        : screen === "prompt"
          ? "Set up your agent"
          : "You're ready to go.";
  const subtitle =
    screen === "goal"
      ? "Pick up to three things you want to work on."
      : screen === "agent"
        ? "Like Claude, ChatGPT Desktop, or Grok Bot."
        : screen === "prompt"
          ? AGENT_SETUP_DESCRIPTION
          : "Your dashboard is next. Finish your project setup there.";

  const content = (
    <div className="space-y-7">
      {screen === "goal" && (
        <>
          <div
            className={
              design === "compact"
                ? "flex flex-wrap gap-2"
                : design === "split" || design === "workspace"
                  ? "grid gap-3 sm:grid-cols-2"
                  : "grid gap-0"
            }
          >
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={selected}
                  disabled={!selected && interests.length >= 3}
                  onClick={() =>
                    setInterests(
                      selected
                        ? interests.filter((value) => value !== interest)
                        : [...interests, interest],
                    )
                  }
                  className={`flex items-center gap-3 text-left text-sm transition-colors disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-primary ${
                    design === "compact"
                      ? "rounded-full border px-4 py-2.5"
                      : design === "quiet" || design === "editorial"
                        ? "border-b border-base-300 py-4"
                        : "rounded-lg border p-4"
                  } ${selected ? "border-primary text-primary bg-primary/5" : "border-base-300 hover:bg-base-200"}`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${selected ? "border-primary bg-primary text-primary-content" : "border-base-content/30"}`}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  <span className="capitalize">
                    {ONBOARDING_OPTION_LABELS[interest] ?? interest}
                  </span>
                </button>
              );
            })}
          </div>
          {interests.includes("Other") && (
            <input
              aria-label="What else would you like to work on?"
              className="input input-bordered w-full"
              placeholder="What else would you like to work on?"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          )}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => go("agent")}
            >
              Skip
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={interests.length === 0}
              onClick={() => go("agent")}
            >
              Continue <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      )}
      {screen === "agent" && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex min-h-10 items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content"
            onClick={() => go("goal")}
          >
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-outline min-w-16"
              onClick={() => go("done")}
            >
              No
            </button>
            <button
              type="button"
              className="btn btn-primary min-w-24"
              onClick={() => go("prompt")}
            >
              Yes <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
      {screen === "prompt" && design === "compact" && (
        <CompactAgentPrompt
          treatment={treatment}
          onBack={() => go("agent")}
          onFinish={() => go("done")}
        />
      )}
      {screen === "prompt" && design !== "compact" && (
        <>
          <div
            className={
              design === "workspace" || design === "split"
                ? "rounded-xl border border-base-300 bg-base-200/40 p-6"
                : ""
            }
          >
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-base-content/55">
              <span>Sightline plugin</span>
              <span aria-hidden="true">·</span>
              <span>MCP + skills</span>
            </div>
            <CopyButton
              primary
              value={getAgentSetupPrompt(
                typeof window === "undefined" ? "" : window.location.origin,
              )}
              label="Copy setup prompt"
              successMessage="Setup prompt copied"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 pt-6">
            <a
              href="https://openseo.so/docs/mcp"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-base-content/60 underline underline-offset-4 hover:text-base-content"
            >
              Manual setup
            </a>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => go("done")}
            >
              Go to dashboard <ArrowRight className="size-4" />
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-base-content/50 hover:text-base-content"
            onClick={() => go("agent")}
          >
            <ArrowLeft className="size-3" /> Change answer
          </button>
        </>
      )}
      {screen === "done" && (
        <div className="space-y-5">
          <p className="rounded-lg bg-base-200 p-4 text-sm text-base-content/60">
            Preview complete. No answers have been saved.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setInterests([]);
              setOther("");
              go("goal");
            }}
          >
            Restart preview <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div
      data-theme={dark ? "openseo-dark" : "openseo"}
      className="min-h-screen bg-base-100 text-base-content"
    >
      <nav
        aria-label="Preview controls"
        className="border-b border-base-300 bg-base-200 px-4 py-3"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <span className="mr-3 text-xs font-semibold text-base-content/50">
            ONBOARDING EXPLORATIONS
          </span>
          {DESIGNS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={design === option.id}
              className={`btn btn-sm ${design === option.id ? "btn-neutral" : "btn-ghost"}`}
              onClick={() => onChange({ design: option.id, screen, treatment })}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm ml-auto"
            aria-label={dark ? "Light theme" : "Dark theme"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
        <div className="mx-auto mt-2 flex max-w-7xl flex-wrap items-center gap-2">
          {(
            [
              ["goal", "Earlier question"],
              ["agent", "Agent question"],
              ["prompt", "Copy prompt"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={screen === value}
              className={`rounded px-2 py-1 text-xs ${screen === value ? "bg-base-300 text-base-content" : "text-base-content/50 hover:text-base-content"}`}
              onClick={() => go(value)}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-base-content/40">
            Interactive preview · No answers saved
          </span>
        </div>
      </nav>
      {design === "compact" && (
        <div
          aria-label="Compact variations"
          className="flex flex-wrap justify-center gap-2 border-b border-base-300 bg-base-200/50 px-4 py-3"
        >
          {(
            [
              ["panel", "A · Unified panel"],
              ["simple", "B · Simple action"],
              ["preview", "C · Prompt preview"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={treatment === value}
              className={`btn btn-sm ${treatment === value ? "btn-neutral" : "btn-ghost"}`}
              onClick={() => onChange({ design, screen, treatment: value })}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <SignupPreviewLayout
        design={design}
        step={step}
        title={title}
        subtitle={subtitle}
        go={go}
      >
        {content}
      </SignupPreviewLayout>
    </div>
  );
}
