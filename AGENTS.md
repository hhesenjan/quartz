# CSS and SCSS review

For every styling change, use the following review gate before accepting the design.

1. Capture the previous accepted implementation in a browser before editing. Use the same content, state, fonts, viewport and theme for the candidate screenshots. Cover mobile, tablet and desktop in light and pure-black dark modes.
2. Keep implementation in `quartz/styles/custom.scss` wherever practical. Follow [the design system](DESIGN_SYSTEM.md). Preserve Quartz V5 behavior, TX-02 for code, graph colors and reduced motion. Keep changes within the existing visual scope.
3. After implementation, give the paired screenshots and runnable previews to three agents independent of the implementer. Each must inspect the actual site, the affected surroundings and relevant Home, listing, article, search, navigation, code, graph and transition states. Collect their initial findings separately before sharing conclusions.
   - The **Visual Design Reviewer** evaluates typography, hierarchy, spacing, alignment, color and consistency with the editorial design.
   - The **Responsive and Accessibility Reviewer** tests readability, zoom, reflow, clipping, contrast, keyboard focus and reduced motion.
   - The **CSS and Quartz V5 Reviewer** examines selector scope, specificity, duplication, cascade, themes, V5 conventions and dependencies.
4. Each reviewer records the changes, pages and viewports inspected, improvements, defects and severity, typography, themes, responsive behavior, maintainability, and an **APPROVE**, **REVISE** or **REJECT** decision. Distinguish demonstrated defects from preferences.
5. Return defects to the implementer. Apply the smallest appropriate correction, rebuild, retest and obtain fresh independent assessments of any revised stylesheet. Acceptance requires at least two approvals, all three completed reviews, passing mandatory automated tests and resolution of every critical or material regression.
6. A separate **Design Director** reviews the evidence, resolves disagreements and gives the final decision. If independent reviewers are unavailable, record the limitation and leave acceptance pending.
7. For every cycle, record the files, change, screenshot links, three assessments, defects, corrections, test results, director decision and disposition in [DESIGN_PROGRESS.md](DESIGN_PROGRESS.md). Record rejected proposals and their rationale in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).
