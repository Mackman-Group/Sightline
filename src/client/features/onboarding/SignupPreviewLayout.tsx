import { OnboardingCard } from "./OnboardingCard";
import type { ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";

export type PreviewDesign =
  | "quiet"
  | "split"
  | "compact"
  | "editorial"
  | "workspace";

export function SignupPreviewLayout({
  design,
  step,
  title,
  subtitle,
  go,
  children,
}: {
  design: PreviewDesign;
  step: number;
  title: string;
  subtitle: string;
  go: (screen: "goal" | "agent") => void;
  children: ReactNode;
}) {
  const heading = (
    <div className="mb-8">
      <h1
        className={`font-semibold tracking-tight text-balance ${design === "editorial" ? "text-4xl leading-tight md:text-6xl" : design === "compact" ? "text-2xl" : "text-3xl leading-tight md:text-4xl"}`}
      >
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-base-content/60">
        {subtitle}
      </p>
    </div>
  );
  const brand = (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <img src="/transparent-logo.png" alt="" className="size-7" />
      Sightline
    </div>
  );
  const milestones = (
    <div className="flex gap-2 md:block md:space-y-3">
      {["Your goals", "Your agent"].map((label, index) => (
        <button
          key={label}
          type="button"
          onClick={() => go(index === 0 ? "goal" : "agent")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${step === index + 1 ? "bg-primary/10 text-primary" : "text-base-content/45 hover:bg-base-200"}`}
        >
          <span className="flex size-6 items-center justify-center rounded-full border border-current text-xs">
            {step > index + 1 ? <Check className="size-3" /> : index + 1}
          </span>
          {label}
        </button>
      ))}
    </div>
  );
  switch (design) {
    case "quiet":
      return (
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-12">
          {brand}
          <main className="mx-auto max-w-lg pb-16 pt-16 md:pt-24">
            <p className="mb-8 text-xs text-base-content/40">{step} / 2</p>
            {heading}
            {children}
          </main>
        </div>
      );
    case "split":
      return (
        <div className="grid min-h-[calc(100svh-110px)] md:grid-cols-[minmax(260px,0.8fr)_1.4fr]">
          <aside className="flex flex-col border-b border-base-300 bg-base-200/60 p-8 md:border-b-0 md:border-r md:p-12">
            {brand}
            <div className="my-auto pt-5 md:max-w-xs md:py-10">
              <p className="mb-8 hidden text-3xl font-semibold leading-tight tracking-tight md:block">
                Good SEO starts
                <br />
                with your next step.
              </p>
              {milestones}
            </div>
            <p className="hidden text-xs text-base-content/40 md:block">
              Your website setup comes next, on the dashboard.
            </p>
          </aside>
          <main className="m-auto w-full max-w-xl px-6 py-12 md:px-12">
            {heading}
            {children}
          </main>
        </div>
      );
    case "compact":
      return (
        <div className="flex min-h-[calc(100svh-110px)] justify-center bg-base-200/50 px-5">
          <OnboardingCard step={step} total={2}>
            {heading}
            {children}
          </OnboardingCard>
        </div>
      );
    case "editorial":
      return (
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-16">
          <div className="flex items-center justify-between border-b border-base-300 pb-6">
            {brand}
            <span className="text-xs uppercase tracking-widest text-base-content/40">
              Make it yours
            </span>
          </div>
          <main className="grid gap-10 py-12 md:grid-cols-2 md:gap-20 md:py-24">
            <div>
              <p className="mb-8 text-7xl font-light tracking-tighter text-primary/40 md:text-8xl">
                0{step}
                <span className="text-xl text-base-content/30"> / 02</span>
              </p>
              {heading}
            </div>
            <div className="md:pt-8">{children}</div>
          </main>
        </div>
      );
    case "workspace":
      return (
        <div className="min-h-[calc(100svh-110px)] bg-base-200/40">
          <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-6 py-4">
            {brand}
            <span className="text-xs text-base-content/45">
              Workspace setup
            </span>
          </header>
          <div className="mx-auto grid max-w-6xl md:grid-cols-[240px_1fr]">
            <aside className="border-b border-base-300 p-5 md:min-h-[650px] md:border-b-0 md:border-r md:py-10">
              <p className="mb-4 hidden px-3 text-xs font-medium text-base-content/40 md:block">
                GET STARTED
              </p>
              {milestones}
              <p className="mt-8 hidden px-3 text-xs leading-relaxed text-base-content/40 md:block">
                Next: add your website, connect Search Console, and invite your
                team.
              </p>
            </aside>
            <main className="p-6 md:p-12">
              <div className="mb-8 flex items-center gap-2 text-xs text-base-content/45">
                Your workspace <ChevronRight className="size-3" />{" "}
                {step === 1 ? "Your goals" : "Your agent"}
              </div>
              <div className="max-w-2xl rounded-xl border border-base-300 bg-base-100 p-6 md:p-8">
                {heading}
                {children}
              </div>
            </main>
          </div>
        </div>
      );
  }
}
