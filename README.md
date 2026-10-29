# GitHub repos card

Home Assistant dashboard card for the repositories the GitHub integration follows, with their versions, issues, pull
requests and unreleased commits at a glance.

[![GitHub Release][releases-shield]][releases] [![GitHub Release Date][release-date-shield]][releases] [![HACS][hacs-shield]][hacs] [![License][license-shield]](LICENSE)

<p>
<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/folded-light.png#gh-light-mode-only" width="400" alt="Four repositories with something to do, two of them with commits after their latest release, and the four quiet ones folded into one line">
<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/folded-dark.png#gh-dark-mode-only" width="400" alt="Four repositories with something to do, two of them with commits after their latest release, and the four quiet ones folded into one line">
<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/all-light.png#gh-light-mode-only" width="400" alt="Eight repositories in alphabetical order, each with its version and its issues, pull requests, stars, forks and watchers in columns">
<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/all-dark.png#gh-dark-mode-only" width="400" alt="Eight repositories in alphabetical order, each with its version and its issues, pull requests, stars, forks and watchers in columns">
</p>

## What is it?

A custom card for the repositories you follow with Home Assistant's own
[GitHub integration](https://www.home-assistant.io/integrations/github/). Each repository is an entry of two lines.
The first has its owner and name, with the latest release's version on the right. The second has its numbers, open
issues and pull requests, stars, forks and watchers, in columns that line up down the list.

The version turns orange when the default branch has commits after the latest release, so you see at a glance which
repositories have work waiting to be released. With folding on, the repositories that need something, an open issue,
an open pull request or unreleased commits, come first, and the quiet ones fold into one line.

The card reads the integration's sensors and makes no calls to GitHub of its own. It finds them by their device and
their kind, not by their entity ids, so it works whatever language Home Assistant names them in.

## Installation

### With HACS

1. Add this repository to HACS custom repositories with type **Dashboard**
2. Search for GitHub repos card in HACS and download it
3. Refresh your browser

### Manual

1. Take `dist/github-repos-card.js` from the source code of the [latest release][releases] and copy it to the
   `config/www` folder of your Home Assistant installation
2. In Home Assistant settings, open dashboards, click the three dots at the top right and open resources
3. Add a new resource with the path `/local/github-repos-card.js` and type JavaScript
4. Refresh your browser

The card needs the GitHub integration, set up with the repositories you want to see.

## Options

| Name                        | Type    | Default                                                                         | Description                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                      | string  | required                                                                        | `custom:github-repos-card`                                                                                                                                                                                                                                                                                                                                    |
| `title`                     | string  |                                                                                 | Shown at the top of the card                                                                                                                                                                                                                                                                                                                                  |
| `repos`                     | list    | all                                                                             | Only these repositories, as `owner/repo`                                                                                                                                                                                                                                                                                                                      |
| `exclude`                   | list    |                                                                                 | Repositories left out, as `owner/repo`                                                                                                                                                                                                                                                                                                                        |
| `show_issues`               | boolean | `true`                                                                          | The open issues column                                                                                                                                                                                                                                                                                                                                        |
| `show_pull_requests`        | boolean | `true`                                                                          | The open pull requests column                                                                                                                                                                                                                                                                                                                                 |
| `show_merged_pull_requests` | boolean | `false`                                                                         | The merged pull requests column                                                                                                                                                                                                                                                                                                                               |
| `show_discussions`          | boolean | `false`                                                                         | The discussions column                                                                                                                                                                                                                                                                                                                                        |
| `show_stars`                | boolean | `true`                                                                          | The stars column                                                                                                                                                                                                                                                                                                                                              |
| `show_forks`                | boolean | `true`                                                                          | The forks column                                                                                                                                                                                                                                                                                                                                              |
| `show_watchers`             | boolean | `true`                                                                          | The watchers column                                                                                                                                                                                                                                                                                                                                           |
| `show_downloads`            | boolean | `false`                                                                         | The column of the latest release's downloads                                                                                                                                                                                                                                                                                                                  |
| `fold_quiet`                | boolean | `false`                                                                         | Fold the repositories with nothing to do into one line that opens on a tap                                                                                                                                                                                                                                                                                    |
| `todo_issues`               | boolean | `true`                                                                          | An open issue is something to do                                                                                                                                                                                                                                                                                                                              |
| `todo_pull_requests`        | boolean | `true`                                                                          | An open pull request is something to do                                                                                                                                                                                                                                                                                                                       |
| `todo_unreleased`           | boolean | `true`                                                                          | Commits after the latest release are something to do                                                                                                                                                                                                                                                                                                          |
| `tap`                       | string  | `github`                                                                        | What a tap on a repository does, `github` to open it on GitHub or `more_info`                                                                                                                                                                                                                                                                                 |
| `language`                  | string  | Home Assistant's                                                                | The card's language, `en` or `fi`                                                                                                                                                                                                                                                                                                                             |
| `height_mode`               | string  | `fixed` when `height` is set, `max` when only `max_height` is, otherwise `auto` | How tall the card is. `auto` fits its content, `fixed` keeps it at `height`, `max` lets it grow up to `max_height`. In `fixed` and `max` the title and the messages stay in view and the list scrolls, and the card never gets lower than the title and one repository need. A height in grid rows, set in the layout tab of a sections view, is used instead |
| `height`                    | number  |                                                                                 | The card's height in pixels, for `fixed`                                                                                                                                                                                                                                                                                                                      |
| `max_height`                | number  |                                                                                 | The card's greatest height in pixels, for `max`                                                                                                                                                                                                                                                                                                               |

Every option is in the card's visual editor.

## What it shows

Repositories are in alphabetical order by name, whatever their owner. The owner is shown dimmed in front of every
name, since the card can't know which repositories are yours.

The version is the latest release's tag. It turns orange when the default branch has commits after the newest tag.
The GitHub integration gives the commit of the newest tag only, not of the latest release, so a repository that tags
without releasing is compared with its newest tag. The newest tag can be on any branch, so in a repository whose
newest tag is on a maintenance or beta branch the version stays orange. A repository with no release shows no version.

Open issues are green and open pull requests purple when there are some, and grey at zero. The other numbers are
dimmed. A number whose sensor is disabled or unavailable shows as a dash. Numbers of a thousand or more are shortened,
such as 1.2K.

With folding on, a repository whose numbers are all unknown, as when the integration can't reach GitHub, is never
folded away, so an outage doesn't pass for nothing to do.

A repository listed in `repos` that the integration doesn't follow is named at the top of the card, so a typo doesn't
go unnoticed.

The integration gives no dates, so the card can't show how long ago something was released. CI status and HACS
downloads would need calls to GitHub of the card's own, so it shows neither.

## Sizes

In a sections view the card takes a whole section by default and can be made as narrow as half of one. When a name
doesn't fit, the owner is cut short first. The name itself wraps rather than being cut, as a name cut short could be
another repository. The number columns are as wide as their widest number, so they line up whatever the numbers.

<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/narrow-light.png#gh-light-mode-only" width="250" alt="Four repositories on a card half a section wide, the longest owner cut short and every number on one line">
<img src="https://raw.githubusercontent.com/jesmak/github-repos-card/main/docs/images/narrow-dark.png#gh-dark-mode-only" width="250" alt="Four repositories on a card half a section wide, the longest owner cut short and every number on one line">

## Colours

The colours can be changed in a theme:

| Variable                          | Default                      |
| --------------------------------- | ---------------------------- |
| `--github-repos-issues-color`     | `#2da44e`                    |
| `--github-repos-pulls-color`      | `#8957e5`                    |
| `--github-repos-unreleased-color` | `--warning-color`, `#ff9800` |

## Examples

### Everything the integration follows

```yaml
type: custom:github-repos-card
```

### Only what needs doing in view

```yaml
type: custom:github-repos-card
title: Code
fold_quiet: true
exclude:
  - home-assistant/core
```

### A few repositories, issues and pull requests only

```yaml
type: custom:github-repos-card
title: Integrations
repos:
  - matti/lake_level
  - matti/sauna_sensor
show_stars: false
show_forks: false
show_watchers: false
```

## Data

Everything the card shows comes from the sensors of Home Assistant's
[GitHub integration](https://www.home-assistant.io/integrations/github/), which polls GitHub's API. The card itself
fetches nothing.

## Translating

The card's texts are in `src/localize/languages/`, one JSON file per language, named by its language code, such as
`en.json` and `fi.json`. To add a language, copy `en.json` to the new language's code, such as `sv.json`, and translate
the values. Nothing else needs changing. The card finds the file by itself and uses it when Home Assistant is set to
that language. A text left out falls back to English.

## Development

Requires Node 22.13 or newer.

```
npm install
npm run check
```

`npm run check` typechecks, lints, checks formatting, runs the tests and builds `dist/github-repos-card.js`, which is
the file HACS installs and is committed to the repository.

| Path                       | What it contains                                                           |
| -------------------------- | -------------------------------------------------------------------------- |
| `src/github-repos-card.ts` | The card itself                                                            |
| `src/editor.ts`            | The visual editor                                                          |
| `src/repos.ts`             | Finding the repositories in the integration's sensors, sorting and folding |
| `src/localize/languages/`  | The card's texts, one JSON file per language                               |
| `docs/screenshots.json`    | The made-up data the README's screenshots are taken from                   |
| `tests/`                   | Tests, run with vitest                                                     |

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/jesmak)

## Thanks

To benct, whose [lovelace-github-entity-row](https://github.com/benct/lovelace-github-entity-row) showed these numbers
on dashboards long before this card.

## License

MIT, see [LICENSE](LICENSE).

[releases-shield]: https://img.shields.io/github/release/jesmak/github-repos-card.svg?style=for-the-badge
[release-date-shield]: https://img.shields.io/github/release-date/jesmak/github-repos-card?style=for-the-badge
[releases]: https://github.com/jesmak/github-repos-card/releases
[hacs-shield]: https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge
[hacs]: https://hacs.xyz/docs/faq/custom_repositories/
[license-shield]: https://img.shields.io/github/license/jesmak/github-repos-card.svg?style=for-the-badge
