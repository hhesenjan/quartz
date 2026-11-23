# Independent reviews of the Home table dividers

Each reviewer inspected the accepted page and the candidate independently, before receiving other reviewers’ findings. The primary screen matrix used 390, 900 and 1440px in light and pure-black dark modes. The reviewers exercised the Home table and graph, Explorer, search, listings and technical articles. Font, color, spacing and navigation checks used the existing design system. [Matched screenshots for each cycle](screenshots.json)

## Cycle 52

| Reviewer | Decision | Independent assessment |
| --- | --- | --- |
| Visual Design | REVISE | Separate cell borders improved the phone table. In the 900px full viewport, the first interior rule disappeared under the pinned label and the next row’s two segments differed by one raster line. At 1440px the bottom boundary also broke. Both themes reproduced the defect. Page typography and surrounding layouts held. |
| Responsive and Accessibility | REVISE | Forward and reverse Tab, touch, forced colors, native Firefox zoom and WebKit passed. The experimental viewport restoration introduced a material failure on a slow reload. Moving to the top or using the wheel before the table module arrived was reversed when it finished. |
| CSS and Quartz V5 | REVISE | Measured the wider defects in the full-page screenshot and under the separate table crops. The pinned labels lost or displaced their border ink even when the adjoining cells drew theirs. The printed table, focus, content typography, graph and other Quartz controls passed. |

## Cycle 53

| Reviewer | Decision | Independent assessment |
| --- | --- | --- |
| Visual Design | APPROVE | The four measured boundaries crossed the pinned column and the fade at first paint, initialization, after panning and after refresh in the tested Chromium builds. Both themes and the surrounding controls kept their existing hierarchy and geometry. |
| Responsive and Accessibility | APPROVE | All three row bottoms were continuous across 96 tested Chrome states, including script-disabled and forced-color layouts. The existing scroll controller respected wheel and Home-key input during a delayed reload. Firefox reflow, keyboard focus, WebKit and touch passed. |
| CSS and Quartz V5 | REVISE | The table-level top border still lost 79 of 669 interior pixels in Firefox 159’s full 1280 × 874 viewport at native 100% zoom. The accepted build drew that top edge in the same viewport. All three row-owned bottom dividers held. Moving the top border to the first row in a browser trial restored the missing segment. |

The director reproduced the Firefox failure and requested revision. [Firefox comparison](firefox-top-edge.webp)

## Cycle 54

| Reviewer | Decision | Independent assessment |
| --- | --- | --- |
| Visual Design | APPROVE | Compared the first view before input, panned views and reloads in both themes, including native Firefox at 1440 × 900 and 1440 × 956. All four rules crossed the pinned labels and right edge. The fade still indicated hidden certification links. Font metrics, colors and surrounding layout held. |
| Responsive and Accessibility | APPROVE | All four boundaries crossed the sampled width in 96 Chrome states. The matrix included forced colors, JavaScript enabled and disabled, and all three viewport sizes. Native Firefox retained the four lines through 400% zoom. Touch, forward and reverse keyboard focus, reduced motion, WebKit and delayed-load input checks passed. |
| CSS and Quartz V5 | APPROVE | The emitted screen-only rule uses one decoration per row. The first row draws both edges. In the exact Firefox reproduction all 669 interior pixels carried divider ink, including one antialiased pixel. The 24 native Firefox zoom, theme and pan combinations and the 72 paired Chrome and Brave states passed. Print, focus and other Quartz components kept their existing behavior. |

The candidate introduces no runtime or dependency changes. The browser checks use Linux browsers, emulated touch and system colors, and native Firefox zoom. [Pixel measurements and test results](checks.json)

The director reproduced the cycle 54 top-edge improvement. A further native Firefox sweep identified a material first-load issue at 503px and 505px. The native scrollbar covered the bottom edge at those widths. The director requested another revision. [Narrow Firefox comparison](firefox-bottom-edge.webp)

## Cycle 55

| Reviewer | Decision | Independent assessment |
| --- | --- | --- |
| Visual Design | APPROVE | The 1px inset preserved the table geometry and restored the full bottom line above Firefox's native scrollbar. At 503px, all 445 sampled pixels had divider ink. At 505px, all 447 did. The first view, middle and end positions and reloads passed in both themes. Chrome and Brave also retained the four rules across the label and the fade. |
| Responsive and Accessibility | APPROVE | Tested all four boundaries across 96 Chrome states and 24 targeted Firefox viewport captures at 503px and 505px with and without scripts. The dividers survived first load and refresh. Keyboard, touch, reflow, forced colors and native Firefox zoom passed. In Chrome's forced-colors mode the bottom edge is 2px and remains continuous. |
| CSS and Quartz V5 | APPROVE | On the compiled candidate the last row's inset restored the exact theme ink across all four lines in the two failing Firefox geometries. First-load, pan and zoom checks passed, including adjacent viewport widths and double refresh. The screen-only selector retains the existing table interactions, references a theme color and introduces no dependencies. |

The director verified the first-load reading in Chrome, Brave and Firefox, including 20 fresh Firefox viewport widths and zoom through 400%, and approved the final local build. [Director's decision and measurements](director.md)
