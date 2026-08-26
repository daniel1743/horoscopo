import { Link } from "@tanstack/react-router";
import { profileRoute } from "@/config/routes";
import { getAuraStyle } from "@/config/profile";
import { communityPostTypeLabels } from "@/config/community";
import type { PublicCommunityPost } from "@/lib/account/repository";

interface Props {
  post: PublicCommunityPost;
  footer?: React.ReactNode;
}

export function CommunityPostCard({ post, footer }: Props) {
  const aura = getAuraStyle(post.author_aura_style);
  const authorName = post.author_display_name?.trim() || post.author_username;
  const dateLabel = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(post.created_at));

  return (
    <article className="rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-5 shadow-soft md:p-6">
      <div className="flex items-start gap-3">
        <Link
          to={profileRoute(post.author_username)}
          aria-label={`Ver perfil de ${authorName}`}
          className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${aura.className} text-sm font-semibold text-white ring-2 ring-white transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20`}
        >
          {post.author_avatar_url ? (
            <img src={post.author_avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              to={profileRoute(post.author_username)}
              className="font-body text-[14px] font-semibold text-ink hover:text-brand hover:underline"
            >
              {authorName}
            </Link>
            <span className="font-body text-[12px] text-ink-muted">@{post.author_username}</span>
            <span className="font-body text-[12px] text-ink-muted">· {dateLabel}</span>
          </div>
          <span className="mt-2 inline-flex rounded-full bg-brand-soft px-2.5 py-1 font-body text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
            {communityPostTypeLabels[post.post_type]}
          </span>
        </div>
      </div>

      <div className="mt-5">
        {post.title && (
          <h2 className="font-display text-[21px] font-semibold text-ink">{post.title}</h2>
        )}
        <p
          className={`${post.title ? "mt-2" : ""} whitespace-pre-wrap font-body text-[15px] leading-[1.75] text-ink`}
        >
          {post.body}
        </p>
        {post.source_url && post.source_title && (
          <Link
            to={post.source_url as never}
            className="mt-4 inline-flex max-w-full items-center gap-2 rounded-[var(--radius-control)] border border-line px-3 py-2 font-body text-[13px] font-medium text-brand hover:border-brand/40 hover:bg-brand-soft/30"
          >
            <span className="truncate">Relacionado: {post.source_title}</span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {footer && <div className="mt-5 border-t border-line-soft pt-4">{footer}</div>}
    </article>
  );
}
