import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import type { CommunityPostType } from "@/lib/account/repository";

interface Props {
  postType: CommunityPostType;
  title: string;
  body: string;
  sourceRef: string;
  sourceTitle: string;
  sourceUrl: string;
  variant?: "outline" | "dark";
}

export function ShareReadingButton({
  postType,
  title,
  body,
  sourceRef,
  sourceTitle,
  sourceUrl,
  variant = "outline",
}: Props) {
  return (
    <Button asChild type="button" variant={variant}>
      <Link
        to={routes.community}
        search={{
          shareType: postType,
          shareTitle: title,
          shareBody: body,
          shareSourceRef: sourceRef,
          shareSourceTitle: sourceTitle,
          shareSourceUrl: sourceUrl,
        }}
      >
        <Icon name="share" aria-hidden />
        Compartir en el muro
      </Link>
    </Button>
  );
}
