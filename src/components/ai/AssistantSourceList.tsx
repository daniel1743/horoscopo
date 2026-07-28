import type { AiSource } from "@/types/ai";
import { Link } from "@tanstack/react-router";

interface Props {
  sources: AiSource[];
}

export function AssistantSourceList({ sources }: Props) {
  return (
    <details className="rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-3">
      <summary className="cursor-pointer font-body text-[13px] font-medium text-ink">
        Fuentes utilizadas ({sources.length})
      </summary>
      <ul className="mt-2 flex flex-col gap-1">
        {sources.slice(0, 4).map((s, i) => (
          <li key={`${s.title}-${i}`} className="font-body text-[13px] text-ink-soft">
            {s.url ? (
              <Link to={s.url} className="text-cosmic hover:underline">
                {s.title}
              </Link>
            ) : (
              s.title
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
