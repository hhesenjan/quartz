import assert from "node:assert/strict"
import test from "node:test"
import type { Element, Root } from "hast"
import { fromHtml } from "hast-util-from-html"
import { visit } from "unist-util-visit"
import { applyCalloutDisclosures } from "./calloutDisclosures"

function elements(root: Root, tag: string) {
  const found: Element[] = []
  visit(root, "element", (element) => {
    if (element.tagName === tag) found.push(element)
  })
  return found
}

const title =
  '<div class="callout-title"><div class="callout-icon"></div><div class="callout-title-inner"><p>Read <a href="/guide"><em>this</em></a></p></div><div class="fold-callout-icon"></div></div>'
function foldable(body: string, state = "") {
  return `<blockquote class="callout tip is-collapsible ${state}" data-callout="tip">${title}<div class="callout-content">${body}</div></blockquote>`
}

test("renders nested callouts with independent native states and preserves rich title links", () => {
  const root = fromHtml(foldable(foldable("<p>Body</p>"), "is-collapsed"), { fragment: true })
  const links = elements(root, "a")
  const body = elements(root, "p").at(-1)
  applyCalloutDisclosures(root)
  const [outer, inner] = elements(root, "details")
  assert.equal(outer.properties.open, false)
  assert.equal(inner.properties.open, true)
  const quotes = elements(root, "blockquote")
  assert.equal(quotes.length, 2)
  assert.strictEqual(quotes[0].children[0], outer)
  assert.strictEqual(quotes[1].children[0], inner)
  assert.deepEqual(quotes[0].properties.className, ["callout", "tip"])
  assert.equal(quotes[1].properties.dataCallout, "tip")
  assert.equal(elements(root, "summary").length, 2)
  assert.deepEqual(elements(root, "a"), links)
  assert.deepEqual(elements(root, "p"), [body])
  const transformed = structuredClone(root)
  applyCalloutDisclosures(root)
  assert.deepEqual(root, transformed)
})

test("keeps static notes intact and removes the inactive fold arrow from an empty callout", () => {
  const root = fromHtml(
    '<blockquote class="callout note"><div class="callout-title">Note</div><p>Text</p></blockquote>' +
      foldable("  "),
    { fragment: true },
  )
  const note = structuredClone(root.children[0])
  applyCalloutDisclosures(root)
  assert.deepEqual(root.children[0], note)
  assert.equal(elements(root, "details").length, 0)
  assert.deepEqual(elements(root, "blockquote")[1].properties.className, ["callout", "tip"])
  assert.equal(
    elements(root, "div").some(
      (el) =>
        Array.isArray(el.properties.className) &&
        el.properties.className.includes("fold-callout-icon"),
    ),
    false,
  )
})
