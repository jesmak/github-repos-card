/**
 * The repos as the GitHub integration leaves them: a device per repo, named `owner/repo`, with a sensor per number
 * and per latest thing. Sensors are found by their device and translation key, never by entity ID, which Home
 * Assistant writes in the install's language (`sensor.owner_repo_seikat`).
 */
import { NUMBERS } from "./const";
import type { NumberKey } from "./const";
import type { HassEntity, HomeAssistant } from "./hass";
import type { GithubReposCardConfig, Repo } from "./types";

/** A repo's device is named `owner/repo`. The integration's user device is named by the user alone, so it isn't one. */
const FULL_NAME = /^([^/\s]+)\/([^/\s]+)$/;

/** The commit a tag points to, from the link the integration gives for it. */
const COMMIT_URL = /\/commit\/([0-9a-f]{40})$/i;

/** The sensors of the GitHub integration, by device and translation key. */
export function githubSensors(hass: HomeAssistant): Map<string, Map<string, string>> {
    const devices = new Map<string, Map<string, string>>();
    for (const entry of Object.values(hass.entities ?? {})) {
        if (!entry || entry.platform !== "github" || !entry.device_id || !entry.translation_key) {
            continue;
        }
        const keys = devices.get(entry.device_id) ?? new Map<string, string>();
        keys.set(entry.translation_key, entry.entity_id);
        devices.set(entry.device_id, keys);
    }
    return devices;
}

/** Every repo the GitHub integration follows, alphabetical by its name. */
export function reposOf(hass: HomeAssistant): Repo[] {
    const repos: Repo[] = [];
    for (const [deviceId, keys] of githubSensors(hass)) {
        const match = FULL_NAME.exec(hass.devices?.[deviceId]?.name ?? "");
        if (!match) {
            continue;
        }
        const [fullName, owner, name] = match;
        const state = (key: string): HassEntity | undefined => known(hass.states[keys.get(key) ?? ""]);

        const numbers: Partial<Record<NumberKey, number>> = {};
        for (const { key } of NUMBERS) {
            const value = Number(state(key)?.state);
            if (state(key) && Number.isFinite(value)) {
                numbers[key] = value;
            }
        }

        const release = state("latest_release");
        const version = typeof release?.attributes.tag === "string" ? release.attributes.tag : undefined;
        repos.push({
            owner,
            name,
            fullName,
            url: `https://github.com/${fullName}`,
            version,
            unreleased: !!version && hasUnreleased(state("latest_tag"), state("latest_commit")),
            numbers,
            // A repo with no release would open on a sensor that only says it is unavailable.
            entity: (release ? keys.get("latest_release") : undefined) ?? keys.get("latest_commit") ?? [...keys.values()][0],
        });
    }
    return sortRepos(repos);
}

/**
 * Whether main has commits after the newest tag. The integration gives no commit for the latest release, only for the
 * newest tag by commit date, which is never older than the release's own. So commits after that tag are commits after
 * the release too, whichever tag the release has.
 */
export function hasUnreleased(tag: HassEntity | undefined, commit: HassEntity | undefined): boolean {
    const tagCommit = COMMIT_URL.exec(String(tag?.attributes.url ?? ""))?.[1];
    const head = commit?.attributes.sha;
    return !!tagCommit && typeof head === "string" && tagCommit.toLowerCase() !== head.toLowerCase();
}

/** Alphabetical by the repo's name, whatever its owner. */
export function sortRepos(repos: Repo[]): Repo[] {
    const compare = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
    return [...repos].sort((a, b) => compare(a.name, b.name) || compare(a.owner, b.owner));
}

/**
 * The repos the card shows: those in `repos` when it is given, less those in `exclude`. A repo in `repos` that isn't
 * followed is returned as missing, so the card can say so rather than leave it out without a word.
 */
export function selectRepos(repos: Repo[], config: GithubReposCardConfig): { shown: Repo[]; missing: string[] } {
    const key = (name: string) => name.trim().toLowerCase();
    const excluded = new Set((config.exclude ?? []).map(key));
    let shown = repos;
    let missing: string[] = [];
    if (config.repos?.length) {
        const wanted = new Set(config.repos.map(key));
        shown = repos.filter((repo) => wanted.has(key(repo.fullName)));
        const found = new Set(shown.map((repo) => key(repo.fullName)));
        missing = config.repos.filter((name) => !found.has(key(name)) && !excluded.has(key(name)));
    }
    return { shown: shown.filter((repo) => !excluded.has(key(repo.fullName))), missing };
}

/**
 * An open issue, an open pull request or commits after the last release, as far as each is counted. A repo with no
 * known numbers, as when the integration can't reach GitHub, is never quiet: folded away it would pass for all clear.
 */
export function hasTodo(repo: Repo, config: GithubReposCardConfig): boolean {
    if (!Object.keys(repo.numbers).length) {
        return true;
    }
    return (
        (config.todo_issues !== false && (repo.numbers.issues_count ?? 0) > 0) ||
        (config.todo_pull_requests !== false && (repo.numbers.pulls_count ?? 0) > 0) ||
        (config.todo_unreleased !== false && repo.unreleased)
    );
}

/** The number columns the card shows, in their order. */
export function shownNumbers(config: GithubReposCardConfig): (typeof NUMBERS)[number][] {
    return NUMBERS.filter(({ option, shown }) => (config[option] as boolean | undefined) ?? shown);
}

/** A number as it fits its column: whole below a thousand, shortened above, in the viewer's language ("1,2 t."). */
export function formatNumber(value: number, language: string): string {
    const options: Intl.NumberFormatOptions = value < 1000 ? {} : { notation: "compact", maximumFractionDigits: 1 };
    // A language written by hand, such as fi_FI, isn't a locale Intl accepts, and its error would stop the whole card.
    try {
        return new Intl.NumberFormat(language.replace(/_/g, "-"), options).format(value);
    } catch {
        return new Intl.NumberFormat(undefined, options).format(value);
    }
}

function known(entity: HassEntity | undefined): HassEntity | undefined {
    return entity && entity.state !== "unavailable" && entity.state !== "unknown" ? entity : undefined;
}
