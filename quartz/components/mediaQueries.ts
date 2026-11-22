// The mobile layout also applies to short, touch-operated landscape phones.
export const mobileLayoutQuery =
  "screen and (max-width: 800px), screen and (pointer: coarse) and (orientation: landscape) and (800px < width <= 1000px) and (height <= 500px)"

export const hiddenGraphQuery = `(prefers-reduced-motion: reduce), ${mobileLayoutQuery}`
