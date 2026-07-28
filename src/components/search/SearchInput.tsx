/**
 * YAML 12 — SearchInput centralizado (usa Input + Icon).
 */
import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SEARCH_COPY, SEARCH_LIMITS } from "@/config/search";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  value: string;
  onValueChange: (v: string) => void;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onValueChange, onClear, className, placeholder, size = "md", autoFocus, ...rest }, ref) => {
    const showClear = value.length > 0;
    const heights: Record<string, string> = { sm: "h-10", md: "h-12", lg: "h-14 text-lg" };
    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <Icon
          name="search"
          size="sm"
          decorative
          className="pointer-events-none absolute left-4 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="search"
          role="searchbox"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          maxLength={SEARCH_LIMITS.maxQueryLength}
          aria-label={SEARCH_COPY.inputLabel}
          placeholder={placeholder ?? SEARCH_COPY.inputPlaceholder}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(heights[size], "rounded-full pl-11 pr-12")}
          {...rest}
        />
        {showClear && (
          <button
            type="button"
            aria-label={SEARCH_COPY.clearLabel}
            onClick={() => {
              onValueChange("");
              onClear?.();
            }}
            className="absolute right-3 rounded-full p-1 text-muted-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Icon name="close" size="sm" decorative />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
