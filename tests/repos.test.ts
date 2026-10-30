import { describe, expect, it } from "vitest";

import { byOwner, formatNumber, hasTodo, hasUnreleased, reposOf, selectRepos, shownNumbers } from "../src/repos";
import type { GithubReposCardConfig } from "../src/types";
import { fakeHass } from "./fixture";

const CONFIG: GithubReposCardConfig = { type: "custom:github-repos-card" };

const HASS = fakeHass([
    { fullName: "matti/sauna_sensor", release: "v1.2.0", numbers: { issues_count: 2, stargazers_count: 14 } },
    { fullName: "example-org/Aurora-card", release: "v2.0.0", unreleased: true },
    { fullName: "matti/heating", numbers: { pulls_count: 1, forks_count: "unavailable" } },
    { fullName: "matti/aurora-card", release: "v0.3.1" },
]);

describe("byOwner", () => {
    it("groups the repos by their owner, whatever its case, the owners in alphabetical order", () => {
        const groups = byOwner(reposOf(fakeHass([{ fullName: "matti/b" }, { fullName: "Zed/a" }, { fullName: "Matti/a" }])));
        expect(groups.map(({ owner, repos }) => [owner, repos.map((repo) => repo.name)])).toEqual([
            ["Matti", ["a", "b"]],
            ["Zed", ["a"]],
        ]);
    });
});

describe("reposOf", () => {
    it("finds every repo by its device and keys, leaving out the user device", () => {
        expect(reposOf(HASS).map((repo) => repo.fullName)).toEqual([
            "example-org/Aurora-card",
            "matti/aurora-card",
            "matti/heating",
            "matti/sauna_sensor",
        ]);
    });

    it("sorts by the repo's name whatever its case or owner, and by the owner when names are alike", () => {
        // An owner late in the alphabet with a name early in it: sorting by owner/repo would put it last.
        const hass = fakeHass([{ fullName: "matti/lake_level" }, { fullName: "zz-org/alpha" }, { fullName: "AA-org/Lake_level" }]);
        expect(reposOf(hass).map((repo) => repo.fullName)).toEqual(["zz-org/alpha", "AA-org/Lake_level", "matti/lake_level"]);
    });

    it("reads the numbers, the version and the link", () => {
        const sauna = reposOf(HASS).find((repo) => repo.name === "sauna_sensor");
        expect(sauna).toMatchObject({
            owner: "matti",
            url: "https://github.com/matti/sauna_sensor",
            version: "v1.2.0",
            unreleased: false,
            numbers: { issues_count: 2, pulls_count: 0, stargazers_count: 14, forks_count: 0, subscribers_count: 1 },
        });
        expect(sauna?.entity).toBe("sensor.github_matti_sauna_sensor_viimeisin_julkaisu");
    });

    it("leaves out a number whose sensor is unavailable or not in the registry", () => {
        expect(reposOf(HASS).find((repo) => repo.name === "heating")?.numbers).not.toHaveProperty("forks_count");
        const hass = fakeHass([{ fullName: "matti/heating", missing: ["stargazers_count"] }]);
        expect(reposOf(hass)[0].numbers).not.toHaveProperty("stargazers_count");
    });

    it("gives a repo with no release no version, never commits after one, and its latest commit for more-info", () => {
        const heating = reposOf(HASS).find((repo) => repo.name === "heating");
        expect(heating?.version).toBeUndefined();
        expect(heating?.unreleased).toBe(false);
        expect(heating?.entity).toBe("sensor.github_matti_heating_viimeisin_solmu");
    });
});

describe("hasUnreleased", () => {
    const tag = (url: unknown) => ({ entity_id: "sensor.tag", state: "v1.0.0", last_changed: "", attributes: { url } });
    const commit = (sha: unknown) => ({ entity_id: "sensor.commit", state: "Fix", last_changed: "", attributes: { sha } });
    const SHA = "abcdef0123456789abcdef0123456789abcdef01";

    it("is true when main's head isn't the newest tag's commit", () => {
        expect(hasUnreleased(tag(`https://github.com/o/r/commit/${SHA}`), commit("0".repeat(40)))).toBe(true);
    });

    it("is false when they are the same commit, whatever the case of the hash", () => {
        expect(hasUnreleased(tag(`https://github.com/o/r/commit/${SHA.toUpperCase()}`), commit(SHA))).toBe(false);
    });

    it("is false when either is unknown", () => {
        expect(hasUnreleased(undefined, commit(SHA))).toBe(false);
        expect(hasUnreleased(tag(`https://github.com/o/r/commit/${SHA}`), undefined)).toBe(false);
        expect(hasUnreleased(tag("https://github.com/o/r/releases/tag/v1.0.0"), commit(SHA))).toBe(false);
        expect(hasUnreleased(tag(`https://github.com/o/r/commit/${SHA}`), commit(42))).toBe(false);
    });
});

