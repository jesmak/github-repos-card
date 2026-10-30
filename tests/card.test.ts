import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/github-repos-card";
import type { GithubReposCard } from "../src/github-repos-card";
import type { HomeAssistant } from "../src/hass";
import { browserLanguage, translate } from "../src/localize/localize";
import type { GithubReposCardConfig } from "../src/types";
import { fakeHass } from "./fixture";

const HASS = fakeHass([
    { fullName: "matti/sauna_sensor", release: "v1.2.0", numbers: { issues_count: 2, stargazers_count: 1234 } },
    { fullName: "example-org/aurora-card", release: "v2.0.0", unreleased: true },
    { fullName: "matti/heating", numbers: { pulls_count: 1 } },
    { fullName: "matti/lake-level", release: "v0.3.1" },
    { fullName: "matti/mailbox", release: "v1.0.0" },
]);

async function card(config: Partial<GithubReposCardConfig> = {}, hass: HomeAssistant = HASS, layout?: string): Promise<GithubReposCard> {
    const element = document.createElement("github-repos-card");
    element.setConfig({ type: "custom:github-repos-card", ...config } as GithubReposCardConfig);
    element.hass = hass;
    element.layout = layout;
    document.body.append(element);
    await element.updateComplete;
    return element;
}

function names(element: GithubReposCard): string[] {
    return [...(element.shadowRoot?.querySelectorAll(".repo .name") ?? [])].map((name) => name.textContent ?? "");
}

