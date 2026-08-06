import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/luna/fases")({
  component: () => <Outlet />,
});