describe("selectRepos", () => {
    const repos = reposOf(HASS);

    it("shows every repo by default", () => {
        expect(selectRepos(repos, CONFIG)).toEqual({ shown: repos, missing: [] });
    });

    it("limits to the listed repos, whatever their case, and names the ones not followed", () => {
        const { shown, missing } = selectRepos(repos, { ...CONFIG, repos: ["MATTI/heating", " matti/sauna_sensor ", "matti/nothing"] });
        expect(shown.map((repo) => repo.name)).toEqual(["heating", "sauna_sensor"]);
        expect(missing).toEqual(["matti/nothing"]);
    });

    it("leaves out the excluded, from the listed ones too", () => {
        expect(selectRepos(repos, { ...CONFIG, exclude: ["example-org/aurora-card"] }).shown).toHaveLength(3);
        const { shown, missing } = selectRepos(repos, {
            ...CONFIG,
            repos: ["matti/heating", "matti/gone"],
            exclude: ["matti/heating", "matti/gone"],
        });
        expect(shown).toEqual([]);
        expect(missing).toEqual([]);
    });
});

describe("hasTodo", () => {
    const byName = (name: string) => reposOf(HASS).find((repo) => repo.fullName === name)!;

    it("counts open issues, open pull requests and commits after the release", () => {
        expect(hasTodo(byName("matti/sauna_sensor"), CONFIG)).toBe(true);
        expect(hasTodo(byName("matti/heating"), CONFIG)).toBe(true);
        expect(hasTodo(byName("example-org/Aurora-card"), CONFIG)).toBe(true);
        expect(hasTodo(byName("matti/aurora-card"), CONFIG)).toBe(false);
    });

    it("leaves out what is turned off", () => {
        expect(hasTodo(byName("matti/sauna_sensor"), { ...CONFIG, todo_issues: false })).toBe(false);
        expect(hasTodo(byName("matti/heating"), { ...CONFIG, todo_pull_requests: false })).toBe(false);
        expect(hasTodo(byName("example-org/Aurora-card"), { ...CONFIG, todo_unreleased: false })).toBe(false);
    });

    it("never calls a repo with no known numbers quiet, as when GitHub can't be reached", () => {
        const all = ["issues_count", "pulls_count", "stargazers_count", "forks_count", "subscribers_count"];
        const hass = fakeHass([{ fullName: "matti/heating", numbers: Object.fromEntries(all.map((key) => [key, "unavailable"])) }]);
        expect(hasTodo(reposOf(hass)[0], CONFIG)).toBe(true);
    });
});

describe("shownNumbers", () => {
    it("shows issues, pull requests, stars, forks and watchers by default, in their order", () => {
        expect(shownNumbers(CONFIG).map(({ key }) => key)).toEqual([
            "issues_count",
            "pulls_count",
            "stargazers_count",
            "forks_count",
            "subscribers_count",
        ]);
    });

    it("turns each one on or off", () => {
        const keys = shownNumbers({ ...CONFIG, show_stars: false, show_downloads: true, show_discussions: true }).map(({ key }) => key);
        expect(keys).toEqual([
            "issues_count",
            "pulls_count",
            "discussions_count",
            "forks_count",
            "subscribers_count",
            "latest_release_downloads",
        ]);
    });
});

describe("formatNumber", () => {
    it("is whole below a thousand and shortened above, in the viewer's language", () => {
        expect(formatNumber(0, "en")).toBe("0");
        expect(formatNumber(999, "fi")).toBe("999");
        expect(formatNumber(1234, "en")).toBe("1.2K");
        expect(formatNumber(1234, "fi").replace(/\s/g, " ")).toBe("1,2 t.");
    });

    it("takes a language written by hand, and doesn't throw on one Intl doesn't know", () => {
        expect(formatNumber(1234, "fi_FI").replace(/\s/g, " ")).toBe("1,2 t.");
        expect(formatNumber(5, "not a language")).toBe("5");
    });
});
