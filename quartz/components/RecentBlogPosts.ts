import { RecentNotes, type RecentNotesOptions } from "@quartz-community/recent-notes"
import type { QuartzPluginData } from "../plugins/vfile"
import { isFolderPath } from "../util/path"
import type { QuartzComponent, QuartzComponentConstructor } from "./types"

export function releasedBlogPosts(files: QuartzPluginData[]) {
  const now = Date.now()
  return files.flatMap((page) => {
    if (
      !page.slug?.startsWith("blog/") ||
      !page.relativePath?.endsWith(".md") ||
      isFolderPath(page.slug) ||
      page.unlisted
    )
      return []

    // Only an authored publication date denotes a release. Quartz synthesizes the missing one.
    const defaultDateType: "published" | "created" = page.frontmatter?.published
      ? "published"
      : "created"
    const released = page.dates?.[defaultDateType]
    return released && released.getTime() <= now ? [{ ...page, defaultDateType }] : []
  })
}

export const RecentBlogPosts: QuartzComponentConstructor<Partial<RecentNotesOptions>> = (
  options,
) => {
  const List = RecentNotes(options) as QuartzComponent
  const render: QuartzComponent = (props) => {
    const posts = releasedBlogPosts(props.allFiles)
    return posts.length ? List({ ...props, allFiles: posts }) : null
  }
  return Object.assign(render, List)
}
