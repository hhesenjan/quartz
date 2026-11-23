# Independent review record

The three reviewers inspected the running sites separately before exchanging findings. Each cycle used the same routes, viewport sizes, themes, fonts and interactions as the accepted baseline. The responsive checks also exercised Firefox zoom and WebKit. The print comparisons used actual browser PDFs. The following entries summarize the independently submitted assessments. [Matched screen and paper evidence](screenshots.json)

## Cycle 49

| Reviewer | Decision and evidence |
| --- | --- |
| Visual Design | **REVISE.** Compared Home, Blog and tag listings, technical articles, images, local and global graph, callouts, search and navigation at 390, 900 and 1440px in both themes. Type scale, spacing, graph controls and screen feedback held. Printed prose and tables improved. Material issue with dark-preference syntax red at 3.97:1 on the printed ivory panel. Home added a blank sheet and articles retained a collapsed Contents control. The defects could be corrected within the existing print and syntax rules. |
| Responsive and Accessibility | **REVISE.** Inspected paired screen states, tested 70 Chromium layout combinations and 108 interaction snapshots, and compared Chromium and WebKit print styles. Dark-theme prose became legible on paper at 18.43:1. TX-02 and keyboard behavior held. Confirmed the material keyword contrast defect, the printed disclosure and the excess sheet. Recommended reusing the established ink correction across paper themes. |
| CSS and Quartz V5 | **REVISE.** Examined the source, emitted CSS, six primary screen contexts and native PDFs from the top of an article and after a 600px scroll. The toolbar stopped covering content. Recovered all 20 macOS policy descriptions and all seven distinct long Azure code lines. Screen graph, search, code and mobile navigation retained their behavior. The existing selector still excluded a dark saved preference from the light paper syntax correction. |

[Azure and Home on paper](cycle-49-print-dark.webp) · [Phone in light mode](cycle-49-390-light.webp)

## Cycle 50

| Reviewer | Decision and evidence |
| --- | --- |
| Visual Design | **REVISE.** Approved the paper and mobile navigation work. Home fit one sheet, the compact Contents control disappeared and paper syntax red reached 6.33:1 for either preference. A 320px and 390px touch walkthrough covered 56 Blog labels, active and folded folders, the last nested project, a 4px row gap and 44px minimum touch targets. An article held its 1,220px reading position. In high-contrast Search, selecting a tag left only the suffix visible. |
| Responsive and Accessibility | **REVISE.** Tested 70 Chromium and 30 WebKit layout states, 18 mobile Explorer configurations and 36 native Firefox zoom and font states. Keyboard focus, reflow, reader mode, contrast and paper checks passed apart from the selected tag's missing typed prefix. Inspecting the field and hiding the decorative overlay identified which element covered it. Recommended preserving its transparent background and using the system suggestion color. |
| CSS and Quartz V5 | **REVISE.** Compared the frozen source and running candidate, the six primary screen contexts, printed output and eleven distinct screen token declarations. Lighting and control changes were confined to their intended media. Drawer edges, scroll containment, inert background and Escape behavior held. The overlay clipped its border correctly but the browser still painted over the query prefix. The field showed only the suggested ending even after settling for two seconds. A ghost-only system-color trial restored both parts of the word. |

[Search overlay](forced-search-dark.webp) · [Corrected paper colors](cycle-50-print-dark.webp)

## Cycle 51

| Reviewer | Decision and evidence |
| --- | --- |
| Visual Design | **APPROVE.** Inspected normal and forced-color Search, phone Explorer, graph, disclosure and surrounding layouts in both themes. At all three widths the typed prefix and suggested ending were distinguishable, with visible keyboard focus and correct completion. Narrow-phone touch targets, wrapped labels and article scroll position held. All 64 rasterized pages from 12 paper exports matched the corrected cycle 50 output. |
| Responsive and Accessibility | **APPROVE.** Tested 70 Chromium and 30 WebKit layouts, 186 interaction snapshots, 18 Explorer viewport/theme cases, native Firefox with 100–400% zoom and enlarged default/minimum fonts. Firefox system colors and keyboard navigation preserved the complete tag. Tab reached Close and dismissing Search returned focus. The print token samples exceeded 4.5:1. No material responsive or accessibility defect remained in the reviewed states. |
| CSS and Quartz V5 | **APPROVE.** The compiled forced-colors rule targets the decorative autocomplete span alone and uses system GrayText. The input, Close button and interactive suggestions retain native colors. Verified the mobile drawer on six routes in both themes, including a nested project. The background remained inert, the tree scrolled independently, Escape returned focus, and code, graph, search and print checks passed. No dependency, feature or component changes were needed. |

[Corrected Search](final-forced-search-light.webp) · [Mobile Explorer](mobile-explorer.webp) · [Automated and browser measurements](validation.json)
