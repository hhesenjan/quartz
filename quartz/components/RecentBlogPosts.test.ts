import assert from "node:assert/strict"
import { test } from "node:test"
import { h } from "preact"
import { render } from "preact-render-to-string"
import type { QuartzPluginData } from "../plugins/vfile"
import type { FilePath, FullSlug } from "../util/path"
import { RecentBlogPosts } from "./RecentBlogPosts"
import type { QuartzComponentProps } from "./types"

const Recent = RecentBlogPosts({ limit: 3, showTags: false })

function page(slug: string, created: string, published?: string): QuartzPluginData {
  return {
    slug: slug as FullSlug,
    relativePath: (slug + ".md") as FilePath,
    frontmatter: { title: slug, published },
    dates: {
      created: new Date(created),
      modified: new Date("2020-01-01"),
      // The date transformer supplies this even when the author omitted published.
      published: new Date(published ?? "2020-12-31"),
    },
  }
}

function list(allFiles: QuartzPluginData[], slug = "index") {
  const props = {
    fileData: { slug: slug as FullSlug },
    allFiles,
    cfg: { locale: "en-US" },
  } as QuartzComponentProps
  return render(h(Recent, props))
}

test("Recent Notes shows the three latest listed Blog releases with their release dates", () => {
  const edited = page("blog/edited", "2010-01-01")
  edited.dates!.modified = new Date("2021-01-01")
  const html = list([
    edited,
    page("blog/released-later", "2009-02-01", "2013-02-01"),
    page("blog/second", "2012-01-01"),
    page("blog/third", "2011-01-01"),
    page("blog/index", "2019-01-01"),
    page("blog/subfolder/index", "2019-02-01"),
    page("projects/elsewhere", "2019-03-01"),
    { ...page("blog/hidden", "2019-04-01"), unlisted: true },
    page("blog/scheduled", "2018-01-01", "2999-01-01"),
  ])
  assert.deepEqual(
    [...html.matchAll(/href="\.\/blog\/([^"]+)"/g)].map((m) => m[1]),
    ["released-later", "second", "third"],
  )
  assert.deepEqual(
    [...html.matchAll(/datetime="([^T]+)T/g)].map((m) => m[1]),
    ["2013-02-01", "2012-01-01", "2011-01-01"],
  )
})

test("Recent Notes handles short and empty lists, with links relative to each page", () => {
  const files = [page("blog/only", "2010-01-01")]
  assert.equal((list(files).match(/class="recent-li"/g) ?? []).length, 1)
  assert.equal(list([]), "")
  assert.match(list(files, "blog/index"), /href="\.\.\/blog\/only"/)
  assert.match(list(files, "projects/example/article"), /href="\.\.\/\.\.\/blog\/only"/)
})
