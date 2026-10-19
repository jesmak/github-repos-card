/** Replaced at build time with the version in package.json. */
declare const __CARD_VERSION__: string;

export const CARD_VERSION = __CARD_VERSION__;

/** The numbers a repo can show, in the order of their columns, each with its sensor's key in the GitHub integration. */
export const NUMBERS = [
    { option: "show_issues", key: "issues_count", icon: "mdi:alert-circle-outline", shown: true },
    { option: "show_pull_requests", key: "pulls_count", icon: "mdi:source-pull", shown: true },
    { option: "show_merged_pull_requests", key: "merged_pulls_count", icon: "mdi:source-merge", shown: false },
    { option: "show_discussions", key: "discussions_count", icon: "mdi:forum-outline", shown: false },
    { option: "show_stars", key: "stargazers_count", icon: "mdi:star-outline", shown: true },
    { option: "show_forks", key: "forks_count", icon: "mdi:source-fork", shown: true },
    { option: "show_watchers", key: "subscribers_count", icon: "mdi:eye-outline", shown: true },
    { option: "show_downloads", key: "latest_release_downloads", icon: "mdi:download-outline", shown: false },
] as const;

export type NumberKey = (typeof NUMBERS)[number]["key"];

/** What counts as something to do, each on unless turned off. */
export const TODOS = ["todo_issues", "todo_pull_requests", "todo_unreleased"] as const;

export const DEFAULT_TAP = "github";
