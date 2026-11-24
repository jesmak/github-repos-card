import { describe, expect, it } from "vitest";

import "../src/editor";
import type { GithubReposCardEditor } from "../src/editor";
import type { GithubReposCardConfig } from "../src/types";
import { fakeHass } from "./fixture";

describe("the card's editor", () => {
    // Home Assistant's form hands back all of its data, the defaults it was shown included.
    it("keeps only what differs from the defaults, and what the form doesn't show", async () => {
        const editor = document.createElement("github-repos-card-editor") as GithubReposCardEditor;
        editor.setConfig({ type: "custom:github-repos-card", height: 300 } as GithubReposCardConfig);
        editor.hass = fakeHass([{ fullName: "matti/mailbox", release: "v1.0.0" }]);
        document.body.append(editor);
        await editor.updateComplete;
        let saved: unknown;
        editor.addEventListener("config-changed", (event) => (saved = (event as CustomEvent).detail.config));
        const value = {
            type: "custom:github-repos-card",
            height: 300,
            title: "",
            repos: [],
            show_issues: true,
            show_stars: false,
            fold_quiet: false,
            todo_unreleased: true,
            tap: "github",
            row_step: "full",
            scroll_indicator: "both",
        };
        const form = editor.shadowRoot!.querySelector("ha-form")!;
        form.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
        expect(saved).toEqual({ type: "custom:github-repos-card", height: 300, show_stars: false });
        form.dispatchEvent(new CustomEvent("value-changed", { detail: { value: { ...value, scroll_indicator: "fade" } } }));
        expect(saved).toEqual({ type: "custom:github-repos-card", height: 300, show_stars: false, scroll_indicator: "fade" });
        editor.remove();
    });
});
