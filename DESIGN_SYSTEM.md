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
| Navigation, TOC and backlinks | SN Pro, 450–600 | 15px navigation text. The Explorer uses ink and a fill for the current page. In forced colors its current file or folder has an underline. The current contents link also uses weight. Keyboard focus has a separate outline. |
| Metadata, captions and tables | SN Pro for UI and tables | 14px dates, tags, table text and captions. Article image captions inherit the article family. |
| Search | SN Pro | 16px input and result heading. Preview typography follows the type of content being previewed. |
| Inline code, commands, terminal output and code blocks | TX-02 (Berkeley Mono) | Inline and fenced code share the 0.90625rem size token (14.5px with a 16px browser default). Sticky line numbers inherit that size. Inline code uses regular weight. A direct `strong` or `b` parent selects the bold face. Italic style is inherited. Blocks use a 1.375rem line height (22px at the default setting). |
| Signature | Mr De Haviland | Reserved for the author’s signature on Home. |

The sizing study used the same Azure article, archive and search query at 390, 900 and 1440 CSS pixels in both themes. Source Serif 4 produced median full lines of **42, 75 and 75 characters** at those widths. The former family produced 41, 73 and 75. The browser’s system serif fallback reached 90 on desktop. Increasing archive titles to 20px wrapped four of the first five phone titles and showed fewer whole entries. The chosen scale preserves the distinction between browsing and reading. Featured cards, excerpts and subtitles have no dedicated slot in this site’s current templates.

### Font assets and rights

