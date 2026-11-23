# Design decisions

## Home table dividers on first load

Cycle 52 used separate cell borders with zero spacing. At 900px and 1440px the pinned labels still lost parts of their dividers or painted them one pixel above the adjoining cell. The color fade also applied to part of the first row's border. Drawing a single rule per row restored continuity through the pinned column and the faded links. [Rejected tablet rendering](design-evidence/home-table-dividers/cycle-52-900-light.webp) · [First-load comparisons](design-evidence/home-table-dividers/first-load-light.webp)

The same experiment adjusted document scrolling after reload. With a delayed Quartz script, that adjustment reversed a reader's earlier Home-key or wheel input. It was removed from the row-divider fix.

Cycle 53 gave the three lower dividers to the rows, leaving the outer top border on the table. Firefox at 1280px and normal zoom still lost the label-width section above “Obtained.” The first row also needs to paint that top edge. [Firefox comparison](design-evidence/home-table-dividers/firefox-top-edge.webp)

Cycle 54 placed the last stroke directly on the scroll container's clip edge. At 503px and 505px in Firefox its native scrollbar covered that stroke. Moving the stroke 1px inward fixed the two first-load reproductions while preserving the table's geometry. [Cycle record](DESIGN_PROGRESS.md#cycles-5255--home-table-dividers)

## Print and high-contrast Search

| Cycle | Rejected implementation and reason |
| --- | --- |
| 49 | Switching dark pages to paper colors left Shiki keywords at 3.97:1 when printing backgrounds. The compact Contents control still printed and Home added a blank sheet. The corrected print layout uses the light syntax ink from either theme, limits compact navigation to the screen and releases viewport minimum heights on paper. [Printed dark article and Home](design-evidence/final-css/cycle-49-print-dark.webp) |
| 50 | Clipping one pixel from the autocomplete overlay removed the line across the search field. With a tag selected in forced colors, the browser still painted over the typed prefix. After typing `#az`, the user saw only `ure`. Preserve the suggestion's transparency and use the system GrayText color for its suffix. [Intermediate result](design-evidence/final-css/forced-search-dark.webp) · [Corrected query](design-evidence/final-css/final-forced-search-dark.webp) |

## Graph startup and Home certification table

| Cycle | Rejected implementation and reason |
| --- | --- |
| 44 | A retiring Pixi application released shared resources and interrupted the surviving graph. Physical left alignment and a JavaScript-only inset hid short status values in RTL or with scripting disabled. A fractional native endpoint could also exceed the rounded scroll range. [Review](design-evidence/refresh-repair/cycle-44/reviews.json) |
| 45 | Logical text alignment exposed pinned RTL row headings to the table-wide physical-right fade. Panning reduced the brightness of the final letters even though the headings were stationary. [Review](design-evidence/refresh-repair/cycle-45/reviews.json) |
| 46 | The stylesheet optimizer translated `:dir(rtl)` into language selectors. On an English page using RTL direction, the production stylesheet still masked entire row headings. A selector based on the scrolling cell works independently of page language and direction. [RTL comparison](design-evidence/refresh-repair/cycle-46/rtl-phone.webp) · [Review](design-evidence/refresh-repair/cycle-46/reviews.json) |

## Foldable callout markup

Replacing the entire callout blockquote with `details` broke navigation to a callout title from a Search result. It also left body matches hidden when the callout was closed. The first implementation was rejected. Quartz’s Search plugin includes blockquotes in its match selection. [Search comparison](design-evidence/callout-review/corrected/search-dark.webp) · [Initial decisions](design-evidence/callout-review/reviews.json)

## Section link destination

A CSS-only `:target` rule failed on real Contents links in Chromium and WebKit. Quartz uses `history.pushState()`, which can leave the previous heading selected. The accepted treatment uses the heading resolved by the existing fragment router. [Browser checks](design-evidence/section-cue/browser-results.json) · [Review decisions](design-evidence/section-cue/reviews.json)

## Extended review of the accepted visual system

| Decision | Reason |
| --- | --- |
| Preserve article and listing typography after separate trials. | Balancing the long phone title split a product name without reducing height. A 6% increase in listing type put six more phone titles on multiple lines. SN Pro remains the UI face, Source Serif 4 the article face and TX-02 the code face. [Type trials](design-evidence/extended-review/type.json) |
| Reject animated theme backgrounds and uniform breadcrumb or link treatments. | A 180ms transition briefly reduced the title’s contrast to about 1:1. The metadata and hover trials removed hierarchy or emphasized already distinct links. The graph accent trial reduced dark visited-to-background contrast without separating all three node roles. [Theme trials](design-evidence/extended-review/states.json) |
| Invert ordinary code selection inside fences and wrap the unrendered Mermaid source. | The original selection fill nearly matched the marked line. Source wrapping makes the entire raw graph definition readable on phone when the diagram library fails. [Selection](design-evidence/extended-review/B5-selection.webp) · [Raw source](design-evidence/extended-review/D5.webp) |
| Back the single transparent framework diagram with ivory in dark mode. | Its five black connectors disappeared in WebKit. The remaining external SVG assets were separately checked. [Captures](design-evidence/extended-review/C5.webp) |
| Reject changing image visibility only while the footer holds keyboard focus. | When the user reversed direction, WebKit recalculated the article height and left the focused backlink offscreen. Keeping normal intrinsic layout for unsized images gives the same geometry before and after focus transfer. [Focus comparison](design-evidence/extended-review/focus.webp) |
| Give Contents and Backlinks an equal preferred share, capped at each list’s content height. | A zero basis collapsed both lists in WebKit. An automatic basis restored two similar lists but let 16 Contents entries take all the space from a single backlink at heights of 513px and 600px. A 50% basis preserved the sole backlink and allowed the long list to scroll. [Two lists](design-evidence/extended-review/rail.webp) · [Asymmetric lists](design-evidence/extended-review/rail-asymmetric.webp) |

Enforcing a footer scroll anchor while a footer link has keyboard focus also failed the reading-position test. It kept the footer visible when delayed images arrived. When a reader scrolled back to the article with focus still on the footer link, the same rule moved the paragraph by 359px in Chromium and WebKit. The baseline moved it by less than 1px. The underlying correction is to emit each image’s actual width and height. [Scroll-anchor trials](design-evidence/extended-review/validation.json)

## Explorer, dark navigation and code controls

| Decision | Evidence and rationale |
| --- | --- |
| Keep the existing Explorer type weights and row spacing. | All 56 Blog labels fit in the published layout with a 4px sibling gap. Widening active file glyphs from weight 450 to 500 added a line in four tablet titles. Weight 550 added a line in five. An underline restores the forced-color selection cue without changing line breaks. [Tablet current item](design-evidence/navigation-review/current-900.webp) |
| Keep solid ink on the black reading surface. | The published secondary ink has 9.14:1 contrast. At 80% and 65% opacity the same navigation fell to 6.00:1 and 4.18:1. Reviewers also compared solid, darker and brighter grays in Contents. The existing ink preserves a distinction between navigation and prose. [Dark Explorer](design-evidence/navigation-review/dark-explorer.webp) · [Dark Contents](design-evidence/navigation-review/dark-contents.webp) |
| Preserve the original Copy when initialization runs twice. | Keeping only the newly inserted button discarded keyboard focus on the original. Hiding the prepended buttons with visibility preserves both focus and the width that Quartz uses to place Expand. Removing them from layout would lose that measurement. Clipboard initialization still needs an upstream fix. |
| Reject the first Copy transition change in isolation. | At 40ms during text enlargement the previous style had 6.22px clearance. The first revision allowed the two targets to overlap by 20.58px because Expand still animated its width and right offset. Restrict Expand to paint transitions too. [Three builds at 40ms](design-evidence/navigation-review/control-resize.webp) |

## Publication audit and cross-browser font sizing

| Decision | Reason |
| --- | --- |
| Adopt a shared 14.5px default TX-02 token and inherit it in sticky line numbers. | At 14px the owner found inline text too small. At 15px two tablet command rows wrapped, an additional Azure fence needed scrolling and the first phone variable definition gained a line. The 14.5px trial preserved those examples. One other 900px project table now scrolls 5px within its wrapper. |
| Retain Source Serif 4 for articles and the current title scale. | SN Pro produced longer lines at the same measure. The larger title trial pushed the long Defender heading from four phone lines to five. |
| Retain the current archive row padding. | At 1.14rem of padding per edge, whole rows visible fell from seven to six on mobile and from ten to nine on larger widths. |
| Decline the pretty paragraph wrapping trial. | Chromium removed 26 isolated last words without increasing height. WebKit added a line to ten paragraphs and Firefox kept its original line endings. |
| Keep the plain light and pure-black surfaces. | The grid crossed type and section rules, stipple altered the reading surface, and drifting particles added continuous motion. |
| Retain right-only table fading. | A matching left fade dimmed the pinned Home row label at an intermediate position. Keyboard focus and forced colors use the established clear-mask behavior. |
| Reject the first Mermaid toolbar revision. | An uninitialized Expand button intercepted Copy, focus faded in over 200ms under reduced motion, and a live font preference change made the plugin’s cached pixel offset stale. The corrected build hides the dormant action and uses the current control size. |

[Typography trials](design-evidence/publication/type-code-900-light.webp) · [Archive comparison](design-evidence/publication/archive-search.webp) · [Table edge comparison](design-evidence/publication/table-fades.webp) · [Motion trials](design-evidence/publication/motion-compare-390.jpg)


The independent design director reviewed measurements and matched browser captures before implementation. OpenAI served as a secondary reference for discovery. Anthropic’s editorial pages provided the primary reference for the relationship between titles, prose and metadata.

| Decision | Evidence and rationale | Reconsider when |
| --- | --- | --- |
| Use Source Serif 4 for editorial text, SN Pro for UI and vendor TX-02 WOFF2 for code | Four font systems were compared on real posts and archives. Source Serif tracked the former reading measure within two characters on phone/tablet/desktop and preserved all seven sample archive row heights. SN Pro keeps setup controls distinct. The owner confirmed web rights for the foundry package. | A new writing system, licensing change or substantial shift in article format changes the requirements. |
| Retain 43rem and the tested fluid type scale | At 1440px, fixed 16/17/18px Source Serif produced median lines of 86/80/75 characters. Fixed 18px on phones shortened the median to 37. At the current scale the responsive median was 42/75/75. | New layouts change the column width, or actual readers report difficulty. |
| Centralize styling in SCSS | The former entry imported 2,160 lines of indented Sass and added a final override layer. Converting the source before making changes produced exactly the same compiled CSS bytes. Folding overrides into the owning selectors makes the cascade inspectable. | Quartz changes its styling entry or cascade contract. |
| Use separate ink for graph connections and page dividers | The baseline used the pale border color for lines inside a tinted canvas. The edge-to-surface ratio was about 1.33:1 in light mode. The renderer reads global values, while the document can inherit a quieter rule. | The graph plugin supports independent theme inputs. |
| Remove the separate Connections view at the site owner’s request | The graph opens directly to the interactive canvas. Explorer, search, tags and backlinks continue to expose page links. Reduced motion suppresses the animated graph. | The owner requests a different graph interaction. |
| Give disclosure and search states to their actual controls | The initial browser audit found invalid Explorer state, a broken TOC reference and a listbox without options. Focused search input must identify the result selected by arrow keys. | An updated component supplies the same semantics natively. |
| Reject charcoal as the main dark surface | Matched screenshots and computed styles showed `#111210` where the brief requires black. | The site owner changes the color standard. |
| Reject the old Anthropic webfont declarations | No web license accompanied the supplied faces. The licensed serif alternative retained the column measure with less font transfer. | A verified license and a new reading comparison justify a change. |
| Reject an all-sans system and system-serif-only prose | SN Pro throughout reduced the distinction between text and controls. Georgia fell back to Liberation Serif in the test browser and reached 90 characters per desktop line. | Cross-device evidence shows a different result for the actual readership. |
| Reject larger archive and search type across the board | Four of the first five phone archive titles wrapped at 20px. A tablet search with eight matches used 79px more vertical space at larger result sizes. | A different template or content density warrants another trial. |
| Reject continuous ambient motion | A 16-second transform on two contours changed 0.21% of desktop light pixels and 0.19% in dark mode, entirely in the outer margins. Mobile and reduced-motion captures showed no useful difference. Two animation timelines stayed active on desktop. | An explicit orientation or navigation benefit can be demonstrated, with an idle power profile. |
| Reject particles, scroll-linked decoration and a marketing hero | Existing navigation already exposes the archive, search, and article sections. The static-versus-moving comparison yielded no reading benefit. Particles and a marketing hero were design proposals only, not implemented prototypes. | A new editorial task requires them and comparative evidence supports the cost. |
| Reject increasing the global graph label multiplier from 0.6 to 0.9 | Pixi drew 159 labels at 9px or 13.5px before zoom. Larger text helped one hovered title but crowded the full graph. At 0.6, four of the 160 titles exceeded 280px; at 0.9, 28 exceeded it. At 355px the count rose from zero to 11. Retain zoom for inspecting individual labels. | The renderer gains collision-aware or selective labels. |
| Reject hiding a moving canvas solely with CSS | The reduced-motion test still captured 7,731 changed pixels in the local Home canvas in 180ms. An early V5 component resource guard allows a fresh reduced-motion visit to skip starting the simulator. | An upstream lifecycle offers an equally effective preference-aware startup. |
| Reject relying on string equality for disclosure IDs | Explorer and TOC had both emitted `list-0`. The button's attribute matched a string but resolved to the wrong element. Use the TOC instance ID on the actual controlled list and verify DOM identity. | The plugin emits a unique, correctly wired pair. |
| Use the mobile Explorer’s existing readiness marker | Filmstrip and hit tests showed that a cold navigation could paint an empty full-screen drawer and make the reading surface inert until the content index arrived. V5 already distinguishes a loading toggle from a ready one. Honor that state in both the stylesheet and the disclosure logic. | Upstream supplies a complete mobile loading and disclosure state. |
| Use a flat page background in both themes | In 24 comparisons across Home, article and archive, flat margins preserved the article measure. The old drawing clipped to a 4px strip at 900px and spread across both outer margins on a 1920px screen. Anthropic’s reading page uses the same warm off-white and plain margins. | A future page has an editorial purpose for its own illustration. |
| Retire the 0.875em inline code size | The owner found it too prominent beside Source Serif 4. At 390px, regular TX-02 at 0.8em with a 13px floor and tighter padding kept short commands together. In tables the floor preserved letter size. [Paired article excerpts](design-evidence/cycle-10/inline-iteration.webp) | The code or prose face changes, or readers report difficulty at the tested sizes. |
| Keep solid metadata and the existing graph-edge palette | At 82% ink, light archive dates fell from 6.26:1 to 4.13:1. The lighter graph-edge trial reduced the local graph to 2.04:1 light and 2.37:1 dark. [Rendered comparisons](design-evidence/polish-series/color-trials.webp) | The surfaces, face or graph renderer changes. |
| Keep the archive title and date tracks | Widening the tag track shortened the 56-row list but wrapped another headline at each of the larger test widths. A 20px title wrapped seven of the first eight phone headlines. [Reading trials](design-evidence/polish-series/reading-trials.webp) | A new article mix materially changes title lengths or tag density. |
| Reject link previews that cover the archive after Escape | Removing the fade restored the preview under reduced motion. Hiding only the first card could reveal a second preview when there was a link beneath the pointer. The accepted handler waits for real pointer movement before resuming hover. [Stationary-pointer comparison](design-evidence/polish-series/escape.webp) | Upstream supplies equivalent dismissal and pending-request handling. |

### Allow long archive tags to wrap at the date column

The date-column change alone left `penetration-testing` on one line in Firefox, overlapping the date at a 20px native minimum. The final archive tag rule allows the text to wrap at a natural opportunity. Reducing flex item minimum width alone left the collision in place. Preserve keyboard focus and the full text of both items. [Before and after](design-evidence/inline-readability/firefox-tags.webp)

### Let archive dates expand at larger minimum font settings

A fixed date column pushed the 900px Blog page past its viewport when the browser enforced a 20px minimum font. Keep 7rem as the reserved width and let the column grow to fit the date. This preserved the default layout in all 56 sampled rows and kept enlarged dates readable. [Tablet comparison](design-evidence/inline-readability/archive-900.webp)

### Share the 14px token between inline and fenced code

The owner found the 12.5–13px range too small. In the 13.5px phone trial, WebKit still drew capital H at the previous 9px ink height. The 14px trial produced a 10px capital matching the box. Keep the same rem-based size for regular and emphasized inline commands, table commands and block syntax. The 13.5–14px alternative reduced wrapping in a few narrow contexts, but retained the smaller phone capital height. Retest if the typeface or the shared code scale changes. [Cycle 2 comparisons](design-evidence/inline-readability/inline-390.webp)

### Previous decision, superseded in cycle 2 · Smaller inline TX-02

The previous 0.8em sizing could exceed the 14px code box on desktop. A fixed 13px trial kept the previous phone size. A fixed 12px trial reduced desktop commands further than necessary. Use the bounded 12.5–13px default-size range and preserve author-applied bold. Compared with the same variable in a real PowerShell block, the revised inline token occupies less horizontal space across all three tested engines. [Matched comparisons](design-evidence/cross-browser/inline-1440.webp)

### Reserve the actual dimensions of the IACS illustrations

Accept the five native width/height pairs with one shared fluid display rule. When the browser received the PNGs late, captions and adjacent prose previously shifted by up to 199px beneath the captioned illustrations. Reject the approximate 2:1 ratio. It left 1.55–7.02px of movement on the four captioned diagrams and would give the uncaptioned 716 × 451px illustration the wrong proportions. With exact dimensions, the five final boxes match their reserved boxes. [Phone](design-evidence/polish-series/reserve-390.webp) · [Tablet](design-evidence/polish-series/reserve-900.webp) · [Desktop](design-evidence/polish-series/reserve-1440.webp)
