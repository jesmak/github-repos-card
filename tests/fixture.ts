import type { HassEntity, HassEntityEntry, HomeAssistant } from "../src/hass";

/** A made-up repo as the GitHub integration leaves it: a device and a sensor per key, in Finnish as at a Finnish install. */
export interface FakeRepo {
    fullName: string;
    numbers?: Partial<Record<string, number | "unavailable">>;
    /** The latest release's tag, none when the repo has no release. */
    release?: string;
    /** Whether main has a commit after the newest tag. */
    unreleased?: boolean;
    /** Leaves a sensor out of the registry, as when it is disabled. */
    missing?: string[];
}

const TAG_SHA = "1111111111111111111111111111111111111111";
const HEAD_SHA = "2222222222222222222222222222222222222222";

const FINNISH: Record<string, string> = {
    issues_count: "seikat",
    pulls_count: "vetopyynnot",
    merged_pulls_count: "merged_pull_requests",
    discussions_count: "keskustelut",
    stargazers_count: "tahdet",
    forks_count: "haaraumat",
    subscribers_count: "seuraajat",
    latest_release_downloads: "latest_release_downloads",
    latest_release: "viimeisin_julkaisu",
    latest_tag: "viimeisin_tunniste",
    latest_commit: "viimeisin_solmu",
};

export function fakeHass(repos: FakeRepo[], language = "fi"): HomeAssistant {
    const states: Record<string, HassEntity> = {};
    const entities: Record<string, HassEntityEntry> = {};
    const devices: HomeAssistant["devices"] = {};
    const add = (deviceId: string, prefix: string, key: string, state: string, attributes: Record<string, unknown> = {}) => {
        const entityId = `sensor.github_${prefix}_${FINNISH[key] ?? key}`;
        entities[entityId] = { entity_id: entityId, device_id: deviceId, platform: "github", translation_key: key };
        states[entityId] = { entity_id: entityId, state, last_changed: "2026-10-19T06:00:00+00:00", attributes };
    };

    // The integration's user device, which isn't a repo.
    devices["device-user"] = { id: "device-user", name: "matti" };
    add("device-user", "matti", "followers", "3");

    repos.forEach((repo, index) => {
        const deviceId = `device-${index}`;
        const prefix = repo.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        devices[deviceId] = { id: deviceId, name: repo.fullName };
        for (const [key, value] of Object.entries({
            issues_count: 0,
            pulls_count: 0,
            stargazers_count: 0,
            forks_count: 0,
            subscribers_count: 1,
            ...repo.numbers,
        })) {
            add(deviceId, prefix, key, String(value));
        }
        if (repo.release) {
            add(deviceId, prefix, "latest_release", repo.release.replace(/^v/, ""), {
                tag: repo.release,
                url: `https://github.com/${repo.fullName}/releases/tag/${repo.release}`,
            });
            add(deviceId, prefix, "latest_tag", repo.release, { url: `https://github.com/${repo.fullName}/commit/${TAG_SHA}` });
        } else {
            add(deviceId, prefix, "latest_release", "unavailable");
            add(deviceId, prefix, "latest_tag", "unavailable");
        }
        const head = repo.unreleased ? HEAD_SHA : TAG_SHA;
        add(deviceId, prefix, "latest_commit", "Fix the sauna's temperature", {
            sha: head,
            url: `https://github.com/${repo.fullName}/commit/${head}`,
        });
        for (const key of repo.missing ?? []) {
            delete entities[`sensor.github_${prefix}_${FINNISH[key] ?? key}`];
        }
    });
    return { states, entities, devices, locale: { language }, language };
}
