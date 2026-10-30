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
    /** While the quiet repos slide open or shut, so the list shows no scrollbar halfway. */
    @state() private sliding = false;
    /** In a sections view with rows left automatic: the whole rows that hold the content, in pixels. */
    @state() private filled = 0;
    private slideTimer?: number;
    /** Whether every repo fits on one line, which the card measures after each render and change in its width. */
    @state() private oneLine = false;
    private sensors: string[] = [];
    private sensorsOf?: HomeAssistant["entities"];
    private readonly resizes = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => this.measureSoon());
    private frame?: number;

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

    // In pixels, the lowest a card held to a height gets: its padding and the title (56 px, or 24 without a title) and
    // one repo on its two lines (64 px), or on one when no numbers are shown (32), which every part's fixed height makes
    // exact.
    private minimumHeight(): number {
        const repo = this.config && !shownNumbers(this.config).length ? 32 : 64;
        return (this.config?.title ? 56 : 24) + repo;
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.resizes?.disconnect();
        cancelAnimationFrame(this.frame ?? 0);
        window.clearTimeout(this.slideTimer);
        this.sliding = false;
    }

    protected updated(): void {
        if (!this.isConnected) {
            return;
        }
        const card = this.renderRoot.querySelector("ha-card");
        if (card) {
            this.resizes?.observe(card);
        }
        this.measureSoon();
    }

    private measureSoon(): void {
        cancelAnimationFrame(this.frame ?? 0);
        this.frame = requestAnimationFrame(() => {
            this.measure();
            this.fillRows();
        });
    }

    /**
     * In a sections view whose rows are left automatic, the card takes the whole rows its content needs (56 px each and
     * the 8 px gaps between them), so the cards under it stay on the rows. Each part is a step of half a row, so this
     * matters only when they add up to a half: a title and an odd number of repos on one line, no title, or a message.
     */
    private fillRows(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        const list = this.renderRoot.querySelector<HTMLElement>(".repos");
        if (!card || !list || !card.clientWidth || this.layout !== "grid" || this.heightStyle()) {
            if (this.filled) this.filled = 0;
            return;
        }
        // Measured to the content's own end, as the list grows to whatever height the card is given, and to where the
        // quiet repos' slide ends rather than where it is, so the card is on its rows the moment the slide begins.
        const last = list.lastElementChild ?? list;
        const style = getComputedStyle(card);
        let content =
            last.getBoundingClientRect()[last === list ? "top" : "bottom"] -
            card.getBoundingClientRect().top +
            (parseFloat(style.paddingBottom) || 0) +
            (parseFloat(style.borderBottomWidth) || 0);
        const slide = list.querySelector<HTMLElement>(".slide");
        if (slide) {
            content += (this.open ? (slide.firstElementChild?.scrollHeight ?? 0) : 0) - slide.getBoundingClientRect().height;
        }
        const filled = Math.ceil((Math.round(content) + 8) / 64) * 64 - 8;
        if (filled !== this.filled) {
            this.filled = filled;
        }
    }

    /**
     * Every repo on one line when every one of them fits, its full name at its own width, the version and the numbers
     * beside it, and otherwise every repo on two, so the rows are all of a height. Measured at the parts' natural widths,
     * which are the same in either layout, so the choice doesn't flip back and forth. A hidden card measures nothing.
     */
    private measure(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        const repos = [...this.renderRoot.querySelectorAll<HTMLElement>(".repo")];
        if (!card || !card.clientWidth || !repos.length) {
            return;
        }
        const style = getComputedStyle(repos[0]);
        const room = card.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
        const fits = repos.every((repo) => {
            const parts = [".owner", ".name", ".version"].map((part) => repo.querySelector<HTMLElement>(part));
            const name = parts[1];
            // The name at its own width: on one line and uncapped by the room it has now.
            const wrap = name?.style.cssText ?? "";
            if (name) name.style.cssText = "white-space: nowrap; max-width: none";
            // Fractional widths, as whole pixels rounded down would let a name a fraction too wide wrap. The owner may be cut
            // short, so its own width is what it would need uncut.
            const owner = parts[0] ? parts[0].scrollWidth + 1 : 0;
            const text = owner + parts.slice(1).reduce((sum, part) => sum + (part ? part.getBoundingClientRect().width : 0), 0);
            if (name) name.style.cssText = wrap;
            // On one line the columns are only as wide as their numbers, so they are measured at that width.
            const row = repo.querySelector<HTMLElement>(".numbers");
            const width = row?.style.getPropertyValue("--column-width") ?? "";
            row?.style.setProperty("--column-width", "0px");
            const numbers = [...repo.querySelectorAll<HTMLElement>(".number")].reduce(
                (sum, number, i) => sum + number.getBoundingClientRect().width + (i ? 8 : 0),
                0,
            );
            row?.style.setProperty("--column-width", width);
            // The gaps: the version's from the name, and the numbers' from the version.
            return text + numbers + 20 <= room;
        });
        if (fits !== this.oneLine) {
            this.oneLine = fits;
        }
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
        // An owner the same on every line tells nothing, so it is left to the tooltip.
        const owners = new Set(shown.map((repo) => repo.owner)).size > 1;
        return html`
            <ha-card
                class="${this.oneLine ? "one-line" : ""} ${config.title ? "" : "untitled"} ${shownNumbers(config).length ? "" : "plain"} ${this.sliding ? "sliding" : ""}"
                style=${this.heightStyle() || (this.filled ? `min-height: ${this.filled}px` : "")}
            >
                ${config.title ? html`<h1 class="card-title">${config.title}</h1>` : nothing}
                ${missing.map((name) => html`<div class="message">${this.text("common.not_followed", { repo: name })}</div>`)}
                ${empty ? html`<div class="message">${this.text(empty)}</div>` : nothing}
                <div class="repos">
                    ${busy.map((repo) => this.repo(repo, columns, owners))} ${quiet.length ? this.fold(quiet.length) : nothing}
                    ${quiet.length ? this.slide(quiet.map((repo) => this.repo(repo, columns, owners))) : nothing}
                </div>
            </ha-card>
        `;
    }

    /** One repo: its owner, when the card shows more than one, and name with the version on the right, and its numbers under them. */
    private repo(repo: Repo, columns: Column[], owner: boolean): TemplateResult {
        const body = html`
            <div class="top">
                <span class="full-name" title=${repo.fullName}>
                    ${owner ? html`<span class="owner">${repo.owner}/</span>` : nothing}<span class="name">${repo.name}</span>
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
        return html`<button class="fold ${this.open ? "open" : ""}" aria-expanded=${this.open} @click=${this.toggle}>
            <ha-icon icon="mdi:check"></ha-icon>
            <span>${this.text(count === 1 ? "common.quiet_one" : "common.quiet_other", { count: String(count) })}</span>
            <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </button>`;
    }

    private readonly toggle = (): void => {
        this.open = !this.open;
        this.sliding = true;
        window.clearTimeout(this.slideTimer);
        // The slide's end lifts it. Without a slide, as with reduced motion, there is no end to wait for.
        this.slideTimer = window.setTimeout(() => (this.sliding = false), 1000);
    };

    private readonly slid = (event: TransitionEvent): void => {
        if (event.propertyName === "grid-template-rows" && event.target === event.currentTarget) {
            window.clearTimeout(this.slideTimer);
            this.sliding = false;
        }
    };

    /** The quiet repos, which slide open and shut. Shut, they stay in the page, so the change can be animated. */
    private slide(content: TemplateResult[]): TemplateResult {
        return html`<div class="slide ${this.open ? "open" : ""}" ?inert=${!this.open} @transitionend=${this.slid}>
            <div class="slide-in">${content}</div>
        </div>`;
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

                /*
                 * Every part is a step of 32 px, half a row of a sections view (56 px and an 8 px gap), so the card fills
                 * whole rows: the padding and the title take 56 px (24 without a title), a repo on two lines and the fold
                 * 64, and on one line 32.
                 */
                .card-title {
                    margin: 0 16px 8px;
                    font-size: var(--ha-card-header-font-size, 24px);
                    font-weight: var(--ha-font-weight-normal, 400);
                    line-height: 28px;
                }

                ha-card.untitled {
                    padding-top: 16px;
                }

                .message {
                    padding: 6px 16px;
                    line-height: 20px;
                    color: var(--secondary-text-color);
                }

                .repo,
                .fold {
                    display: block;
                    box-sizing: border-box;
                    width: 100%;
                    min-height: 64px;
                    padding: 10px 16px;
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
                    line-height: 20px;
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
                    max-width: 100%;
                    font-weight: var(--ha-font-weight-medium, 500);
                    overflow-wrap: anywhere;
                }

                .owner + .name {
                    max-width: calc(100% - 1.2em);
                }

                .version {
                    flex: none;
                    min-width: 44px;
                    box-sizing: border-box;
                    padding: 1px 7px;
                    border-radius: 10px;
                    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
                    font-size: 12px;
                    line-height: 18px;
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
                    line-height: 20px;
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
                    padding: 0 16px;
                    font-size: 13px;
                    color: var(--secondary-text-color);
                }

                /* Every repo on one line, the name, the version beside it and the numbers at the end, when all of them fit.
                   With no numbers shown a repo is one line anyway, and so is the fold beside it. */
                .one-line .repo,
                .plain .repo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-height: 32px;
                    padding-top: 0;
                    padding-bottom: 0;
                }

                .one-line .top {
                    flex: 1 1 auto;
                    min-width: 0;
                }

                .one-line .numbers {
                    --column-width: 0px;
                    flex: none;
                    flex-wrap: nowrap;
                    gap: 8px;
                    margin-top: 0;
                }

                .one-line .fold,
                .plain .fold {
                    min-height: 32px;
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
                    transition: transform var(--ha-animation-duration-normal, 250ms) ease;
                }

                .fold.open .chevron {
                    transform: rotate(180deg);
                }

                .slide {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows var(--ha-animation-duration-normal, 250ms) ease;
                }

                .slide.open {
                    grid-template-rows: 1fr;
                }

                .slide-in {
                    min-height: 0;
                    overflow: hidden;
                }

                .sliding .repos {
                    overflow-y: hidden;
                }

                /* The rows the card fills change along with the slide, not on ha-card's own timing. */
                ha-card.sliding {
                    transition: min-height var(--ha-animation-duration-normal, 250ms) ease;
                }

                @media (prefers-reduced-motion: reduce) {
                    .slide,
                    ha-card.sliding,
                    .fold .chevron {
                        transition: none;
                    }
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
