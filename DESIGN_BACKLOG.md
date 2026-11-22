# Design backlog

| Priority | Follow-up | Reason and trigger |
| --- | --- | --- |
| Editorial, per article | Review image alternatives when revising image-heavy tutorials. | Some Markdown screenshots have an empty alternative and nearby step instructions. An author familiar with each image should decide whether the surrounding text conveys the whole instruction. Preserve the original articles in this design change. |
| Validation, next release | Exercise search and graph-dialog controls with VoiceOver/Safari and NVDA/Firefox, and on physical touch devices. | Automated Chromium checks and manual browser keyboard tests cover rendered semantics, focus and input handling. They do not measure every screen reader’s speech output. |
| Performance, when field data exists | Check Web Vitals and graph performance on readers’ devices. | The documented transfer sizes, layout shifts and paint times are from controlled local runs. CDN availability, hardware and real network latency affect field results. |
| Maintenance, dependency update | Recheck the existing micromorph declaration export and remark-parse/lib type import when the dependencies change. | The untouched checkout and the design branch report the same two TypeScript errors. The production build and unit tests run independently of these errors. |
| Conditional, font coverage | Extend the OFL webfont subsets if the publication begins carrying substantial content in a new script. | System fallback currently supplies glyphs outside the local Latin subsets. Request and measure additional assets only for actual content. |
| Upstream, graph plugin | Revisit the site’s small integration layer if upstream exposes a reduced-motion rendering mode or separate theme inputs for graph edges. | These would let the blog remove corresponding local behavior. Preserve keyboard access, SPA cleanup and reduced-motion startup when upgrading. |

Use the decisions log before retrying an earlier experiment. No production deployment or field instrumentation is part of this design review.

The accessibility review also recorded heading-level jumps on Home and archive. At the next template update, review the outline shared by the graph sidebar and archive headings. With the mobile drawer open, the page main and H1 are intentionally inert so focus stays within the drawer. Axe left some Home, article and search contrast checks for human evaluation. Sampled palette ratios and the measured scope appear in the design review.