function text(element: Element | null | undefined): string {
    return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("github-repos-card", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("shows every repo alphabetically, each linking to GitHub", async () => {
        const element = await card();
        expect(names(element)).toEqual(["aurora-card", "heating", "lake-level", "mailbox", "sauna_sensor"]);
        const link = element.shadowRoot?.querySelector<HTMLAnchorElement>("a.repo");
        expect(link?.href).toBe("https://github.com/example-org/aurora-card");
        expect(link?.target).toBe("_blank");
    });

    it("marks a version with commits after it, and shows none for a repo with no release", async () => {
        const element = await card();
        const versions = [...(element.shadowRoot?.querySelectorAll(".version") ?? [])];
        expect(versions.map((version) => text(version))).toEqual(["v2.0.0", "v0.3.1", "v1.0.0", "v1.2.0"]);
        expect(versions[0].classList.contains("unreleased")).toBe(true);
        expect(versions[1].classList.contains("unreleased")).toBe(false);
    });

    it("lines up the numbers in columns as wide as their widest number", async () => {
        const element = await card();
        const rows = [...(element.shadowRoot?.querySelectorAll(".numbers") ?? [])];
        expect(rows.map((row) => row.children.length)).toEqual([5, 5, 5, 5, 5]);
        const stars = rows.map((row) => (row.children[2] as HTMLElement).style.getPropertyValue("--chars"));
        expect(new Set(stars).size).toBe(1);
        expect(stars[0]).toBe("6");
        expect(text(rows[4].children[2])).toBe("1,2 t.");
    });

    it("colours issues and pull requests only when there are some", async () => {
        const element = await card({ repos: ["matti/sauna_sensor", "matti/heating"] });
        const [heating, sauna] = [...(element.shadowRoot?.querySelectorAll(".numbers") ?? [])];
        expect(heating.children[0].className).toContain("zero");
        expect(heating.children[1].className).toContain("pulls");
        expect(sauna.children[0].className).toContain("issues");
    });

    it("folds the repos with nothing to do into one line, which opens on a tap", async () => {
        const element = await card({ fold_quiet: true });
        expect(names(element)).toEqual(["aurora-card", "heating", "sauna_sensor", "lake-level", "mailbox"]);
        const slide = element.shadowRoot?.querySelector<HTMLElement>(".slide");
        expect(slide?.inert).toBe(true);
        expect(slide?.className).not.toContain("open");
        const fold = element.shadowRoot?.querySelector<HTMLButtonElement>(".fold");
        expect(text(fold)).toBe("2 repoa ilman tehtävää");
        fold?.click();
        await element.updateComplete;
        expect(slide?.inert).toBe(false);
        expect(slide?.className).toContain("open");
        expect(fold?.getAttribute("aria-expanded")).toBe("true");
    });

    it("has no fold line when every repo has something to do", async () => {
        const element = await card({ fold_quiet: true, repos: ["matti/heating"] });
        expect(element.shadowRoot?.querySelector(".fold")).toBeNull();
    });

    it("says which listed repo isn't followed", async () => {
        const element = await card({ repos: ["matti/heating", "matti/nothing"], language: "en" });
        expect(text(element.shadowRoot?.querySelector(".message"))).toBe("matti/nothing isn't followed by the GitHub integration.");
        expect(names(element)).toEqual(["heating"]);
    });

    it("says so when the integration follows nothing", async () => {
        const element = await card({}, fakeHass([]));
        expect(text(element.shadowRoot?.querySelector(".message"))).toBe("Ei repoja. Lisää ne Home Assistantin GitHub-integraatioon.");
    });

    it("doesn't ask to add repos when its own options left them all out", async () => {
        const element = await card({ repos: ["matti/heating"], exclude: ["matti/heating"] });
        expect(text(element.shadowRoot?.querySelector(".message"))).toBe("Ei näytettäviä repoja.");
    });

    it("draws a new configuration that comes in the same batch as an unrelated hass update", async () => {
        const element = await card({ title: "Vanha" });
        element.setConfig({ type: "custom:github-repos-card", title: "Uusi" });
        element.hass = { ...HASS, states: { ...HASS.states } };
        await element.updateComplete;
        expect(text(element.shadowRoot?.querySelector(".card-title"))).toBe("Uusi");
    });

    it("opens more-info on a tap when asked to", async () => {
        const element = await card({ tap: "more_info", repos: ["matti/mailbox"] });
        let opened: unknown;
        element.addEventListener("hass-more-info", (event) => (opened = (event as CustomEvent).detail.entityId));
        element.shadowRoot?.querySelector<HTMLButtonElement>("button.repo")?.click();
        expect(opened).toBe("sensor.github_matti_mailbox_viimeisin_julkaisu");
    });

    it.each([
        ["auto", undefined, {}, ""],
        ["fixed", undefined, { height_mode: "fixed" as const, height: 240, max_height: 300 }, "height: 240px"],
        ["max", undefined, { max_height: 300 }, "max-height: 300px"],
        ["grid rows", "grid", { height: 240, grid_options: { rows: 6 } }, "height: 100%"],
    ])("sizes itself by %s", async (_name, layout, config, style) => {
        const element = await card(config, HASS, layout);
        expect(element.shadowRoot?.querySelector("ha-card")?.getAttribute("style") ?? "").toBe(style);
    });

    it.each([
        ["the default config", {}, 2, "height: 88px"],
        ["a title", { title: "Repos" }, 2, "height: 120px"],
        [
            "no numbers",
            { show_issues: false, show_pull_requests: false, show_stars: false, show_forks: false, show_watchers: false },
            1,
            "height: 56px",
        ],
    ])("never gets lower than the title and one repo, with %s", async (_name, config, rows, style) => {
        const element = await card({ ...config, height: 40 });
        expect(element.getGridOptions().min_rows).toBe(rows);
        expect(element.shadowRoot?.querySelector("ha-card")?.getAttribute("style")).toBe(style);
    });

    it("puts the title and the messages before the repos", async () => {
        const element = await card({ title: "Repos", repos: ["matti/heating", "matti/nothing"], height: 300 });
        const haCard = element.shadowRoot!.querySelector("ha-card")!;
        expect([...haCard.children].map((child) => child.classList[0])).toEqual(["card-title", "message", "repos"]);
        expect(haCard.querySelector(".repos > .repo")).not.toBeNull();
    });

    it.each([
        ["held to a height", undefined, { height: 200 }, ["fade-bottom"]],
        ["held up to a limit", undefined, { max_height: 200 }, ["fade-bottom"]],
        ["held by rows in a sections view", "grid", { grid_options: { rows: 4 } }, ["fade-bottom"]],
        [
            "held to a height with automatic rows in a sections view",
            "grid",
            { height: 200, grid_options: { rows: "auto" as const } },
            ["fade-bottom"],
        ],
        ["held by the older layout options' rows in a sections view", "grid", { layout_options: { grid_rows: 4 } }, ["fade-bottom"]],
        ["never in auto", undefined, {}, []],
        ["never in auto with automatic rows in a sections view", "grid", { grid_options: { rows: "auto" as const } }, []],
        ["never by grid rows outside a sections view", undefined, { grid_options: { rows: 4 } }, []],
    ])("fades the bottom edge of the list that runs past it when %s", async (_name, layout, config, expected) => {
        const element = await card(config, HASS, layout);
        const repos = element.shadowRoot!.querySelector<HTMLElement>(".repos")!;
        Object.defineProperty(repos, "scrollHeight", { value: 600, configurable: true });
        Object.defineProperty(repos, "clientHeight", { value: 200, configurable: true });
        element.requestUpdate();
        await element.updateComplete;
        expect(["fade-top", "fade-bottom"].filter((name) => repos.classList.contains(name))).toEqual(expected);
    });

    it("lets go of the list's fade when the card goes from held to auto, and fades it again when held again", async () => {
        const element = await card({ height: 200 });
        const repos = element.shadowRoot!.querySelector<HTMLElement>(".repos")!;
        Object.defineProperty(repos, "scrollHeight", { value: 600, configurable: true });
        Object.defineProperty(repos, "clientHeight", { value: 200, configurable: true });
        element.requestUpdate();
        await element.updateComplete;
        expect([...repos.classList].filter((name) => name.startsWith("fade"))).toEqual(["fades", "fade-bottom"]);
        element.setConfig({ type: "custom:github-repos-card" });
        await element.updateComplete;
        expect([...repos.classList].filter((name) => name.startsWith("fade"))).toEqual([]);
        element.setConfig({ type: "custom:github-repos-card", height: 200 });
        await element.updateComplete;
        expect([...repos.classList].filter((name) => name.startsWith("fade"))).toEqual(["fades", "fade-bottom"]);
    });

    it("draws a change of layout that comes in the same batch as an unrelated hass update", async () => {
        const element = await card({ grid_options: { rows: 4 } });
        expect(element.shadowRoot?.querySelector("ha-card")?.getAttribute("style") ?? "").toBe("");
        element.layout = "grid";
        element.hass = { ...HASS, states: { ...HASS.states } };
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector("ha-card")?.getAttribute("style")).toBe("height: 100%");
    });

    it("refuses lists that aren't lists of names", () => {
        const element = document.createElement("github-repos-card");
        expect(() =>
            element.setConfig({ type: "custom:github-repos-card", repos: "matti/heating" } as unknown as GithubReposCardConfig),
        ).toThrow();
        expect(() => element.setConfig({ type: "custom:github-repos-card", exclude: [1] } as unknown as GithubReposCardConfig)).toThrow();
    });

    it("refuses a height that isn't a positive number of pixels, and an unknown height mode, with an error about the height", () => {
        const element = document.createElement("github-repos-card");
        const config = (extra: Record<string, unknown>) => ({ type: "custom:github-repos-card", ...extra }) as never;
        const error = translate(browserLanguage(), "common.invalid_height");
        expect(error).toMatch(/^Invalid height\./);
        for (const value of ["300px", 0, -10]) {
            expect(() => element.setConfig(config({ max_height: value }))).toThrow(error);
            expect(() => element.setConfig(config({ height: value }))).toThrow(error);
        }
        expect(() => element.setConfig(config({ height_mode: "tall" }))).toThrow(error);
        // Left empty in YAML, each is unset.
        expect(() => element.setConfig(config({ height_mode: null, height: null, max_height: null }))).not.toThrow();
    });

    it("redraws for a change in a GitHub sensor and ignores the rest of the house", async () => {
        const element = await card();
        const render = vi.spyOn(element as unknown as { render: () => unknown }, "render");
        const other: HomeAssistant = {
            ...HASS,
            states: { ...HASS.states, "sensor.sauna": { entity_id: "sensor.sauna", state: "80", last_changed: "", attributes: {} } },
        };
        element.hass = other;
        await element.updateComplete;
        expect(render).not.toHaveBeenCalled();
        const id = "sensor.github_matti_heating_vetopyynnot";
        element.hass = { ...other, states: { ...other.states, [id]: { ...other.states[id]!, state: "3" } } };
        await element.updateComplete;
        expect(render).toHaveBeenCalledTimes(1);
        const heating = element.shadowRoot?.querySelectorAll(".numbers")[1];
        expect(text(heating?.children[1])).toBe("3");
    });
});
