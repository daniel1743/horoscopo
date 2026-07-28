import { createFileRoute } from "@tanstack/react-router";
import { PrivacySettingsPage } from "@/pages/account/PrivacySettingsPage";
export const Route = createFileRoute("/_authenticated/mi-espacio/privacidad")({
  head: () => ({ meta: [{ title: "Privacidad — Mi espacio" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: PrivacySettingsPage,
});
