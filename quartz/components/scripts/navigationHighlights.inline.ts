function revealInList(list: HTMLElement, row: HTMLElement, minimumVisible = row.offsetHeight) {
  if (!list.clientHeight || list.scrollHeight <= list.clientHeight) return
  const bounds = list.getBoundingClientRect()
  const item = row.getBoundingClientRect()
  const visible = Math.min(bounds.bottom, item.bottom) - Math.max(bounds.top, item.top)
  if (visible >= minimumVisible) return
  if (item.top < bounds.top) list.scrollTop += item.top - bounds.top
  else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom
}

function watchReadingPosition(list: HTMLElement, signal: AbortSignal) {
  const sections = [...list.querySelectorAll<HTMLAnchorElement>("a[data-for]")].flatMap((link) => {
    const heading = document.getElementById(link.dataset.for ?? "")
    return heading ? [{ link, heading }] : []
  })
  if (!sections.length) return

  let current: HTMLAnchorElement | undefined
  let frame = 0
  let previousListHeight = 0
  const disclosure = list.closest("details")
  function update() {
    frame = 0
    const listHeight = list.clientHeight
    if (!listHeight || (disclosure && !disclosure.open)) return
    const scrollPadding =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart) || 0
    const readingLine = Math.max(Math.min(120, window.innerHeight * 0.2), scrollPadding + 1)
    let section = sections[0]
    if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
      section = sections[sections.length - 1]
    } else {
      for (const candidate of sections) {
        if (candidate.heading.getBoundingClientRect().top > readingLine) break
        section = candidate
      }
    }
    if (current === section.link && listHeight === previousListHeight) return
    if (current !== section.link) {
      current?.removeAttribute("aria-current")
      current = section.link
      current.setAttribute("aria-current", "location")
    }
    previousListHeight = listHeight

    revealInList(list, current)
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  window.addEventListener("scroll", schedule, { passive: true, signal })
  window.addEventListener("resize", schedule, { signal })
  disclosure?.addEventListener("toggle", schedule, { signal })
  const resize = new ResizeObserver(schedule)
  resize.observe(list)
  const article = sections[0].heading.closest("article")
  if (article) resize.observe(article)
  update()
  signal.addEventListener("abort", () => {
    cancelAnimationFrame(frame)
    resize.disconnect()
    current?.removeAttribute("aria-current")
  })
}

function watchExplorerDrawer(
  explorer: HTMLElement,
  list: HTMLElement,
  mobile: MediaQueryList,
  signal: AbortSignal,
) {
  const sidebar = explorer.closest<HTMLElement>(".sidebar.left")
  const toggle = explorer.querySelector<HTMLButtonElement>("button.mobile-explorer")
  const content = list.parentElement
  if (!sidebar?.parentElement || !toggle || !content) return
  const root = document.documentElement
  const measureToolbar = () => {
    if (mobile.matches) {
      root.style.setProperty("--mobile-toolbar-height", `${sidebar.offsetHeight}px`)
    } else {
      root.style.removeProperty("--mobile-toolbar-height")
    }
  }
  const toolbarResize = new ResizeObserver(measureToolbar)
  toolbarResize.observe(sidebar, { box: "border-box" })
  measureToolbar()
  mobile.addEventListener("change", measureToolbar, { signal })
  const background = [
    ...sidebar.querySelectorAll<HTMLElement>(":scope > :not(.explorer)"),
    ...sidebar.parentElement.querySelectorAll<HTMLElement>(":scope > :not(.sidebar.left)"),
  ]
  const suspended = new Set<HTMLElement>()
  const drawerOpen = () => mobile.matches && explorer.getAttribute("aria-expanded") === "true"
  function releaseBackground() {
    for (const element of suspended) element.inert = false
    suspended.clear()
  }
  function syncDrawer() {
    const expanded = !explorer.classList.contains("collapsed")
    for (const button of explorer.querySelectorAll(".explorer-toggle")) {
      button.setAttribute("aria-expanded", String(expanded))
    }
    content!.inert = !expanded
    if (mobile.matches) root.classList.toggle("mobile-no-scroll", drawerOpen())
    if (drawerOpen()) {
      for (const element of background) {
        if (element.inert) continue
        element.inert = true
        suspended.add(element)
      }
    } else {
      releaseBackground()
    }
  }
  document.addEventListener(
    "keydown",
    (event) => {
      if (!drawerOpen()) return
      const searchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k"
      if (event.key === "Escape" || searchShortcut) {
        toggle.click()
        releaseBackground()
        toggle.focus({ preventScroll: true })
        if (!searchShortcut) event.preventDefault()
      } else if (event.key === "Tab") {
        const stops = [...list.querySelectorAll<HTMLElement>("a[href], button, [tabindex='0']")]
        const last =
          stops.reverse().find((el) => !el.closest("[inert]") && el.getClientRects().length) ??
          toggle
        if (event.shiftKey && document.activeElement === toggle) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          toggle.focus({ preventScroll: true })
        }
      }
    },
    { capture: true, signal },
  )
  const observer = new MutationObserver(syncDrawer)
  observer.observe(explorer, { attributeFilter: ["aria-expanded"] })
  content.removeAttribute("aria-expanded")
  syncDrawer()
  signal.addEventListener("abort", () => {
    observer.disconnect()
    toolbarResize.disconnect()
    root.style.removeProperty("--mobile-toolbar-height")
    if (suspended.size) root.classList.remove("mobile-no-scroll")
    releaseBackground()
  })
}

