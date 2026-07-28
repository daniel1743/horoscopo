/**
 * YAML 12 — Trigger que abre SearchDialog en desktop y navega a /buscar en móvil.
 */
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { SearchDialog, useSearchDialogShortcut } from "./SearchDialog";
import { routes } from "@/config/routes";
import { copy } from "@/config/copy";

export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useSearchDialogShortcut((v) => {
    if (isDesktop) setOpen(v);
    else navigate({ to: routes.search });
  });

  if (!isDesktop) {
    return (
      <Link
        to={routes.search}
        aria-label={copy.actions.search}
        className={className}
      >
        <Icon name="search" size="md" />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={copy.actions.search}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Icon name="search" size="md" />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
