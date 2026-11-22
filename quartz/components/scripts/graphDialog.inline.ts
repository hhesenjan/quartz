import { hiddenGraphQuery } from "../mediaQueries"

function visible(element: HTMLElement) {
  return element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible"
}

const hidden = matchMedia(hiddenGraphQuery)

function syncGraphMounts() {
  // Graph queries these class names when rendering. Keep its data/configuration
  // in place, and let its own lifecycle release any canvas and simulation.
  for (const el of document.querySelectorAll<HTMLElement>(
    ".graph .graph-container, .graph .global-graph-container, .graph [data-graph-mount]",
  )) {
    if (hidden.matches) {
      const mount =
        el.dataset.graphMount ||
        (el.classList.contains("graph-container") ? "graph-container" : "global-graph-container")
      el.dataset.graphMount = mount
      el.classList.remove(mount)
    } else if (el.dataset.graphMount) {
      el.classList.add(el.dataset.graphMount)
      delete el.dataset.graphMount
    }
  }
}

function watchGraphDialog(graph: HTMLElement, signal: AbortSignal) {
  const overlay = graph.querySelector<HTMLElement>(":scope > .global-graph-outer")
  const trigger = graph.querySelector<HTMLButtonElement>(".graph-outer > .global-graph-icon")
  if (!overlay || !trigger) return

  const close = document.createElement("button")
  close.type = "button"
  close.className = "graph-dialog-close"
  close.textContent = "Close"
  overlay.append(close)
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-modal", "true")
  overlay.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Global Graph")
  trigger.setAttribute("aria-haspopup", "dialog")

  let returnFocus: HTMLElement | undefined
  let openedByTrigger = false
  trigger.addEventListener(
    "click",
    () => {
      openedByTrigger = !overlay.classList.contains("active")
    },
    { capture: true, signal },
  )
  const suspended = new Set<HTMLElement>()
  function releaseBackground() {
    for (const element of suspended) element.inert = false
    suspended.clear()
  }

  const sync = () => {
    const open = overlay.classList.contains("active")
    trigger.setAttribute("aria-expanded", String(open))
    if (open && (!visible(overlay) || overlay.closest("[inert]"))) {
      overlay.click()
    } else if (open && !returnFocus) {
      const focused = document.activeElement
      returnFocus =
        !openedByTrigger && focused instanceof HTMLElement && focused !== document.body
          ? focused
          : trigger
      openedByTrigger = false
      // The overlay lives inside the sidebar. Suspend each sibling up to the page root.
      for (let node: HTMLElement = overlay; node.parentElement; node = node.parentElement) {
        for (const sibling of node.parentElement.children) {
          if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue
          sibling.inert = true
          suspended.add(sibling)
        }
        if (node.parentElement === document.body) break
      }
      close.focus({ preventScroll: true })
    } else if (!open && returnFocus) {
      releaseBackground()
      const target = visible(returnFocus)
        ? returnFocus
        : document.querySelector<HTMLElement>(".sidebar.left .page-title a")
      target?.focus({ preventScroll: true })
      returnFocus = undefined
    }
  }

  // Let the renderer dismiss its own overlay and dispose the canvas.
  close.addEventListener("click", () => overlay.click(), { signal })
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "g" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !overlay.classList.contains("active") &&
        (!visible(trigger) || trigger.closest("[inert]"))
      ) {
        // A hidden launcher cannot present the canvas. Keep the browser's Find Next shortcut.
        event.stopImmediatePropagation()
      }
    },
    { capture: true, signal },
  )
  overlay.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") {
        // Close is the canvas dialog's only keyboard control.
        event.preventDefault()
        close.focus({ preventScroll: true })
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        overlay.click()
        sync()
      }
    },
    { signal },
  )
  const observer = new MutationObserver(sync)
  observer.observe(overlay, { attributeFilter: ["class"] })
  window.addEventListener("resize", sync, { signal })
  document.addEventListener("readermodechange", sync, { signal })
  sync()
  signal.addEventListener(
    "abort",
    () => {
      observer.disconnect()
      releaseBackground()
      close.remove()
    },
    { once: true },
  )
}

let controls: AbortController | undefined
function prepareGraphDialog() {
  const graph = document.querySelector<HTMLElement>(".sidebar.right > .graph")
  if (graph?.querySelector(".graph-dialog-close") && controls && !controls.signal.aborted) return
  controls?.abort()
  if (!graph) return
  controls = new AbortController()
  watchGraphDialog(graph, controls.signal)
}

syncGraphMounts()
document.addEventListener("nav", syncGraphMounts, true)
document.addEventListener("render", syncGraphMounts, true)
hidden.addEventListener("change", () => {
  if (hidden.matches) document.querySelector<HTMLElement>(".global-graph-outer.active")?.click()
  document.dispatchEvent(new CustomEvent("render", { detail: { url: document.body.dataset.slug } }))
})
document.addEventListener("nav", prepareGraphDialog)
document.addEventListener("render", prepareGraphDialog)
document.addEventListener("prenav", () => controls?.abort())
