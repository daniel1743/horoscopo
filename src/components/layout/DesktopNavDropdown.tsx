import { useEffect, useId, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { routes } from "@/config/routes";
import type { NavGroup } from "@/config/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  group: NavGroup;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/** Dropdown accesible de escritorio. Click para abrir; teclado ArrowDown/Enter/Space. */
export function DesktopNavDropdown({ group, isOpen, onOpen, onClose }: Props) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parentPath = routes[group.routeKey];
  const isActive =
    pathname === parentPath ||
    (parentPath !== "/" && pathname.startsWith(parentPath + "/")) ||
    (group.children?.some((c) => pathname === routes[c.routeKey]) ?? false);

  // Cierre por click exterior / Escape
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Focus primer item al abrir
  useEffect(() => {
    if (isOpen) {
      const first = panelRef.current?.querySelector<HTMLAnchorElement>("[data-menu-item]");
      first?.focus();
    }
  }, [isOpen]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-menu-item]") ?? [],
    );
    const idx = items.indexOf(e.currentTarget);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={cn(
          "inline-flex h-11 items-center gap-1 rounded-[var(--radius-control)] px-3 font-body text-[14px] font-medium transition-colors",
          isActive
            ? "bg-brand-soft text-brand"
            : "text-ink-soft hover:bg-brand-soft hover:text-ink",
        )}
      >
        <span>{group.label}</span>
        <Icon
          name="expand"
          size="sm"
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 min-w-[280px] max-w-[360px] rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-2 shadow-floating"
        >
          <Link
            to={parentPath}
            role="menuitem"
            data-menu-item
            onKeyDown={handleItemKeyDown}
            onClick={onClose}
            className="block rounded-[var(--radius-control)] px-3 py-2 font-body text-[14px] font-medium text-brand hover:bg-brand-soft"
          >
            Ver todo · {group.label}
          </Link>
          <div className="my-1 h-px bg-line-subtle" />
          {group.children?.map((child) => (
            <Link
              key={child.routeKey}
              to={routes[child.routeKey]}
              role="menuitem"
              data-menu-item
              onKeyDown={handleItemKeyDown}
              onClick={onClose}
              className="block rounded-[var(--radius-control)] px-3 py-2 hover:bg-brand-soft"
            >
              <span className="block font-body text-[14px] font-medium text-ink">
                {child.label}
              </span>
              {child.description && (
                <span className="mt-0.5 block font-body text-[12px] text-ink-soft">
                  {child.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
