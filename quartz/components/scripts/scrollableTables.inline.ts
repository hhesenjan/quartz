const tableCleanups = new Map<HTMLTableElement, () => void>()

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

    // Physical edges also work in RTL, where scrollLeft has a different origin.
    const right =
      container.getBoundingClientRect().left + container.clientLeft + container.clientWidth
    const hidden = table.getBoundingClientRect().right - right
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

  const observer = new ResizeObserver(update)
  observer.observe(container)
  observer.observe(table)
  container.addEventListener("scroll", update, { passive: true })
  container.addEventListener("focusin", revealFocus)
  tableCleanups.set(table, () => {
    observer.disconnect()
    container.removeEventListener("scroll", update)
    container.removeEventListener("focusin", revealFocus)
    clear()
  })
  update()
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
