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

function owners(element: GithubReposCard): string[] {
    return [...(element.shadowRoot?.querySelectorAll(".owner") ?? [])].map(
        (owner) => `${text(owner.querySelector(".owner-name"))} ${text(owner.querySelector(".count"))}`,
    );
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
        const versions = [...(element.shadowRoot?.querySelectorAll(".version:not(.empty)") ?? [])];
        // The one without a release keeps an empty place, so the numbers line up when they are on one line.
        expect(element.shadowRoot?.querySelectorAll(".version.empty").length).toBe(1);
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

    it("puts the repos under their owners only when they have more than one", async () => {
        const mixed = await card({ repos: ["matti/heating", "example-org/aurora-card", "matti/mailbox"] });
        expect(owners(mixed)).toEqual(["example-org 1", "matti 2"]);
        expect(names(mixed)).toEqual(["aurora-card", "heating", "mailbox"]);
        const counts = [...(mixed.shadowRoot?.querySelectorAll(".owner .count") ?? [])].map((count) => count.getAttribute("title"));
        expect(counts).toEqual(["1 repo", "2 repoa"]);
        const mine = await card({ repos: ["matti/heating", "matti/mailbox"] });
        expect(owners(mine)).toEqual([]);
        expect(mine.shadowRoot?.querySelector(".full-name")?.getAttribute("title")).toBe("matti/heating");
    });

    it("groups the folded repos by their owners too", async () => {
        const element = await card({ fold_quiet: true });
        const slide = element.shadowRoot?.querySelector(".slide");
        expect(owners(element)).toEqual(["example-org 1", "matti 2", "matti 2"]);
        expect([...(slide?.querySelectorAll(".owner") ?? [])].map((owner) => text(owner.querySelector(".owner-name")))).toEqual(["matti"]);
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

    // The padding and the title on one line (56 px, or 24 without a title) and one repo: its padding and two lines of
    // numbers with its name (65 px and 20 a line), or with no numbers its name alone, within a row of 32 px. The name
    // counts as one line on a whole section's width and as two on 9 to 11 columns, the narrowest the card goes. With repos
    // from two owners, or every followed repo, the repo comes under its owner's header (32 px) and keeps its border (1).
    const plain = { show_issues: false, show_pull_requests: false, show_stars: false, show_forks: false, show_watchers: false };
    const oneOwner = { repos: ["matti/heating", "matti/mailbox"] };
    const twoOwners = { repos: ["matti/heating", "example-org/aurora-card"] };
    it.each<[string, Record<string, unknown>, number, number]>([
        ["one owner's repos", oneOwner, 109, 2],
        ["one owner's repos and a title", { ...oneOwner, title: "Repos" }, 141, 3],
        ["one owner's repos and a title on 12 columns", { ...oneOwner, title: "Repos", grid_options: { columns: 12 } }, 141, 3],
        ["one owner's repos and a title on a whole section", { ...oneOwner, title: "Repos", grid_options: { columns: "full" } }, 141, 3],
        ["one owner's repos and a title on 11 columns", { ...oneOwner, title: "Repos", grid_options: { columns: 11 } }, 161, 3],
        ["one owner's repos and a title on 9 columns", { ...oneOwner, title: "Repos", grid_options: { columns: 9 } }, 161, 3],
        [
            "one owner's repos and a title on 6 columns, which a sections view widens to 9",
            { ...oneOwner, title: "Repos", grid_options: { columns: 6 } },
            161,
            3,
        ],
        [
            "one owner's repos and a title on the older layout options' 4 columns",
            { ...oneOwner, title: "Repos", layout_options: { grid_columns: 4 } },
            141,
            3,
        ],
        [
            "one owner's repos and a title on the older layout options' 3 columns",
            { ...oneOwner, title: "Repos", layout_options: { grid_columns: 3 } },
            161,
            3,
        ],
        ["one owner's repos on 9 columns", { ...oneOwner, grid_options: { columns: 9 } }, 129, 3],
        ["one owner's repos and no numbers", { ...oneOwner, ...plain }, 56, 1],
        ["one owner's repos, no numbers and a title", { ...oneOwner, ...plain, title: "Repos" }, 88, 2],
        [
            "one owner's repos, no numbers and a title on 9 columns",
            { ...oneOwner, ...plain, title: "Repos", grid_options: { columns: 9 } },
            96,
            2,
        ],
        ["two owners' repos", twoOwners, 142, 3],
        ["two owners' repos and a title", { ...twoOwners, title: "Repos" }, 174, 3],
        ["two owners' repos and a title on 9 columns", { ...twoOwners, title: "Repos", grid_options: { columns: 9 } }, 194, 4],
        ["two owners' repos, no numbers and a title", { ...twoOwners, ...plain, title: "Repos" }, 120, 2],
        [
            "two owners' repos, no numbers and a title on 9 columns",
            { ...twoOwners, ...plain, title: "Repos", grid_options: { columns: 9 } },
            129,
            3,
        ],
        ["every followed repo", {}, 142, 3],
        ["every followed repo and a title", { title: "Repos" }, 174, 3],
        ["every followed repo and a title on 9 columns", { title: "Repos", grid_options: { columns: 9 } }, 194, 4],
        ["every followed repo and no numbers", plain, 88, 2],
    ])("never gets lower than the title and one repo, with %s", async (_name, config, height, rows) => {
        const element = await card({ ...config, height: 40 });
        expect(element.getGridOptions().min_rows).toBe(rows);
        expect(element.getGridOptions().min_columns).toBe(9);
        expect(element.shadowRoot?.querySelector("ha-card")?.getAttribute("style")).toBe(`height: ${height}px`);
    });

    // A card inside another card has no columns in its config, so only the width it is measured to have tells how
    // little room its names get. Narrower than a whole section's least (286 px inside the border), the name counts as two
    // lines, and the width only ever raises what the columns give.
    const measuredAt = (element: GithubReposCard, width: number): void => {
        const haCard = element.shadowRoot!.querySelector<HTMLElement>("ha-card")!;
        Object.defineProperty(haCard, "clientWidth", { value: width, configurable: true });
    };
    const styleOf = (element: GithubReposCard) => element.shadowRoot?.querySelector("ha-card")?.getAttribute("style");
    const narrowCases: Array<[string, Record<string, unknown>, string | undefined, number, string, number]> = [
        ["measured narrower than a whole section", {}, undefined, 236, "height: 161px", 3],
        ["measured at a whole section's least", {}, undefined, 286, "height: 141px", 3],
        ["measured just under it", {}, undefined, 285, "height: 161px", 3],
        ["measured while hidden, never measured before", {}, undefined, 0, "height: 141px", 3],
        ["on 9 columns, measured wide", { grid_options: { columns: 9 } }, undefined, 450, "height: 161px", 3],
        ["measured narrow with no numbers", plain, undefined, 236, "height: 96px", 2],
        ["measured narrow with no title", { title: undefined }, undefined, 236, "height: 129px", 3],
        ["measured narrow with every repo excluded", { exclude: oneOwner.repos }, undefined, 236, "height: 161px", 3],
        ["measured narrow with an empty list, which is every followed repo", { repos: [] }, undefined, 236, "height: 194px", 4],
        ["measured narrow with no list", { repos: undefined }, undefined, 236, "height: 194px", 4],
        ["measured narrow with two owners' repos", twoOwners, undefined, 236, "height: 194px", 4],
        ["up to a limit, measured narrow", { height: undefined, max_height: 40 }, undefined, 236, "max-height: 161px", 3],
        ["by rows in a sections view, measured narrow", { height: undefined, grid_options: { rows: 2 } }, "grid", 236, "height: 100%", 3],
    ];
    it.each(narrowCases)("is held no lower than its measured width needs, %s", async (_name, config, layout, width, style, rows) => {
        const element = await card({ ...oneOwner, title: "Repos", height: 40, ...config }, HASS, layout);
        measuredAt(element, width);
        element["measure"]();
        await element.updateComplete;
        expect(styleOf(element)).toBe(style);
        expect(element.getGridOptions().min_rows).toBe(rows);
    });

    it("lowers its minimum again when it widens, and keeps it while hidden", async () => {
        const element = await card({ ...oneOwner, title: "Repos", height: 40 });
        const heights = [];
        for (const width of [236, 400, 236, 0]) {
            measuredAt(element, width);
            element["measure"]();
            await element.updateComplete;
            heights.push(styleOf(element));
        }
        expect(heights).toEqual(["height: 161px", "height: 141px", "height: 161px", "height: 161px"]);
    });

    it("measures its width in the frame after an update", async () => {
        const frames: FrameRequestCallback[] = [];
        vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
        vi.stubGlobal("cancelAnimationFrame", () => undefined);
        try {
            const element = await card({ ...oneOwner, title: "Repos", height: 40 });
            measuredAt(element, 236);
            element.requestUpdate();
            await element.updateComplete;
            expect(styleOf(element)).toBe("height: 141px");
            while (frames.length) {
                frames.splice(0).forEach((frame) => frame(0));
                await element.updateComplete;
            }
            expect(styleOf(element)).toBe("height: 161px");
        } finally {
            vi.unstubAllGlobals();
        }
    });

    // Held, the title keeps to one line, so the card's minimum holds at any width. Otherwise it wraps.
    it.each<[string, Record<string, unknown>, string | undefined, boolean]>([
        ["held to a height", { title: "Repos", height: 300 }, undefined, true],
        ["held up to a limit", { title: "Repos", max_height: 300 }, undefined, true],
        ["held by rows in a sections view", { title: "Repos", grid_options: { rows: 4 } }, "grid", true],
        ["by its content", { title: "Repos" }, undefined, false],
        ["by its content on automatic rows", { title: "Repos", grid_options: { rows: "auto" } }, "grid", false],
    ])("is marked held %s", async (_name, config, layout, held) => {
        const element = await card(config, HASS, layout);
        expect(element.shadowRoot?.querySelector("ha-card")?.classList.contains("held")).toBe(held);
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
