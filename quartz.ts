import fs from "node:fs/promises"
import path from "node:path"
import type { GraphOptions } from "@quartz-community/graph/components"
import { byDateAndAlphabetical, getDate } from "@quartz-community/utils"
import type { QuartzEmitterPluginInstance } from "./quartz/plugins/types"
import type { ProcessedContent } from "./quartz/plugins/vfile"
import { calloutDisclosures } from "./quartz/plugins/transformers/calloutDisclosures"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type { ExplorerOptions } from "./.quartz/plugins"
import graphScript from "./quartz/components/scripts/graph.inline"
import { componentRegistry } from "./quartz/components/registry"
import { RecentBlogPosts, releasedBlogPosts } from "./quartz/components/RecentBlogPosts"
import type { QuartzComponent, QuartzComponentConstructor } from "./quartz/components/types"

componentRegistry.register("@quartz-community/recent-notes", RecentBlogPosts, "site")

componentRegistry.setOptionOverrides("explorer", {
  sortFn: (a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1

    const alphabetical = (a.displayName ?? "").localeCompare(b.displayName ?? "", undefined, {
      numeric: true,
      sensitivity: "base",
    })

    if (a.isFolder) return alphabetical

    const aCreated = a.data?.created
    const bCreated = b.data?.created

    const aTime = typeof aCreated === "string" ? Date.parse(aCreated) : NaN
    const bTime = typeof bCreated === "string" ? Date.parse(bCreated) : NaN
    const aValid = Number.isFinite(aTime)
    const bValid = Number.isFinite(bTime)

    if (aValid && bValid) return bTime - aTime || alphabetical
    if (aValid) return -1
    if (bValid) return 1
    return alphabetical
  },
} satisfies Partial<ExplorerOptions>)

let upstreamGraph: QuartzComponentConstructor<GraphOptions> | undefined
const siteGraph: QuartzComponentConstructor<GraphOptions> = (options: GraphOptions = {}) => {
  upstreamGraph ??= componentRegistry.get("Graph")?.component as
    QuartzComponentConstructor<GraphOptions> | undefined
  if (!upstreamGraph) return () => null
  const Graph = upstreamGraph
  const article = Graph(options)
  const home = Graph({
    ...options,
    localGraph: {
      ...options.localGraph,
      depth: -1,
      drag: false,
      zoom: false,
      enableRadial: true,
      repelForce: 0.025,
      linkDistance: 14,
    },
  })
  const render: QuartzComponent = (props) =>
    props.fileData.slug === "index" ? home(props) : article(props)
  const component = Object.assign(render, article)
  component.afterDOMLoaded = graphScript
  return component
}
// loadQuartzConfig builds its page dispatcher with the layout as it loads.
componentRegistry.register("@quartz-community/graph", siteGraph, "site")
const config = await loadQuartzConfig()
config.plugins.transformers.push(calloutDisclosures)
// V5 also gathers resources from every registered alias, including the original
// plugin constructor. Share the site constructor so its script is emitted once.
for (const [name, entry] of componentRegistry.getAll()) {
  if (entry.component === upstreamGraph) {
    componentRegistry.register(name, siteGraph, entry.source, entry.manifest)
  }
}

// Every page with Explorer displays the same releases. Compare only the inputs
// shown by Recent Notes so ordinary content edits keep Quartz's incremental path.
function releaseMetadata(content: ProcessedContent[]) {
  const posts = releasedBlogPosts(content.map(([, file]) => file.data))
  return JSON.stringify(
    posts
      .sort(byDateAndAlphabetical())
      .map((page) => [page.slug, page.frontmatter?.title, getDate(page)]),
  )
}

const pageDispatcher = config.plugins.emitters.find(
  (plugin) => plugin.name === "PageTypeDispatcher",
)
if (pageDispatcher?.partialEmit) {
  const emit = pageDispatcher.emit.bind(pageDispatcher)
  const partialEmit = pageDispatcher.partialEmit.bind(pageDispatcher)
  let previousReleases: string
  pageDispatcher.emit = async function* (ctx, content, resources) {
    const releases = releaseMetadata(content)
    yield* await emit(ctx, content, resources)
    previousReleases = releases
  }
  pageDispatcher.partialEmit = (ctx, content, resources, changes) => {
    if (releaseMetadata(content) !== previousReleases) {
      // A full dispatch rebuilds its folder tree when the cached trie is absent.
      ctx.trie = undefined
      return pageDispatcher.emit(ctx, content, resources)
    }
    return partialEmit(ctx, content, resources, changes)
  }
}

// Keep the standard content index, RSS, and sitemap, and expose creation dates
// to browser components such as Explorer. Wrap both full and preview builds.
const contentIndex = config.plugins.emitters.find((plugin) => plugin.name === "ContentIndex")
if (!contentIndex) throw new Error("Explorer date sorting requires the ContentIndex plugin")

const originalEmit = contentIndex.emit.bind(contentIndex)
const emitWithCreatedDates: QuartzEmitterPluginInstance["emit"] = async (
  ctx,
  content,
  resources,
) => {
  const result = originalEmit(ctx, content, resources)
  const outputs = []
  if (Symbol.asyncIterator in result) {
    for await (const output of result) outputs.push(output)
  } else {
    outputs.push(...(await result))
  }

  const indexPath = path.join(ctx.argv.output, "static", "contentIndex.json")
  const index: Record<string, { created?: string }> = JSON.parse(
    await fs.readFile(indexPath, "utf8"),
  )
  for (const [, file] of content) {
    const slug = file.data.slug
    const created = file.data.dates?.created
    if (slug && index[slug] && created && Number.isFinite(created.getTime())) {
      index[slug].created = created.toISOString()
    }
  }
  await fs.writeFile(indexPath, JSON.stringify(index))
  return outputs
}
contentIndex.emit = emitWithCreatedDates
contentIndex.partialEmit = emitWithCreatedDates

export default config
export const layout = await loadQuartzLayout()
