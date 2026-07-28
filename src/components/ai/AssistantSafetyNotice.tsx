interface Props {
  notice: string;
}

export function AssistantSafetyNotice({ notice }: Props) {
  return (
    <div
      role="note"
      className="rounded-[var(--radius-card-md)] border border-warning/50 bg-warning/10 p-3 font-body text-[13px] leading-[1.6] text-ink"
    >
      {notice}
    </div>
  );
}
