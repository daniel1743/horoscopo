/**
 * YAML 12 — Tarjeta unificada para resultados y sugerencias.
 */
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEARCH_TYPE_ICONS, SEARCH_TYPE_LABELS } from "@/config/search";
import type { SearchResult } from "@/types/search";

export interface SearchResultCardProps {
  result: SearchResult;
  onNavigate?: (result: SearchResult) => void;
  variant?: "list" | "row";
}

export function SearchResultCard({ result, onNavigate, variant = "list" }: SearchResultCardProps) {
  const label = SEARCH_TYPE_LABELS[result.sourceType];
  const icon = SEARCH_TYPE_ICONS[result.sourceType];
  return (
    <Link
      to={result.routePath}
      onClick={() => onNavigate?.(result)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        variant === "row" && "border-transparent bg-transparent px-3 py-2 hover:bg-muted/50",
      )}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Icon name={icon} size="sm" decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 flex items-center gap-2">
          <Badge variant="neutral" className="text-[10px] uppercase tracking-wide">
            {label}
          </Badge>
        </span>
        <span className="block truncate font-serif text-base text-foreground group-hover:text-primary">
          {result.title}
        </span>
        {result.excerpt && (
          <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
            {result.excerpt}
          </span>
        )}
      </span>
    </Link>
  );
}
