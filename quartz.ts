import fs from "node:fs/promises"
import path from "node:path"
import type { GraphOptions } from "@quartz-community/graph/components"
import type { QuartzEmitterPluginInstance } from "./quartz/plugins/types"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type { ExplorerOptions } from "./.quartz/plugins"
import { componentRegistry } from "./quartz/components/registry"
import type { QuartzComponent, QuartzComponentConstructor } from "./quartz/components/types"

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

// The layout uses the package name; the enabled plugin supplies the "Graph" constructor.
componentRegistry.register(
  "@quartz-community/graph",
  (options: GraphOptions = {}) => {
    const plugin = componentRegistry.get("Graph")
    if (!plugin) return () => null

    const Graph = plugin.component as QuartzComponentConstructor<GraphOptions>
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
    return Object.assign(render, article)
  },
  "site",
)

const config = await loadQuartzConfig()
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
