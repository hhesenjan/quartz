# Husenjan’s Quartz design system

The reading column is the center of the site. Use serif type for an article and its title, sans serif for finding a page, and monospace for anything the reader types or copies. Home, folders and articles share a left text edge. The Explorer, search and local table of contents provide distinct ways to move around.

The constrained article measure and underlined prose links draw on [Anthropic’s research articles](https://www.anthropic.com/research/claude-black-hole-physics). The distinction between headlines and their dates, categories and summaries also appears in the [Anthropic research list](https://www.anthropic.com/research) and [OpenAI research index](https://openai.com/research/index/). The blog uses its own assets and navigation.

## Type and measure

| Role | Family and weight | Size and spacing at the default browser setting |
| --- | --- | --- |
| Long-form paragraphs, lists and ordinary quotes | Source Serif 4, 425 | Fluid 16–18px, 1.6 line height rounded to the nearest CSS pixel where supported. Maximum column 43rem. |
| Article title | Source Serif 4, 450 | Scales with the header container, 28–44px, 1.12 line height. |
| Article sections | Source Serif 4, 450 | H1 26–32px, H2 22–28px, H3 18–21px. H4–H6 use SN Pro semibold. |
| Home introduction | Source Serif 4 | First greeting 1.25× body. The following paragraph shares its spacing. |
| Archive titles | Source Serif 4, 500 | 16px on compact phone rows and approximately 17–19px on wider rows. Dates and tags use 14px SN Pro. |
| Navigation, TOC and backlinks | SN Pro, 450–600 | 15px navigation text. Use weight, a background and a visible focus outline to distinguish the current item. |
| Metadata, captions and tables | SN Pro for UI and tables | 14px dates, tags, table text and captions. Article image captions inherit the article family. |
| Search | SN Pro | 16px input and result heading. Preview typography follows the type of content being previewed. |
| Inline code, commands, terminal output and code blocks | TX-02 (Berkeley Mono) | Inline 0.91em. Blocks 14px with 22px line height. Use the actual regular, medium, bold and oblique faces for their corresponding styles. |
| Signature | Mr De Haviland | Reserved for the author’s signature on Home. |

The sizing study used the same Azure article, archive and search query at 390, 900 and 1440 CSS pixels in both themes. Source Serif 4 produced median full lines of **42, 75 and 75 characters** at those widths. The former family produced 41, 73 and 75. The browser’s system serif fallback reached 90 on desktop. Increasing archive titles to 20px wrapped four of the first five phone titles and showed fewer whole entries. The chosen scale preserves the distinction between browsing and reading. Featured cards, excerpts and subtitles have no dedicated slot in this site’s current templates.

### Font assets and rights

- The site serves local Latin variable WOFF2 files from `@fontsource-variable/source-serif-4@5.3.1` and `@fontsource-variable/sn-pro@5.3.0`. The family licenses ship beside the files. Text outside the included character set uses the system serif or sans-serif fallback. See [Adobe Source Serif](https://github.com/adobe-fonts/source-serif) and [SN Pro](https://github.com/supernotes/sn-pro).
- The CSS family name `TX-02` points to the six original WOFF2 editions in the supplied Berkeley Mono webfont package. The site owner confirmed the website grant covers husenjan.com. The OTF desktop editions are excluded by the Static emitter. Keep grants site-specific when reusing this repository. [Foundry typeface](https://usgraphics.com/products/berkeley-mono) · [Website grant](https://usgraphics.com/catalog/MX-012)
- The previously supplied Anthropic binaries have no accompanying web license in the project. The stylesheet does not reference them and the static build excludes them.

## Color

| Token or surface | Light | Dark |
| --- | --- | --- |
| Page / `--light` | `#faf9f5` | `#000000` |
| Headings and prose / `--dark`, `--darkgray` | `#141413` | `#f5f5f5` |
| Secondary text / `--gray` | `#5e5d59` | `#ababab` |
| Secondary surface / `--panel` | `#f1efe6` | `#161616` |
| Quiet dividers / `--rule` | `#d4d1c6` | `#383838` |
| Graph edges / `--graph-edge` | `#817d72` | `#707070` |
| Interactive accent / `--tertiary` | `#904832` | `#d9c3ad` |

Use near-black only for secondary surfaces. Selected rows use a distinct fill and text color. Prose links are underlined even at rest. Code keeps its separate neutral surface and syntax colors. Respect operating-system high-contrast colors.

## Layout and controls

- Use the 43rem measure on wide pages. At the 800px and 1200px breakpoints, the default frame changes between one, two and three columns. The 800px boundary uses the mobile arrangement and 1200px uses desktop.
- Phone gutters grow from 1rem to 1.5rem and respect safe-area insets. Toolbar controls can use part of the outer gutter at very narrow widths. The page scrolls vertically; wide tables and code scroll within their own boxes. A table’s right edge fades while more columns are offscreen and clears at the end.
- The paragraph sets the vertical space around an article image. Headings own the gap to the content they introduce. Home certification links share one scrollable row with a pinned row label. In narrow archives the headline takes its own line, with metadata below.
- Keep native keyboard focus visible. The first tab stop in the default frame skips the toolbar and focuses main content. Search, Explorer, reader mode and the graph return the reader to a useful control when dismissed.

## Graph and motion

Quartz V5’s community graph plugin draws into a transparent Pixi canvas and reads theme colors from the document root. At that root, `--lightgray` resolves to graph-edge ink. Below the body, the same Quartz token resolves to the quieter UI divider. The renderer uses `--secondary` for the current page, `--tertiary` for visited pages and tags, `--gray` for ordinary nodes and hovered edges, and `--dark` for labels. The dark graph uses a black surface.

The index shows Graph View on tablet and desktop. The mobile layout, including short landscape phones, omits the graph on every page. Reduced motion also suppresses the graph and its force simulation. Where available, the global graph opens directly to the canvas. Select a node to visit its page, or use Close or Escape to dismiss the dialog and return focus. Explorer, search, tags and article backlinks provide navigation across layouts. [Quartz V5 graph documentation](<docs/features/graph view.md>)

Home, archives and articles use a plain warm off-white page in light mode and a solid black page in dark mode. The open margins frame the reading column at every width. Control transitions are brief. Reduced motion disables those transitions and smooth scrolling.

## Where to make changes

Edit [quartz/styles/custom.scss](quartz/styles/custom.scss). Its sections contain the font faces, root theme and type tokens, responsive frame, controls, graph, prose, technical material, archives and reader mode. The V5 ComponentResources emitter compiles this entry after the lower-priority Quartz base layer. Use the frame breakpoints from `variables.scss` and container queries when available space depends on the component. Change an existing owner rule before adding an override. Keep canvas settings and interaction semantics in their V5 components. [Quartz layout documentation](docs/layout.md) · [Validation history](DESIGN_PROGRESS.md)
