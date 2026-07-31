import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountSidebar } from "./AccountSidebar";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Layout compartido para todas las páginas de Mi espacio. */
export function AccountShell({ title, description, children }: Props) {
  return (
    <PageShell>
      <PageHeader eyebrow="Mi espacio" title={title} description={description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <AccountSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}
