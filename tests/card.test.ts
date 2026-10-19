import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/github-repos-card";
import type { GithubReposCard } from "../src/github-repos-card";
import type { HomeAssistant } from "../src/hass";
import type { GithubReposCardConfig } from "../src/types";
import { fakeHass } from "./fixture";

const HASS = fakeHass([
    { fullName: "matti/sauna_sensor", release: "v1.2.0", numbers: { issues_count: 2, stargazers_count: 1234 } },
    { fullName: "example-org/aurora-card", release: "v2.0.0", unreleased: true },
    { fullName: "matti/heating", numbers: { pulls_count: 1 } },
    { fullName: "matti/lake-level", release: "v0.3.1" },
    { fullName: "matti/mailbox", release: "v1.0.0" },
]);

async function card(config: Partial<GithubReposCardConfig> = {}, hass: HomeAssistant = HASS): Promise<GithubReposCard> {
    const element = document.createElement("github-repos-card");
    element.setConfig({ type: "custom:github-repos-card", ...config } as GithubReposCardConfig);
    element.hass = hass;
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
        expect(names(element)).toEqual(["aurora-card", "heating", "sauna_sensor"]);
        const fold = element.shadowRoot?.querySelector<HTMLButtonElement>(".fold");
        expect(text(fold)).toBe("2 repoa ilman tehtävää");
        fold?.click();
        await element.updateComplete;
        expect(names(element)).toEqual(["aurora-card", "heating", "sauna_sensor", "lake-level", "mailbox"]);
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

    it("refuses lists that aren't lists of names", () => {
        const element = document.createElement("github-repos-card");
        expect(() =>
            element.setConfig({ type: "custom:github-repos-card", repos: "matti/heating" } as unknown as GithubReposCardConfig),
        ).toThrow();
        expect(() => element.setConfig({ type: "custom:github-repos-card", exclude: [1] } as unknown as GithubReposCardConfig)).toThrow();
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