- The site serves local Latin variable WOFF2 files from `@fontsource-variable/source-serif-4@5.3.1` and `@fontsource-variable/sn-pro@5.3.0`. The family licenses ship beside the files. Text outside the included character set uses the system serif or sans-serif fallback. See [Adobe Source Serif](https://github.com/adobe-fonts/source-serif) and [SN Pro](https://github.com/supernotes/sn-pro).
- The CSS family name `TX-02` points to the six original WOFF2 editions in the supplied Berkeley Mono webfont package. The site owner confirmed the website grant covers husenjan.com. The OTF desktop editions are excluded by the Static emitter. Keep grants site-specific when reusing this repository. [Foundry typeface](https://usgraphics.com/products/berkeley-mono) · [Website grant](https://usgraphics.com/catalog/MX-012)
- The previously supplied Anthropic binaries have no accompanying web license in the project. The stylesheet does not reference them and the static build excludes them.

The current shared code scale was compared at 14, 14.5 and 15px using the same Azure identifiers in prose and fenced examples. The middle size kept the tested 900px command rows and code-block scrolling thresholds, and removed an extra numbered-line height when the gutter inherited its size. A 32px browser default yields 29px for both inline and fenced code. Chrome, Brave and Edge identified Berkeley Mono as the glyph provider. Native Firefox zoom and the Linux WebKit port were also checked. [Font comparison](design-evidence/publication/type-code-900-light.webp) · [Five-browser font measurements](design-evidence/publication/font-checks.json)

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

Use near-black only for secondary surfaces. Selected rows use a distinct fill and text color. Prose links are underlined even at rest. Code keeps its separate neutral surface and syntax colors. Within fences, ordinary text selection uses the code surface ink and gray selection fill, including on highlighted lines. System selection colors take precedence in forced colors. Respect operating-system high-contrast colors.

### Opacity and interaction states

| Element | Treatment | Evidence on rendered surfaces |
| --- | --- | --- |
| Prose, metadata and navigation | Use solid theme inks at full opacity. Prose underlines use 60% of the current ink. | Metadata on the page measures 6.26:1 in light mode and 9.14:1 in dark mode. Reducing the entire row also fades its links and dates. |
| Archive rows and panels | Use opaque page and panel fills. Archive separators mix 65% rule with the page color. | Row alignment, text weight and spacing distinguish titles and dates even where the decorative rule is faint. |
| Search | The overlay uses 75% page color with a 2px backdrop blur. Hover uses the selection fill. Arrow-key selection adds a 2px inset outline around the option controlled by the input. Tabbing into the results gives the focused link its own outline. | The outline has 7.06:1 contrast against the selected fill in light mode and 11.91:1 in dark. It remains visible in forced colors. |
| Article code | Keep TX-02 text at full opacity. Use `--highlight` behind inline runs and `--panel` on blocks. | Inline text measures 14.73:1 in light mode and 13.88:1 in dark mode. |
| Callouts | Title and icon use 55% of the callout hue mixed with theme text. The fold arrow uses the same ink at its existing 80% opacity. Masked icons use system text ink in forced colors. | On the tinted Azure “PowerShell Version” callout, the arrow measures 3.61:1 light and 7.60:1 dark. |
| Graph | Edges and nodes have dedicated solid inks. The renderer dims unrelated elements to 20% on hover and brings the hovered label to full opacity. | The resting local edge measures 3.57:1 light and 4.24:1 dark. Zoom and hover reveal labels in the theme’s primary ink. |

## Layout and controls

- Use the 43rem measure on wide pages. At the 800px and 1200px breakpoints, the default frame changes between one, two and three columns. The 800px boundary uses the mobile arrangement and 1200px uses desktop.
- Phone gutters grow from 1rem to 1.5rem and respect safe-area insets. Toolbar controls can use part of the outer gutter at very narrow widths. The page scrolls vertically; wide tables and code scroll within their own boxes. A table’s right edge fades while more columns are offscreen and clears at the end.
- Article images have 15px corners. For a standalone diagram immediately followed by its caption, reserve up to 24rem of reading width before honoring a smaller authored percentage. The diagram fits the column on phones and keeps a 0.375rem gap to its caption. The five IACS illustrations declare their native pixel dimensions in the article. Their shared style sets a fluid height so the browser reserves the correct proportions before download. Other images take their vertical space from the containing paragraph. Headings own the gap to the content they introduce. Home certification links share one horizontally scrollable row. The two short status values stay beside their row labels. Refreshing Home restores the table’s position in that tab. A fresh visit starts at the first column. In narrow archives the headline takes its own line, with metadata below. In wider archives the date column reserves 7rem and can expand to fit dates when readers increase the browser’s minimum font size. Long archive tags can wrap within their column.
- Let article images with missing or automatic dimensions participate in layout even outside the viewport. This keeps focus scrolling stable once the browser knows their dimensions. The fixed black connectors in the external framework SVG need a light backing in dark mode.
- Where the desktop rail contains an expanded Contents and Backlinks, each section initially requests 50% of the space, up to its content height. The lists scroll independently if needed. At heights of 32rem or less, the whole rail scrolls.
- Foldable callouts use native HTML disclosures inside the original callout blockquote. The arrow sits at the trailing edge of the summary, and keyboard focus encloses the control. Closed content leaves the Tab order and accessibility tree. A Search title match leaves that disclosure in its authored state. A highlighted body match opens the enclosing disclosures and scrolls the match into view. [Phone disclosure and focus](design-evidence/callout-review/corrected/disclosures-390.webp)
- Keep native keyboard focus visible. The first tab stop in the default frame skips the toolbar and focuses main content. Search, Explorer, reader mode and the graph return the reader to a useful control when dismissed.

## Graph and motion

The Quartz V5 graph draws into a transparent Pixi canvas and reads theme colors from the document root. Each visible graph container owns its renderer and simulation. The [graph controller](quartz/components/scripts/graph.inline.ts) manages their lifetime across navigation, refresh, theme changes and dialog dismissal. The [drawing code](quartz/components/scripts/graphRenderer.ts) records its upstream revision and license. At that root, `--lightgray` resolves to graph-edge ink. Below the body, the same Quartz token resolves to the quieter UI divider. The renderer uses `--secondary` for the current page, `--tertiary` for visited pages and tags, `--gray` for ordinary nodes and hovered edges, and `--dark` for labels. The dark graph uses a black surface.

The index shows Graph View on tablet and desktop. The mobile layout, including short landscape phones, omits the graph on every page. Reduced motion also suppresses the graph and its force simulation. Where available, the global graph opens directly to the canvas. Select a node to visit its page, or use Close or Escape to dismiss the dialog and return focus. Explorer, search, tags and article backlinks provide navigation across layouts. [Quartz V5 graph documentation](<docs/features/graph view.md>)

Home, archives and articles use a plain warm off-white page in light mode and a solid black page in dark mode. The open margins frame the reading column at every width. Control transitions are brief. Reduced motion disables those transitions and smooth scrolling. On hover-capable layouts, link previews appear immediately under reduced motion. Escape dismisses a preview with the pointer stationary, including when another link sits beneath it.

Following a section link places a 2px theme-accent rule beside the first line of the destination heading. The rule holds for 1.5 seconds and fades over 400ms. With reduced motion, it stays static until another destination is followed. Keyboard focus and article text keep their usual treatment. [Heading examples](design-evidence/section-cue/heading-390.webp)

## Where to make changes

Edit [quartz/styles/custom.scss](quartz/styles/custom.scss). Its sections contain the font faces, root theme and type tokens, responsive frame, controls, graph, prose, technical material, archives and reader mode. The V5 ComponentResources emitter compiles this entry after the lower-priority Quartz base layer. Use the frame breakpoints from `variables.scss` and container queries when available space depends on the component. Change an existing owner rule before adding an override. Keep canvas settings and interaction semantics in their V5 components. [Quartz layout documentation](docs/layout.md) · [Validation history](DESIGN_PROGRESS.md)


### Diagram controls

Reserve room above each embedded Mermaid drawing for its existing Copy and Expand controls. Copy remains available while the module loads. Raw diagram source preserves indentation and wraps long lines within the reading column until the SVG exists. The enabled Quartz plugin assigns Expand an inline right offset when it binds the action. That marker exposes the initialized control. The stylesheet sizes the gap relative to the reader’s current font preference, including live changes. Copy and Expand track the new geometry immediately when type grows or shrinks. Only the original Copy button stays visible and focusable if Quartz initializes the block again. Touch shows the initialized control at rest. Keyboard focus reveals it immediately under reduced motion. [Matched phone views](design-evidence/publication/mermaid-390.webp) · [All ten drawings](design-evidence/publication/diagrams.json)
