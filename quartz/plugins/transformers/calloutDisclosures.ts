import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { QuartzTransformerPluginInstance } from "../types"

function childWithClass(parent: Element, className: string) {
  return parent.children.find(
    (child): child is Element =>
      child.type === "element" &&
      Array.isArray(child.properties.className) &&
      child.properties.className.includes(className),
  )
}

export function applyCalloutDisclosures(tree: Root) {
  visit(tree, "element", (callout) => {
    const classes = callout.properties.className
    if (
      callout.tagName !== "blockquote" ||
      !Array.isArray(classes) ||
      !classes.includes("callout") ||
      !classes.includes("is-collapsible")
    ) {
      return
    }

    const title = childWithClass(callout, "callout-title")
    if (!title) return
    const body = childWithClass(callout, "callout-content")
    const arrow = childWithClass(title, "fold-callout-icon")
    // Only the browser should toggle the disclosure, including after Quartz's render event.
    callout.properties.className = classes.filter(
      (c) => c !== "is-collapsible" && c !== "is-collapsed",
    )
    if (
      !body?.children.some(
        (child) => child.type === "element" || (child.type === "text" && child.value.trim()),
      )
    ) {
      title.children = title.children.filter((child) => child !== arrow)
      return
    }

    // Search visits blockquotes to find text in titles as well as their bodies.
    const disclosure: Element = {
      type: "element",
      tagName: "details",
      properties: { open: !classes.includes("is-collapsed") },
      children: callout.children,
    }
    callout.children = [disclosure]
    title.tagName = "summary"
    // OFM emits a div for each icon and a paragraph around the authored inline title.
    for (const part of title.children) {
      if (part.type !== "element" || part.tagName !== "div") continue
      part.tagName = "span"
      part.children = part.children.flatMap((node) =>
        node.type === "element" && node.tagName === "p" ? node.children : [node],
      )
    }
  })
}

export const calloutDisclosures: QuartzTransformerPluginInstance = {
  name: "CalloutDisclosures",
  htmlPlugins: () => [() => applyCalloutDisclosures],
}
