export function SetBuilderPreviewPane() {
  return (
    <section className="grid h-full min-h-[28rem] place-items-center border-l border-border/70 px-6 py-8 text-center">
      <div className="grid gap-2">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Preview
        </span>
        <p className="m-0 text-lg font-semibold text-foreground">
          Preview stub
        </p>
      </div>
    </section>
  );
}
