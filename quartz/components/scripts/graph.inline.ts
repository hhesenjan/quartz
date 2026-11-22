import { simplifySlug } from "@quartz-community/utils"
import { hiddenGraphQuery } from "../mediaQueries"
import { renderGraph } from "./graphRenderer"

const hidden = matchMedia(hiddenGraphQuery)
const mounts = new Map<HTMLElement, { slug: string; config: string; lifetime: AbortController }>()
let libraries: Promise<void[]> | undefined

function loadLibrary(name: "d3" | "PIXI", url: string): Promise<void> {
  if (Reflect.get(window, name)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find((script) => script.src === url)
    const script = existing ?? document.createElement("script")
    script.addEventListener("load", () => resolve(), { once: true })
    script.addEventListener(
      "error",
      () => {
        if (!existing) script.remove()
        reject(new Error(`Could not load ${name}`))
      },
      { once: true },
    )
    if (!existing) {
      script.src = url
      script.crossOrigin = "anonymous"
      document.head.append(script)
    }
  })
}

async function mountGraph(graph: HTMLElement, slug: string, signal: AbortSignal) {
  libraries ??= Promise.all([
    loadLibrary("d3", "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"),
    loadLibrary("PIXI", "https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.js"),
  ]).catch((error) => {
    libraries = undefined
    throw error
  })
  try {
    const [, data] = await Promise.all([libraries, fetchData])
    if (signal.aborted || !graph.isConnected) return
    const visited: Set<string> = new Set(JSON.parse(localStorage.getItem("graph-visited") || "[]"))
    visited.add(slug)
    visited.add(simplifySlug(slug))
    localStorage.setItem("graph-visited", JSON.stringify([...visited]))
    await renderGraph(graph, slug, data, visited, signal)
  } catch (error) {
    if (signal.aborted || !graph.isConnected) return
    console.error("[Graph] Could not render graph:", error)
    graph.textContent = "Graph could not load. Check your network connection."
    mounts.delete(graph)
  }
}

function stopGraphs() {
  for (const mount of mounts.values()) mount.lifetime.abort()
  mounts.clear()
}

function syncGraphs() {
  const slug = document.body.dataset.slug || "index"
  const wanted = new Set(
    hidden.matches
      ? []
      : document.querySelectorAll<HTMLElement>(
          ".graph-container, .global-graph-outer.active .global-graph-container",
        ),
  )
  for (const [graph, mount] of mounts) {
    if (!wanted.has(graph) || mount.slug !== slug || mount.config !== (graph.dataset.cfg ?? "")) {
      mount.lifetime.abort()
      mounts.delete(graph)
    }
  }
  for (const graph of wanted) {
    if (mounts.has(graph)) continue
    const lifetime = new AbortController()
    mounts.set(graph, { slug, config: graph.dataset.cfg ?? "", lifetime })
    void mountGraph(graph, slug, lifetime.signal)
  }
}

function globalOpen() {
  return !!document.querySelector(".global-graph-outer.active")
}

function setGlobalOpen(open: boolean) {
  for (const overlay of document.querySelectorAll<HTMLElement>(".global-graph-outer")) {
    overlay.classList.toggle("active", open)
    const sidebar = overlay.closest<HTMLElement>(".sidebar")
    if (sidebar) sidebar.style.zIndex = open ? "1" : ""
  }
  syncGraphs()
}

document.addEventListener("click", (event) => {
  if (hidden.matches || !(event.target instanceof Element)) return
  if (event.target.closest(".global-graph-icon")) {
    setGlobalOpen(!globalOpen())
  } else if (globalOpen() && !event.target.closest(".global-graph-container")) {
    setGlobalOpen(false)
  }
})
document.addEventListener("keydown", (event) => {
  if (hidden.matches) return
  if (event.key === "Escape" && globalOpen()) setGlobalOpen(false)
  if (event.key === "g" && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
    event.preventDefault()
    setGlobalOpen(!globalOpen())
  }
})

document.addEventListener("prenav", stopGraphs)
document.addEventListener("nav", syncGraphs)
document.addEventListener("render", syncGraphs)
document.addEventListener("themechange", () => {
  stopGraphs()
  syncGraphs()
})
hidden.addEventListener("change", () => {
  if (hidden.matches && globalOpen()) setGlobalOpen(false)
  else syncGraphs()
})
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", syncGraphs, { once: true })
else syncGraphs()

export default ""