function syncFolderButtons(list: HTMLElement) {
  for (const group of list.querySelectorAll<HTMLElement>(".folder-outer")) {
    const folder = group.previousElementSibling
    const icon = folder?.querySelector<SVGElement>(".folder-icon")
    const link = folder?.querySelector("a.folder-button")
    group.inert = !group.classList.contains("open")
    if (icon && link) {
      icon.tabIndex = 0
      icon.setAttribute("role", "button")
      icon.setAttribute("aria-label", link.textContent.trim())
      icon.setAttribute("aria-expanded", String(!group.inert))
    }
  }
}

function watchExplorer(list: HTMLElement, signal: AbortSignal) {
  const slug = document.body.dataset.slug
  const explorer = list.closest<HTMLElement>(".explorer")
  if (!slug || !explorer) return
  // Give the Explorer a list offset on the first visit. Its fallback scrollIntoView
  // also moves the document, which scrolls the article title off screen.
  if (sessionStorage.getItem("explorerScrollTop") === null) {
    sessionStorage.setItem("explorerScrollTop", "0")
  }
  const mobile = window.matchMedia("(max-width: 800px)")
  watchExplorerDrawer(explorer, list, mobile, signal)
  mobile.addEventListener(
    "change",
    () => {
      explorer.classList.toggle("collapsed", mobile.matches)
      explorer.setAttribute("aria-expanded", String(!mobile.matches))
      document.documentElement.classList.remove("mobile-no-scroll")
    },
    { signal },
  )
  list.addEventListener(
    "keydown",
    (event) => {
      if (
        !(event.target instanceof SVGElement) ||
        !event.target.matches(".folder-icon[role=button]")
      )
        return
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault()
        event.target.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      }
    },
    { signal },
  )
  const folderLink = `.folder-container[data-folderpath="${CSS.escape(slug)}"] a.folder-button`
  let current: HTMLAnchorElement | null = null
  function update() {
    current?.removeAttribute("aria-current")
    current = list.querySelector<HTMLAnchorElement>("a.nav-file-title.active, " + folderLink)
    if (current) {
      current.setAttribute("aria-current", "page")
      // Keep a readable row in place when the Explorer restores the list after navigation.
      if (!mobile.matches) {
        revealInList(list, current, parseFloat(getComputedStyle(current).lineHeight))
      }
    }
  }
  // The Explorer inserts its file tree asynchronously after each navigation.
  const observer = new MutationObserver((changes) => {
    const treeChanged = changes.some((change) => change.type === "childList")
    const drawerChanged = changes.some((change) => change.target === explorer)
    if (treeChanged) update()
    if (
      treeChanged ||
      changes.some((change) => (change.target as Element).matches(".folder-outer"))
    )
      syncFolderButtons(list)
    if (
      current &&
      (treeChanged || drawerChanged) &&
      mobile.matches &&
      explorer?.getAttribute("aria-expanded") === "true"
    )
      revealInList(list, current)
  })
  observer.observe(list, { childList: true, subtree: true, attributeFilter: ["class"] })
  observer.observe(explorer, { attributeFilter: ["aria-expanded"] })
  syncFolderButtons(list)
  update()
  signal.addEventListener("abort", () => {
    observer.disconnect()
    current?.removeAttribute("aria-current")
  })
}

