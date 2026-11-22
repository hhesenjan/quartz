import assert from "node:assert/strict"
import test from "node:test"
import { renderGraph } from "./graphRenderer"

test("releases Pixi applications whose mounts expired during initialization", async (t) => {
  let completeInit: (() => void) | undefined
  let destroyed = 0
  class Application {
    async init() {
      await new Promise<void>((resolve) => {
        completeInit = resolve
      })
    }
    destroy(rendererOptions: unknown, sceneOptions: unknown) {
      assert.deepEqual(rendererOptions, { removeView: true })
      assert.deepEqual(sceneOptions, { children: true })
      destroyed++
    }
  }

  // No real graphics context is needed. The superseded application must never reach D3 or the DOM.
  const globals = {
    window: { PIXI: { Application }, devicePixelRatio: 1 },
    document: { documentElement: {} },
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    cancelAnimationFrame: () => {},
  }
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { configurable: true, value })
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original)
      else Reflect.deleteProperty(globalThis, key)
    })
  }

  for (const expiry of ["abort", "disconnect"]) {
    const graph = { dataset: { cfg: "{}" }, offsetHeight: 250, offsetWidth: 250, isConnected: true }
    const lifetime = new AbortController()
    const pending = renderGraph(
      graph as unknown as HTMLElement,
      "index",
      {},
      new Set(),
      lifetime.signal,
    )
    assert.ok(completeInit, "Pixi initialization is pending")
    if (expiry === "abort") lifetime.abort()
    else graph.isConnected = false
    completeInit()
    await pending
    completeInit = undefined
  }
  assert.equal(destroyed, 2)
})
