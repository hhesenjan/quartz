const tableCleanups = new Map<HTMLTableElement, () => void>()
const homeCertifications = 'body[data-slug="index"] main > article .certs-table-quartz'

function rememberCertificationScroll() {
  const key = "quartz-home-certifications-scroll"
  const wrapper = () =>
    document.querySelector(homeCertifications)?.closest<HTMLElement>(".table-container")
  const container = wrapper()
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined
  try {
    const ratio = Number(sessionStorage.getItem(key))
    if (container && navigation?.type === "reload" && ratio && Math.abs(ratio) <= 1) {
      const range = () => container.scrollWidth - container.clientWidth
      const restore = () => {
        container.scrollLeft = ratio * (Math.abs(ratio) === 1 ? container.scrollWidth : range())
      }
      restore()
      const applied = container.scrollLeft
      // A late webfont can change how much of the certificate row fits. Respect
      // any horizontal scroll the reader has already made in the meantime.
      void document.fonts.ready.then(() => {
        const limit = range()
        const expected = Math.max(-limit, Math.min(applied, limit))
        if (wrapper() === container && Math.abs(container.scrollLeft - expected) <= 1) {
          restore()
        }
      })
    } else if (navigation?.type !== "reload") {
      sessionStorage.removeItem(key)
    }
  } catch {
    // Native table scrolling also works with browser storage disabled.
    return
  }

  window.addEventListener("pagehide", () => {
    const current = wrapper()
    if (!current) return
    const range = current.scrollWidth - current.clientWidth
    // A second refresh may occur before the intermediate document has a layout.
    if (range > 0) {
      try {
        // scrollLeft can be fractional at zoom, while the two widths are rounded.
        const offset = current.scrollLeft
        const ratio = Math.abs(offset) >= range - 1 ? Math.sign(offset) : offset / range
        sessionStorage.setItem(key, String(ratio))
      } catch {
        // Storage may be unavailable when the document is dismissed.
      }
    }
  })
}

rememberCertificationScroll()

function watchTable(table: HTMLTableElement) {
  if (tableCleanups.has(table) || !table.closest(".markdown-rendered")) return

  let container = table.parentElement!
  if (!container.classList.contains("table-container")) {
    // Search and popover content may supply raw HTML instead of the Quartz wrapper.
    container = document.createElement("div")
    container.className = "table-container"
    table.before(container)
    container.append(table)
  }

  const ownedAttributes = new Set<string>()
  function addAttribute(name: string, value: string) {
    if (container.hasAttribute(name)) return
    container.setAttribute(name, value)
    ownedAttributes.add(name)
  }

  function clear() {
    for (const name of ownedAttributes) container.removeAttribute(name)
    ownedAttributes.clear()
    container.removeAttribute("data-scrollable")
    container.removeAttribute("data-scroll-right")
    table.style.removeProperty("--table-hidden-right")
  }

  function update() {
    if (!container.clientWidth || container.scrollWidth <= container.clientWidth + 1) {
      clear()
      return
    }

    container.toggleAttribute("data-scrollable", true)
    addAttribute("tabindex", "0")
    addAttribute("role", "region")
    if (!container.hasAttribute("aria-labelledby")) {
      addAttribute("aria-label", table.caption?.textContent?.trim() || "Scrollable table")
    }

    // Use scroll coordinates for both distances, including at fractional zoom.
    // In RTL the scroll origin is the physical right edge.
    const hidden =
      getComputedStyle(container).direction === "rtl"
        ? -container.scrollLeft
        : container.scrollWidth - container.clientWidth - container.scrollLeft
    container.toggleAttribute("data-scroll-right", hidden > 1)
    if (hidden > 1) table.style.setProperty("--table-hidden-right", `${hidden}px`)
    else table.style.removeProperty("--table-hidden-right")
  }

  function revealFocus(event: FocusEvent) {
    const target = event.target
    if (
      !(target instanceof HTMLElement) ||
      target === container ||
      !target.matches(":focus-visible")
    ) {
      return
    }
    // Native Tab scrolling can leave just a sliver of a link visible.
    const style = getComputedStyle(target)
    const outline = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset))
    const left = container.getBoundingClientRect().left + container.clientLeft
    const right = left + container.clientWidth
    const rect = target.getBoundingClientRect()
    if (rect.left - outline < left && rect.right + outline <= right) {
      container.scrollBy({ left: rect.left - outline - left, behavior: "instant" })
    } else if (rect.right + outline > right && rect.left - outline >= left) {
      container.scrollBy({ left: rect.right + outline - right, behavior: "instant" })
    }
  }

  // Position the short status values beside a label measured in the reader's
  // actual font. The long list of certificate links still pans independently.
  const firstRow = table.matches(homeCertifications) ? table.rows[0] : undefined
  function resize() {
    if (firstRow?.cells[1]) {
      const labelWidth = firstRow.cells[0].offsetWidth
      const cellPadding = parseFloat(getComputedStyle(firstRow.cells[1]).paddingInlineStart)
      table.style.setProperty("--cert-status-inset", `${labelWidth + cellPadding}px`)
    }
    update()
  }

  const observer = new ResizeObserver(resize)
  observer.observe(container)
  observer.observe(table)
  if (firstRow?.cells[0]) observer.observe(firstRow.cells[0])
  container.addEventListener("scroll", update, { passive: true })
  container.addEventListener("focusin", revealFocus)
  tableCleanups.set(table, () => {
    observer.disconnect()
    container.removeEventListener("scroll", update)
    container.removeEventListener("focusin", revealFocus)
    if (firstRow) table.style.removeProperty("--cert-status-inset")
    clear()
  })
  resize()
}

function discoverTables(node: Element) {
  if (node instanceof HTMLTableElement) watchTable(node)
  for (const table of node.querySelectorAll("table")) watchTable(table)
}

function prepareScrollableTables() {
  const changes = new MutationObserver((records) => {
    for (const [table, clean] of tableCleanups) {
      if (!table.isConnected) {
        clean()
        tableCleanups.delete(table)
      }
    }
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement && node.isConnected) discoverTables(node)
      }
    }
  })
  discoverTables(document.body)
  changes.observe(document.body, { childList: true, subtree: true })
  return () => {
    changes.disconnect()
    for (const clean of tableCleanups.values()) clean()
    tableCleanups.clear()
  }
}

let cleanupTables: (() => void) | undefined
function setupTables() {
  cleanupTables?.()
  cleanupTables = prepareScrollableTables()
}
document.addEventListener("nav", setupTables)
document.addEventListener("render", setupTables)