function prepareMobileSearch(container: HTMLElement, signal: AbortSignal) {
  const space = container.querySelector<HTMLElement>(".search-space")
  const input = space?.querySelector<HTMLInputElement>(".search-bar")
  if (!input) return
  const close = document.createElement("button")
  close.type = "button"
  close.className = "search-close"
  close.textContent = "Close"
  close.setAttribute("aria-label", "Close search")
  // Use the plugin's backdrop handler to clear the query and return focus to its trigger.
  close.addEventListener("click", () => container.click(), { signal })

  const mobile = window.matchMedia(
    "screen and (max-width: 800px), screen and (pointer: coarse) and (orientation: landscape) and (800px < width <= 1000px) and (height <= 500px)",
  )
  const viewport = window.visualViewport
  const sizeToKeyboard = () => {
    if (mobile.matches && viewport?.scale === 1) {
      container.style.setProperty("--search-viewport-height", `${viewport.height}px`)
    } else {
      container.style.removeProperty("--search-viewport-height")
    }
  }
  const update = () => {
    if (mobile.matches) {
      input.after(close)
      container.setAttribute("role", "dialog")
      container.setAttribute("aria-modal", "true")
      container.setAttribute("aria-label", "Search")
    } else {
      close.remove()
      container.removeAttribute("role")
      container.removeAttribute("aria-modal")
      container.removeAttribute("aria-label")
    }
    sizeToKeyboard()
  }
  update()
  mobile.addEventListener("change", update, { signal })
  viewport?.addEventListener("resize", sizeToKeyboard, { signal })
  container.addEventListener(
    "keydown",
    (event) => {
      if (!mobile.matches || event.key !== "Tab") return
      // On phones, arrows choose a match and Tab visits the visible controls in reading order.
      event.stopPropagation()
      const suggestions = container.querySelector<HTMLElement>(".tag-suggestions")
      const last = suggestions?.offsetHeight
        ? close
        : (container.querySelector<HTMLAnchorElement>(".result-card[href]:last-child") ?? close)
      if (event.shiftKey && event.target === input) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && event.target === last) {
        event.preventDefault()
        input.focus()
      }
    },
    { capture: true, signal },
  )
  // The plugin refocuses the sticky toolbar on dismissal. Keep the article at its reading position.
  let articleOffset: number | undefined
  const observer = new MutationObserver(() => {
    if (mobile.matches && container.classList.contains("active")) {
      articleOffset = window.scrollY
    } else if (articleOffset !== undefined) {
      if (mobile.matches) window.scrollTo({ top: articleOffset, behavior: "instant" })
      articleOffset = undefined
    }
  })
  observer.observe(container, { attributeFilter: ["class"] })
  signal.addEventListener("abort", () => {
    observer.disconnect()
    close.remove()
    container.style.removeProperty("--search-viewport-height")
  })
}

function syncToolbarButtons() {
  const root = document.documentElement
  for (const button of document.querySelectorAll("button.darkmode, button.readermode")) {
    const pressed = button.classList.contains("darkmode")
      ? root.getAttribute("saved-theme") === "dark"
      : root.getAttribute("reader-mode") === "on"
    button.setAttribute("aria-pressed", String(pressed))
  }
}

function alignHeaderDividers(signal: AbortSignal) {
  const layout = document.querySelector<HTMLElement>(".page[data-frame='default'] > #quartz-body")
  if (!layout || document.body.dataset.slug === "index") return
  const header = layout.querySelector<HTMLElement>(":scope > .center > .page-header")
  const sidebar = layout.querySelector<HTMLElement>(":scope > .sidebar.left")
  const divider = sidebar?.querySelector<HTMLElement>(":scope > .explorer .desktop-explorer")
  if (!header || !sidebar || !divider) return

  // Only the toolbar sets the baseline. A long title can grow inside its own column.
  const measure = () => {
    if (!divider.getClientRects().length) return
    const offset = divider.getBoundingClientRect().top - sidebar.getBoundingClientRect().top
    header.style.setProperty("--toolbar-header-height", `${offset + divider.clientTop}px`)
  }
  const observer = new ResizeObserver(measure)
  for (const element of sidebar.children) {
    observer.observe(element, { box: "border-box" })
  }
  measure()
  signal.addEventListener("abort", () => {
    observer.disconnect()
    header.style.removeProperty("--toolbar-header-height")
  })
}

document.addEventListener("themechange", syncToolbarButtons)
document.addEventListener("readermodechange", syncToolbarButtons)

let navigationHighlights: AbortController | undefined
function refreshHighlights() {
  syncToolbarButtons()
  navigationHighlights?.abort()
  navigationHighlights = new AbortController()
  const { signal } = navigationHighlights
  alignHeaderDividers(signal)
  for (const container of document.querySelectorAll<HTMLElement>(".search-container")) {
    prepareMobileSearch(container, signal)
  }
  for (const list of document.querySelectorAll<HTMLElement>(
    ".sidebar .toc-content, .article-contents nav",
  )) {
    watchReadingPosition(list, signal)
  }
  for (const list of document.querySelectorAll<HTMLElement>(".sidebar .explorer-ul")) {
    watchExplorer(list, signal)
  }
}

document.addEventListener("render", refreshHighlights)
document.addEventListener("nav", () => {
  refreshHighlights()
  window.addCleanup(() => navigationHighlights?.abort())
})
