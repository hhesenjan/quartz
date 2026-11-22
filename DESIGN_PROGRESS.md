# Quartz V5 design review

The history and screenshots below describe the original redesign. Since that review, the site owner requested a graph without the Connections panel and a fresh look at the page background. The follow-up build (`index-7689613b.css`) uses the canvas directly and flat page margins in both themes. On this build, 24 Home, article and archive checks at 390, 900, 1440 and 1920px preserved the reading-column bounds. Independent tests verified mouse and touch node navigation, zoom, dialog keyboard behavior, theme switching, reduced motion and blocked graphics requests. [Current design system](DESIGN_SYSTEM.md)

This review began from the existing responsive design, including the previous pass’s uncommitted SCSS. Its dark page was charcoal. The reference production build used `index-660bede9.css`. Each candidate was built into a fresh directory. Reviewers compared the same routes, theme, viewport and Chromium installation. No article text was changed.

**Accepted after nine evaluation cycles.** Independent QA scored the final design 89/100, up from 62/100 at baseline. The final three cycles identified no material change to make. A separate design director then completed the final audit and accepted the build. The production asset pair is `index-4d869024.css` and `postscript-5d9af1a5.js`.

## Research and implementation boundary

| Review | Evidence used | Decision |
| --- | --- | --- |
| Anthropic | Live desktop and mobile measurements of the homepage, research list and [research article](https://www.anthropic.com/research/claude-black-hole-physics). The article column measured 37.5 body em on desktop, compared with 38.2 em here. | Preserve the blog’s reading width, link underlines and mobile contents disclosure. |
| OpenAI | Semantic structure and CSS of the [research index](https://openai.com/research/index/) and a [research article](https://openai.com/index/research-acceleration-jagged-frontier/). The headless visual capture hit a verification screen, so the review used source evidence and made no pixel-size claims. | Keep page discovery and section navigation distinct. Group metadata with headlines. |
| Quartz architecture | The V5 ComponentResources emitter imports the custom entry, emits base styles in a named cascade layer and then the site stylesheet. The Static emitter honors configuration ignore patterns. The installed graph uses D3/Pixi and reads root theme colors. | Use the normal SCSS entry, font assets and supported component registration. Keep product-specific JavaScript for keyboard semantics and graph lifecycle. |
| Typography | 144 font/size/device/theme configurations, then 36 archive/search configurations, on actual content. Browser platform-font inspection identified the glyph providers. | Adopt Source Serif 4 + SN Pro, retain TX-02. Keep measured reading and browsing sizes. See [system and measurements](DESIGN_SYSTEM.md). |
| Effects | Tested 8px, 16-second ambient gutter motion against the static Home in light/dark desktop and phone. Screenshots and animation timelines were compared under normal and reduced motion. | Reject the idle loop. Keep static contours and short control transitions. |
| Director | Reviewed proposals before implementation: licensing, column measure, CSS parity, dark colors, graph contrast, text-equivalent navigation, search, skip/landmarks and reduced motion. | Approved the bounded implementation. Required separate QA and empirical comparison before keeping any larger graph labels. |

**Migration control.** Before changing tokens or selectors, the converted SCSS and the former Sass-plus-overrides entry each compiled to 69,777 identical bytes. SHA-256 for both was `a7078c7a99c03c590538d02491760afcc75089460881272832ee3a3fc4fe8ee2`. The final SCSS folds the screen overrides into their owning sections. The browser uses one declaration per font face and one vendor graph renderer.

## Matched screenshots

Each image places the baseline on the left and the revised page on the right. The screenshots use the actual Home, Certifications archive, Azure Machine Configuration article, its first code example and a populated Azure search.

| Viewport and theme | Home | Archive | Article | Code | Search |
| --- | --- | --- | --- | --- | --- |
| 1440×900 light | [Home](design-evidence/1440-light-home.webp) | [Archive](design-evidence/1440-light-archive.webp) | [Article](design-evidence/1440-light-article.webp) | [Code](design-evidence/1440-light-code.webp) | [Search](design-evidence/1440-light-search.webp) |
| 1440×900 dark | [Home](design-evidence/1440-dark-home.webp) | [Archive](design-evidence/1440-dark-archive.webp) | [Article](design-evidence/1440-dark-article.webp) | [Code](design-evidence/1440-dark-code.webp) | [Search](design-evidence/1440-dark-search.webp) |
| 900×900 light | [Home](design-evidence/900-light-home.webp) | [Archive](design-evidence/900-light-archive.webp) | [Article](design-evidence/900-light-article.webp) | [Code](design-evidence/900-light-code.webp) | [Search](design-evidence/900-light-search.webp) |
| 900×900 dark | [Home](design-evidence/900-dark-home.webp) | [Archive](design-evidence/900-dark-archive.webp) | [Article](design-evidence/900-dark-article.webp) | [Code](design-evidence/900-dark-code.webp) | [Search](design-evidence/900-dark-search.webp) |
| 390×844 light | [Home](design-evidence/390-light-home.webp) | [Archive](design-evidence/390-light-archive.webp) | [Article](design-evidence/390-light-article.webp) | [Code](design-evidence/390-light-code.webp) | [Search](design-evidence/390-light-search.webp) |
| 390×844 dark | [Home](design-evidence/390-dark-home.webp) | [Archive](design-evidence/390-dark-archive.webp) | [Article](design-evidence/390-dark-article.webp) | [Code](design-evidence/390-dark-code.webp) | [Search](design-evidence/390-dark-search.webp) |

## Gate history

The nine scores are reviewer judgments on a 0–10 scale. In order they cover editorial aesthetics, typography, CSS architecture, light/dark quality, responsive layout, graph, accessibility, effects, and performance/maintainability. Weights are 15/15/15/15/10/10/10/5/5%. A blocking defect outweighs a score. A correction carried forward from a failed candidate receives acceptance only on a tested subsequent build.

| Cycle | Problem, proposal and result | Gate | Scores and weighted total |
| --- | --- | --- | --- |
| Baseline | Strong mobile/desktop reading layout. Split source, uncertain font rights, charcoal dark background, pale graph edges, inaccessible graph relationships, invalid disclosure/search semantics. | Baseline recorded | 8/7/4/5/9/5/5/8/6 · **62/100** |
| 1 | Consolidated SCSS; licensed font swap; black theme; improved graph ink; keyboard Connections, skip, Explorer, search and TOC. Verified actual fonts, code copying, two graph palettes and 160 selectable nodes. The local graph still animated with reduced motion; the initial TOC reference could collide with Explorer. | **Revision required** | 8/9/9/9/9/7/7/5/8 · **82/100** |
| 2 | Added a reduced-motion resource guard and static launcher; repaired the TOC target. Testing the emitted build found a second graph registration could still load the renderer. Two simultaneously mounted search lists were not both synchronized in tag mode. | **Revision required** | 8/9/9/9/9/6/7/8/7 · **82/100** |
| 3 | Corrected tag-list semantics and consolidated graph registration. A live reduced→normal transition still failed on this artifact. QA traced it to component registration timing and missing V5 route detail. | **Revision required** | 8/9/9/9/9/6/7/8/7 · **82/100** |
| 4 | The emitted build deferred the sole graph resource, supplied the current route on restoration and passed 30 accessibility states. Activating the skip link still initiated an unnecessary SPA navigation. An open Connections view could miss the graphical option when its libraries arrived late. | **Revision required** | 8/9/9/9/9/8/8/9/9 · **86.5/100** |
| 5 | Skip now focuses main without altering URL or history. Connections exposes Show graph when the delayed renderer is ready. Three viewport tests confirmed both paths. Initial QA scored 89. Reviewing the screenshot gallery then revealed a pre-existing mobile first-paint defect. The drawer covered and disabled the reading surface while Quartz fetched its index, for over half a second with a 500ms delay. The director reopened the gate. | **Revision required** | 9/9/9/9/8/8/9/9/9 · **88/100** |
| 6 | Restored Quartz’s built-in mobile loading rule and used the same readiness check for expansion, scroll lock and background focus. With the index held pending, the reading surface received hit tests and the skip link worked at 320, 390, 800 and 900px. When it arrived, Explorer opened, isolated the background and returned focus on Escape. When the index request failed, keyboard article links still reached their destinations. | **Accepted** | 9/9/9/9/9/8/9/9/9 · **89/100** |
| 7 | Rechecked the accepted build at 320 and 1440px on all 161 non-redirect pages with alternating themes. All 322 returned HTTP 200 with no document overflow or out-of-bounds main content. Another 60 configurations covered the viewport boundaries, 200% root text and reader mode. Nine paragraph-box warnings on two technical posts were followed up with text ranges. Inline-code backgrounds extended into the gutter by up to 9px; the sampled glyph ranges stayed inside the paragraphs. | **Accepted, no change** | 9/9/9/9/9/8/9/9/9 · **89/100** |
| 8 | At 390, 900 and 1440px in both themes, readers could search in reader mode, dismiss the results, follow an article backlink and use Back with their chosen theme intact. Tablet and desktop showed the linked article preview. Repeated graph tests on the same build confirmed keyboard and touch destinations, focus return, offline graphics fallback, and starting and stopping the renderer when motion preferences changed. | **Accepted, no change** | 9/9/9/9/9/8/9/9/9 · **89/100** |
| 9 | Reconciled the production output with the baseline and repeated cold performance measurements. Article font transfer fell 54%. CSS grew 1,158 bytes, while total local subresources fell on both routes. All six emitted TX-02 webfiles matched the supplied originals byte for byte. The production build, formatting checks and 164 unit tests passed. No new type-check diagnostics appeared. | **Accepted, no change** | 9/9/9/9/9/8/9/9/9 · **89/100** |

## Final independent audit

After cycles 7–9, the design director used a separate browser walkthrough of Home, the Certifications archive and the Azure article. All 18 combinations at 390, 900 and 1440px in both themes fit the viewport, exposed one main landmark, used the expected page and text colors, and raised zero page exceptions. The director checked actual editorial and code glyphs, 160 graph choices in each context, desktop canvas zoom, theme switching, search, reader mode, focus return, the 30 matched screenshot pairs, route comparisons and cold measurements. The director and QA reviewer independently returned **Accepted, 89/100**, with no material defect identified in the evaluated scope. [Recorded results](design-evidence/checks.json)

## Accessibility, graph and preserved behavior

Axe-core 4.14.1 ran 26 settled Home, article, archive, search, graph, Connections and mobile Explorer states plus four tag/empty search cases. The 30 states at 390px and 1440px yielded **zero violations of the evaluated WCAG A/AA rules**. All four graphical states contained a live canvas. In all four text views, the selector offered the same 160 notes and tags. The tested browser was Chromium with mobile touch emulation. [Machine-readable checks](design-evidence/checks.json)

Manual keyboard checks covered visible skip focus, background isolation, Escape and focus return, search selection, tag suggestions, outgoing and incoming graph links, search and backlink navigation, and browser Back. The skip action left the URL and history untouched. The first code example copied its expected 125 characters. The cold reduced-motion graph made zero external graphics requests and scheduled zero animation frames during the observed quiet window. Changing the preference while the dialog was open restored the graphical choice only after the libraries were ready. With the optional graphics blocked, the connection links still worked from a phone. [Dark graph](design-evidence/graph-global-dark.webp) · [Light graph](design-evidence/graph-global-light.webp) · [Keyboard connections](design-evidence/graph-keyboard-dark.webp) · [Explorer while loading](design-evidence/explorer-initial-load.webp)

The article body measured **17.50:1 light and 19.26:1 dark** against its page, and secondary text measured 6.26:1 and 9.14:1. Light-mode graph edge ink rose from 1.33:1 to 3.57:1 against the local panel, and measured 3.90:1 against the global background. Dark graph edges measured 4.24:1 against black. The final global canvas screenshots contained 3,249 light and 3,269 dark pixels exactly matching the intended edge ink. Edge antialiasing and focus effects also produce intermediate colors. Graph zoom, hover and the Connections view expose individual labels in a crowded region.

Axe reported best-practice heading-order findings on Home and archive. While mobile Explorer covers the page, the background main and H1 are intentionally unavailable to navigation. Axe left some contrast checks for human review. The measured colors and keyboard walkthrough cover the sampled interfaces. Image descriptions remain an editorial question for individual posts. Physical devices, assistive-technology speech output and production field measurements were outside this audit. [Backlog](DESIGN_BACKLOG.md)

The local production build emitted 913 files. Comparing its 252 HTML paths with the baseline found identical path sets, titles, meta tags and canonical links. The search content index matched byte for byte. RSS and sitemap structure matched, with only generated `pubDate` and `lastmod` text differences. The 161 non-redirect pages include content, archives, tags and the 404 page. No source article was edited. `npm test` passed all 164 tests. The baseline checkout and final worktree both report the same two dependency type errors under `tsc --noEmit`, for `micromorph` and `remark-parse/lib`.

## Performance and font validation

These are medians from seven fresh Chromium contexts per build and route, alternated between builds at a 900×850 viewport. The local server and browser were the same. External requests were blocked in this comparison. Byte counts are encoded response bodies of same-origin subresources, excluding the page HTML. The full graph and degraded-network interactions were tested separately.

| Measurement | Home before | Home after | Azure Machine Configuration before | Azure Machine Configuration after |
| --- | ---: | ---: | ---: | ---: |
| Font bytes | 310,724 | 115,156 | 526,024 | 243,172 |
| CSS bytes | 126,462 | 127,620 | 126,462 | 127,620 |
| Local subresource bytes | 1,299,578 | 1,112,185 | 1,654,620 | 1,379,943 |
| Local subresources | 49 | 49 | 55 | 54 |
| Largest contentful paint | 48ms | 48ms | 68ms | 64ms |
| Cumulative layout shift | 0.0511 | 0.0539 | 0.0345 | 0.0253 |

Home layout shift increased by 0.0028 in this sample. Total local subresource bytes fell 14% on Home and 17% on the article. These local paint and shift figures describe this run. Real-user performance depends on the device and network.

Browser platform-font inspection identified Source Serif 4 glyphs in the title, paragraphs and emphasis, SN Pro glyphs in navigation and TX-02’s Berkeley Mono regular and medium in highlighted and inline code. Regular, medium, bold and their three obliques were verified. TX-02 supplied accented Latin, arrows and box drawing in the test strings. Emoji, Arabic and CJK used installed fallback fonts for missing glyphs. Syntax tokens and line-number counters inherited the mono stack. [Typeface comparison](design-evidence/font-candidates.webp) · [System and asset provenance](DESIGN_SYSTEM.md)
