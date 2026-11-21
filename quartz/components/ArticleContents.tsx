import type { TocEntry } from "@quartz-community/table-of-contents"
import { i18n } from "../i18n"
import type { QuartzComponent } from "./types"

// On narrow screens the rail is hidden. Use the same heading IDs as the desktop TOC.
export const ArticleContents: QuartzComponent = ({ fileData, cfg }) => {
  const entries = fileData.toc as TocEntry[] | undefined
  if (!entries?.length) return null
  const title = i18n(cfg.locale).components.tableOfContents.title

  return (
    <details class="article-contents">
      <summary>{title}</summary>
      <nav aria-label={title}>
        <ul>
          {entries.map(({ slug, text, depth }) => (
            <li key={slug} data-depth={depth}>
              <a href={`#${slug}`} data-for={slug}>
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
