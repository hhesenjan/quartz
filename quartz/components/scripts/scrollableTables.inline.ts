let tableListeners: AbortController | undefined

function prepareScrollableTables() {
  tableListeners?.abort()
  tableListeners = new AbortController()
  const { signal } = tableListeners
  const tables = document.querySelectorAll<HTMLTableElement>(
    "article .markdown-rendered .table-container > table",
  )

  for (const table of tables) {
    const container = table.parentElement!

    // Physical bounds also work in RTL, where scrollLeft has a different origin.
    const updateEdges = () => {
      const left = container.getBoundingClientRect().left + container.clientLeft
      const right = left + container.clientWidth
      const bounds = table.getBoundingClientRect()
      const hiddenLeft = left - bounds.left
      const hiddenRight = bounds.right - right
      table.style.setProperty("--table-hidden-left", `${hiddenLeft > 1 ? hiddenLeft : 0}px`)
      table.style.setProperty("--table-hidden-right", `${hiddenRight > 1 ? hiddenRight : 0}px`)
    }

    const update = () => {
      const overflow = container.clientWidth > 0 && container.scrollWidth > container.clientWidth
      if (overflow) {
        if (!container.hasAttribute("tabindex")) {
          container.tabIndex = 0
          container.setAttribute("role", "region")
          container.setAttribute(
            "aria-label",
            table.caption?.textContent?.trim() || "Scrollable table",
          )
        }
        updateEdges()
      } else if (container.hasAttribute("tabindex")) {
        container.removeAttribute("tabindex")
        container.removeAttribute("role")
        container.removeAttribute("aria-label")
        table.style.removeProperty("--table-hidden-left")
        table.style.removeProperty("--table-hidden-right")
      }
    }

    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(table)
    container.addEventListener("scroll", updateEdges, { passive: true, signal })
    signal.addEventListener("abort", () => observer.disconnect(), { once: true })
    update()
  }
}

document.addEventListener("nav", prepareScrollableTables)
document.addEventListener("render", prepareScrollableTables)
