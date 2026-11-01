import type { NumberKey } from "./const";
import type { LovelaceCardConfig } from "./hass";
import type { RowStepConfig } from "./rows";

export interface GithubReposCardConfig extends LovelaceCardConfig, RowStepConfig {
    title?: string;
    /** Only these repos, as `owner/repo`. */
    repos?: string[];
    /** All but these, as `owner/repo`. */
    exclude?: string[];
    show_issues?: boolean;
    show_pull_requests?: boolean;
    show_merged_pull_requests?: boolean;
    show_discussions?: boolean;
    show_stars?: boolean;
    show_forks?: boolean;
    show_watchers?: boolean;
    show_downloads?: boolean;
    fold_quiet?: boolean;
    todo_issues?: boolean;
    todo_pull_requests?: boolean;
    todo_unreleased?: boolean;
    tap?: "github" | "more_info";
    /** The card's own language, in place of Home Assistant's. */
    language?: string;
}

/** One followed repo, put together from its device's sensors. */
export interface Repo {
    owner: string;
    name: string;
    /** `owner/repo`, as the device is named. */
    fullName: string;
    url: string;
    /** The latest release's tag, none when the repo has no release. */
    version?: string;
    /** Main has commits after the newest tag. */
    unreleased: boolean;
    /** A number is missing when its sensor is unavailable or disabled. */
    numbers: Partial<Record<NumberKey, number>>;
    /** The sensor more-info opens on a tap. */
    entity: string;
}
