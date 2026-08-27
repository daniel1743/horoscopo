import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const cache = new Map();

async function source(relativePath) {
  if (!cache.has(relativePath)) {
    cache.set(relativePath, await readFile(resolve(root, relativePath), "utf8"));
  }
  return cache.get(relativePath);
}

const checks = [
  {
    name: "astrology repository exposes private CRUD",
    file: "src/lib/astrology/profile-repository.ts",
    patterns: [
      "fetchPersistedAstrologyBirthData",
      "savePersistedAstrologyBirthData",
      "clearPersistedAstrologyBirthData",
      "birth_timezone",
      "birth_latitude",
      "birth_longitude",
    ],
  },
  {
    name: "profile renders private astrology section",
    file: "src/pages/account/ProfilePage.tsx",
    patterns: ["AstrologyProfileSection"],
  },
  {
    name: "public newsletter requires consent and server function",
    file: "src/lib/newsletter/public-newsletter.functions.ts",
    patterns: ["consent", "backend_not_configured", "createServerFn", "UnsubscribeInput"],
  },
  {
    name: "public newsletter UI is separate from account preference",
    file: "src/components/home/HomeNewsletterSection.tsx",
    patterns: ["PublicNewsletterForm"],
    absent: ["useNewsletterSubscription"],
  },
  {
    name: "newsletter unsubscribe route is noindex",
    file: "src/routes/newsletter.unsubscribe.tsx",
    patterns: ["/newsletter/unsubscribe", 'name: "robots"', "noindex, nofollow"],
  },
  {
    name: "community feed has bounded incremental loading",
    file: "src/pages/community/CommunityFeedPage.tsx",
    patterns: ["setLimit(50)", "canLoadMore", "isFetching"],
  },
  {
    name: "community mutations guard duplicate submits",
    file: "src/components/community/CommunityPostActions.tsx",
    patterns: ["if (busy) return;"],
  },
  {
    name: "community composer and reports guard duplicate submits",
    file: "src/components/community/CommunityPostComposer.tsx",
    patterns: ["if (busy) return;"],
  },
  {
    name: "public profile distinguishes backend outage",
    file: "src/routes/perfil.$username.tsx",
    patterns: ["backendUnavailable", '"noindex,nofollow"'],
  },
  {
    name: "admin metrics and moderation expose safe empty/error states",
    file: "src/routes/_authenticated/admin/index.tsx",
    patterns: ["metricsQuery.isError", "metricsQuery.isLoading"],
  },
  {
    name: "moderation has protected actions and error state",
    file: "src/pages/admin/CommunityModerationPage.tsx",
    patterns: ["listOpenCommunityReports", "query.isError", "window.confirm"],
  },
];

const failures = [];
for (const check of checks) {
  const content = await source(check.file);
  const missing = (check.patterns ?? []).filter((pattern) => !content.includes(pattern));
  const presentWhenAbsent = (check.absent ?? []).filter((pattern) => content.includes(pattern));
  if (missing.length || presentWhenAbsent.length) {
    failures.push({ ...check, missing, presentWhenAbsent });
  }
}

const result = {
  checked: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
