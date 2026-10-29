/**
 * A dashboard card for the repos that Home Assistant's GitHub integration follows: one entry per repo with its
 * version and its numbers, and those that need something (an open issue, an open pull request, commits after the
 * last release) apart from the quiet ones when folding is on.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION, DEFAULT_TAP } from "./const";
import type { NumberKey } from "./const";
import "./editor";
import { ScrollFade, fadeStyles } from "./fade";
import type { HomeAssistant } from "./hass";
import { gridMinRows, heightCardSize, heightStyle, validHeight } from "./height";
import { browserLanguage, translate } from "./localize/localize";
import { formatNumber, githubSensors, hasTodo, reposOf, selectRepos, shownNumbers } from "./repos";
import type { GithubReposCardConfig, Repo } from "./types";

console.info(
    `%c  GITHUB-REPOS-CARD \n%c  ${CARD_VERSION}    `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray",
);

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

const registry = window as unknown as { customCards?: CardRegistration[] };
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
    type: "github-repos-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/github-repos-card",
    preview: true,
});

@customElement("github-repos-card")
export class GithubReposCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @property({ attribute: false }) public layout?: string;
    @state() private config?: GithubReposCardConfig;
    @state() private open = false;
    private sensors: string[] = [];
    private sensorsOf?: HomeAssistant["entities"];

    constructor() {
        super();
        // Fades the list's edges while the card is held to a height, through the card's own lifecycle.
        new ScrollFade(this, () => (this.heightStyle() ? this.renderRoot.querySelectorAll<HTMLElement>(".repos") : []));
    }

    public static getConfigElement(): HTMLElement {
        return document.createElement("github-repos-card-editor");
    }

    /** Every followed repo, so the card shows something the moment it is added from the picker. */
    public static getStubConfig(): Record<string, unknown> {
        return {};
    }

    public setConfig(config: GithubReposCardConfig): void {
        const lists = [config?.repos, config?.exclude];
        if (
            !config ||
            lists.some((list) => list !== undefined && (!Array.isArray(list) || list.some((name) => typeof name !== "string")))
        ) {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        if (!validHeight(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_height"));
        }
        this.config = { ...config };
    }

    public getCardSize(): number {
        return heightCardSize(
            this.config ?? {},
            1 + (this.hass && this.config ? selectRepos(reposOf(this.hass), this.config).shown.length : 3),
            this.minimumHeight(),
        );
    }

    /** In a sections view the card takes a whole section by default and is never narrower than half of one. */
    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, min_columns: 6, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
    }

    // In pixels, the lowest a card held to a height gets: its padding, the title when it has one, and one repo with its
    // line of numbers when any are shown, as measured on a full section's width.
    private minimumHeight(): number {
        const title = this.config?.title ? 35 : 0;
        const numbers = this.config && shownNumbers(this.config).length ? 23 : 0;
        return 18 + title + 36 + numbers;
    }

    private heightStyle(): string {
        return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
    }

    protected shouldUpdate(changed: PropertyValues): boolean {
        const previous = changed.get("hass") as HomeAssistant | undefined;
        // The shortcut below is only for a hass update alone: a config or fold change in the same batch must still draw.
        if (!changed.has("hass") || changed.size > 1 || !previous || !this.hass) {
            return true;
        }
        if (previous.entities !== this.hass.entities || previous.devices !== this.hass.devices || previous.locale !== this.hass.locale) {
            return true;
        }
        // Home Assistant hands the card every state change in the house; only the GitHub integration's sensors matter.
        if (this.sensorsOf !== this.hass.entities) {
            this.sensorsOf = this.hass.entities;
            this.sensors = [...githubSensors(this.hass).values()].flatMap((keys) => [...keys.values()]);
        }
        return this.sensors.some((entity) => previous.states[entity] !== this.hass?.states[entity]);
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const followed = reposOf(this.hass);
        const { shown, missing } = selectRepos(followed, this.config);
        const config = this.config;
        // Nothing followed is something to set up. Everything filtered out is the card's own options at work.
        const empty = shown.length || missing.length ? undefined : followed.length ? "common.none_shown" : "common.no_repos";
        const busy = config.fold_quiet ? shown.filter((repo) => hasTodo(repo, config)) : shown;
        const quiet = config.fold_quiet ? shown.filter((repo) => !hasTodo(repo, config)) : [];
        const columns = this.columns(shown);
        return html`
            <ha-card style=${this.heightStyle()}>
                ${config.title ? html`<h1 class="card-title">${config.title}</h1>` : nothing}
                ${missing.map((name) => html`<div class="message">${this.text("common.not_followed", { repo: name })}</div>`)}
                ${empty ? html`<div class="message">${this.text(empty)}</div>` : nothing}
                <div class="repos">
                    ${busy.map((repo) => this.repo(repo, columns))} ${quiet.length ? this.fold(quiet.length) : nothing}
                    ${this.open ? quiet.map((repo) => this.repo(repo, columns)) : nothing}
                </div>
            </ha-card>
        `;
    }

    /** One repo: its owner and name with the version on the right, and its numbers under them. */
    private repo(repo: Repo, columns: Column[]): TemplateResult {
        const body = html`
            <div class="top">
                <span class="full-name" title=${repo.fullName}>
                    <span class="owner">${repo.owner}/</span><span class="name">${repo.name}</span>
                </span>
                ${
                    repo.version
                        ? html`<span
                              class="version ${repo.unreleased ? "unreleased" : ""}"
                              title=${this.text(repo.unreleased ? "common.unreleased" : "common.latest_release")}
                              >${repo.version}</span
                          >`
                        : nothing
                }
            </div>
            ${columns.length ? html`<div class="numbers">${columns.map((column) => this.number(repo, column))}</div>` : nothing}
        `;
        if ((this.config?.tap ?? DEFAULT_TAP) === "more_info") {
            return html`<button class="repo" @click=${() => this.moreInfo(repo.entity)}>${body}</button>`;
        }
        return html`<a class="repo" href=${repo.url} target="_blank" rel="noopener noreferrer">${body}</a>`;
    }

    /** A number in its column. Issues and pull requests are coloured when there are some; a missing number is a dash. */
    private number(repo: Repo, column: Column): TemplateResult {
        const value = repo.numbers[column.key];
        const kind = column.key === "issues_count" ? "issues" : column.key === "pulls_count" ? "pulls" : "";
        return html`<span
            class="number ${value ? kind : "zero"}"
            style="--chars:${column.chars}"
            title=${this.text(`numbers.${column.key}`)}
        >
            <ha-icon icon=${column.icon}></ha-icon>${value === undefined ? "–" : formatNumber(value, this.language())}
        </span>`;
    }

    private fold(count: number): TemplateResult {
        return html`<button class="fold ${this.open ? "open" : ""}" aria-expanded=${this.open} @click=${() => (this.open = !this.open)}>
            <ha-icon icon="mdi:check"></ha-icon>
            <span>${this.text(count === 1 ? "common.quiet_one" : "common.quiet_other", { count: String(count) })}</span>
            <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </button>`;
    }

    /**
     * The shown numbers' columns. Each is as wide as its widest number needs, so the numbers line up down the list,
     * and never narrower than the card's own minimum for a column.
     */
    private columns(repos: Repo[]): Column[] {
        const language = this.language();
        return shownNumbers(this.config ?? { type: "" }).map(({ key, icon }) => {
            return { key, icon, chars: Math.max(1, ...repos.map((repo) => formatNumber(repo.numbers[key] ?? 0, language).length)) };
        });
    }

    private moreInfo(entityId: string): void {
        this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
    }

    /** A text in the card's language, with `{name}` in it replaced, so a translation can put the value where it reads right. */
    private text(key: string, values: Record<string, string> = {}): string {
        return translate(this.language(), key).replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
    }

    private language(): string {
        return this.config?.language || this.hass?.locale?.language || this.hass?.language || browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                /* A column, so that with a height of its own the title and the messages stay put and the list scrolls. */
                ha-card {
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    container-type: inline-size;
                    padding: 12px 0 6px;
                    font-variant-numeric: tabular-nums;
                    --column-width: 52px;
                    --github-repos-issues: var(--github-repos-issues-color, #2da44e);
                    --github-repos-pulls: var(--github-repos-pulls-color, #8957e5);
                    --github-repos-unreleased: var(--github-repos-unreleased-color, var(--warning-color, #ff9800));
                }

                .card-title,
                .message {
                    flex: none;
                }

                .repos {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    scrollbar-width: thin;
                }

                .card-title {
                    margin: 0 16px 6px;
                    font-size: var(--ha-card-header-font-size, 24px);
                    font-weight: var(--ha-font-weight-normal, 400);
                    line-height: 1.2;
                }

                .message {
                    padding: 6px 16px;
                    color: var(--secondary-text-color);
                }

                .repo,
                .fold {
                    display: block;
                    box-sizing: border-box;
                    width: 100%;
                    padding: 7px 16px 8px;
                    border: none;
                    border-top: 1px solid var(--divider-color);
                    background: none;
                    color: inherit;
                    font: inherit;
                    text-align: left;
                    text-decoration: none;
                    cursor: pointer;
                }

                /* Inside the row, as the list scrolls and so clips whatever is drawn outside it. */
                .repo:focus-visible,
                .fold:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .repos > :first-child {
                    border-top: none;
                }

                .repo:hover,
                .fold:hover {
                    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
                }

                .top {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* The owner gives way first, cut short, and the name last, wrapping rather than cut: a name cut short is another repo. */
                .full-name {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    font-size: 14px;
                }

                .owner {
                    flex: 0 1 auto;
                    min-width: 1.2em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--secondary-text-color);
                    opacity: 0.8;
                }

                /* The name never shrinks, so only the owner does, and it wraps only once the owner is down to its minimum. */
                .name {
                    flex: none;
                    max-width: calc(100% - 1.2em);
                    font-weight: var(--ha-font-weight-medium, 500);
                    overflow-wrap: anywhere;
                }

                .version {
                    flex: none;
                    min-width: 44px;
                    box-sizing: border-box;
                    padding: 1px 7px;
                    border-radius: 10px;
                    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
                    font-size: 12px;
                    text-align: center;
                    white-space: nowrap;
                }

                .version.unreleased {
                    background: color-mix(in srgb, var(--github-repos-unreleased) 22%, transparent);
                    color: color-mix(in srgb, var(--github-repos-unreleased) 75%, var(--primary-text-color));
                }

                /* Fixed widths, the same in every entry, so the numbers line up down the list and wrap alike on a narrow card. */
                .numbers {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px 4px;
                    margin-top: 3px;
                }

                /* As wide as the column's widest number and its icon need, never narrower than a column's minimum. */
                .number {
                    box-sizing: border-box;
                    width: max(var(--column-width), calc(var(--chars) * 1ch + 20px));
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 13px;
                    white-space: nowrap;
                    color: var(--secondary-text-color);
                }

                .number ha-icon {
                    --mdc-icon-size: 16px;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    flex: none;
                }

                .number.zero {
                    opacity: 0.6;
                }

                .number.issues {
                    color: var(--github-repos-issues);
                }

                .number.pulls {
                    color: var(--github-repos-pulls);
                }

                .fold {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 16px;
                    font-size: 13px;
                    color: var(--secondary-text-color);
                }

                .fold ha-icon {
                    --mdc-icon-size: 16px;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    flex: none;
                }

                .fold .chevron {
                    margin-left: auto;
                    transition: transform 0.2s;
                }

                .fold.open .chevron {
                    transform: rotate(180deg);
                }

                /* The card is the container, so the narrow layout styles what is inside it, never ha-card itself. */
                @container (max-width: 299px) {
                    .numbers {
                        --column-width: 34px;
                    }

                    .repo,
                    .fold,
                    .message {
                        padding-left: 12px;
                        padding-right: 12px;
                    }

                    .card-title {
                        margin-left: 12px;
                        margin-right: 12px;
                    }
                }
            `,
            fadeStyles,
        ];
    }
}

interface Column {
    key: NumberKey;
    icon: string;
    /** The length of the column's widest number. */
    chars: number;
}

declare global {
    interface HTMLElementTagNameMap {
        "github-repos-card": GithubReposCard;
    }
}
