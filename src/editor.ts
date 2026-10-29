/**
 * The card's visual editor: the title, which repos, which numbers, folding and what counts as something to do, what a
 * tap does, the language and the card's height. Home Assistant's own form draws it, so the card bundles no form components.
 */
import { LitElement, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { DEFAULT_TAP, NUMBERS, TODOS } from "./const";
import type { HomeAssistant } from "./hass";
import { heightData, heightSchema, tidyHeight } from "./height";
import { LANGUAGE_CODES, browserLanguage, translate } from "./localize/localize";
import { reposOf } from "./repos";
import type { GithubReposCardConfig } from "./types";

interface SchemaEntry {
    name: string;
}

const DEFAULTS: Record<string, unknown> = {
    ...Object.fromEntries(NUMBERS.map(({ option, shown }) => [option, shown])),
    fold_quiet: false,
    ...Object.fromEntries(TODOS.map((option) => [option, true])),
    tap: DEFAULT_TAP,
};

function languageName(code: string, viewer: string): string {
    try {
        const name = new Intl.DisplayNames([viewer], { type: "language" }).of(code);
        return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
    } catch {
        return code;
    }
}

function schema(hass: HomeAssistant, config: GithubReposCardConfig, language: string, text: (key: string) => string) {
    // A repo can be written in that isn't followed yet, so the card is ready when it is.
    const repos = { select: { multiple: true, custom_value: true, options: reposOf(hass).map((repo) => repo.fullName) } };
    const booleans = (names: readonly string[]) => names.map((name) => ({ name, selector: { boolean: {} } }));
    return [
        { name: "title", selector: { text: {} } },
        { name: "repos", selector: repos },
        { name: "exclude", selector: repos },
        {
            type: "expandable",
            name: "numbers",
            flatten: true,
            schema: [{ type: "grid", name: "", schema: booleans(NUMBERS.map(({ option }) => option)) }],
        },
        { type: "expandable", name: "folding", flatten: true, schema: booleans(["fold_quiet", ...TODOS]) },
        {
            name: "tap",
            selector: {
                select: {
                    mode: "dropdown",
                    options: ["github", "more_info"].map((value) => ({ value, label: text(`editor.tap_${value}`) })),
                },
            },
        },
        {
            name: "language",
            selector: {
                select: {
                    mode: "dropdown",
                    options: LANGUAGE_CODES.map((code) => ({ value: code, label: languageName(code, language) })),
                },
            },
        },
        ...heightSchema(config, text),
    ];
}

@customElement("github-repos-card-editor")
export class GithubReposCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config: GithubReposCardConfig = { type: "custom:github-repos-card" };

    public setConfig(config: GithubReposCardConfig): void {
        this.config = { ...config };
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass) {
            return nothing;
        }
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${{ ...DEFAULTS, ...heightData(this.config) }}
                .schema=${schema(this.hass, this.config, this.language(), (key) => this.text(key))}
                .computeLabel=${(entry: SchemaEntry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
    }

    private valueChanged(event: CustomEvent<{ value: GithubReposCardConfig }>): void {
        const config: GithubReposCardConfig = tidyHeight(event.detail.value);
        // The defaults are shown in the form but left out of the configuration, as are empty texts and lists.
        for (const key of Object.keys(config)) {
            const value = config[key];
            if (
                value === DEFAULTS[key] ||
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && !value.length)
            ) {
                delete config[key];
            }
        }
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    private helper(name: string): string | undefined {
        const key = `editor.${name}_helper`;
        const helper = translate(this.language(), key);
        return helper === key ? undefined : helper;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "github-repos-card-editor": GithubReposCardEditor;
    }
}
