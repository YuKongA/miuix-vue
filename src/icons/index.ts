// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// Built-in miuix icons, ported 1:1 from miuix-ui/.../icon/basic/*.kt.
// Compose vector path commands map directly to SVG `d`:
//   moveTo→M, lineTo→L, curveTo→C, close→Z.
// Each icon is a functional component rendering an <svg> at the source's
// intrinsic dp size with `fill: currentColor`, so MiuixIcon (or any ambient
// content color) tints it. Multi-color icons bake per-path opacity.

import { h, type FunctionalComponent } from 'vue'

interface IconPath {
  d: string
  /** Per-path opacity for multi-color icons. */
  opacity?: number
  fillRule?: 'evenodd' | 'nonzero'
}

interface IconSpec {
  /** Intrinsic width/height in dp (→ px). */
  width: number
  height: number
  /** viewBox dimensions. */
  vw: number
  vh: number
  paths: IconPath[]
}

function makeIcon(name: string, spec: IconSpec): FunctionalComponent {
  const comp: FunctionalComponent = () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: spec.width,
        height: spec.height,
        viewBox: `0 0 ${spec.vw} ${spec.vh}`,
        fill: 'currentColor',
      },
      spec.paths.map((p) =>
        h('path', {
          d: p.d,
          'fill-rule': p.fillRule ?? 'evenodd',
          'clip-rule': p.fillRule ?? 'evenodd',
          ...(p.opacity != null ? { 'fill-opacity': p.opacity } : {}),
        }),
      ),
    )
  comp.displayName = name
  return comp
}

export const IconArrowRight = makeIcon('ArrowRight', {
  width: 10,
  height: 16,
  vw: 10,
  vh: 16,
  paths: [
    {
      d: 'M1.65 1.469 C1.929 1.19 2.381 1.19 2.66 1.469 L8.721 7.53 C9 7.809 9 8.261 8.721 8.54 L2.66 14.601 C2.381 14.88 1.929 14.88 1.65 14.601 C1.371 14.322 1.371 13.87 1.65 13.591 L7.205 8.035 L1.65 2.479 C1.371 2.2 1.371 1.748 1.65 1.469 Z',
    },
  ],
})

export const IconArrowUpDown = makeIcon('ArrowUpDown', {
  width: 10,
  height: 16,
  vw: 10,
  vh: 16,
  paths: [
    {
      d: 'M2.397 4.7384 L4.5688 2.5665 L5.0075 2.1278 L5.4266 2.5469 L7.5985 4.7187 L8.531 5.6512 C8.8282 5.9485 9.3102 5.9485 9.6075 5.6512 C9.9047 5.354 9.9047 4.872 9.6075 4.5747 L8.675 3.6423 L6.5031 1.4704 L5.5706 0.5379 C5.3595 0.3267 5.0551 0.2656 4.7899 0.3544 C4.6561 0.3855 4.5291 0.4532 4.4248 0.5575 L3.4924 1.49 L1.3205 3.6619 L0.388 4.5943 C0.0907 4.8916 0.0907 5.3736 0.388 5.6708 C0.6853 5.9681 1.1672 5.9681 1.4645 5.6708 L2.397 4.7384 Z M2.397 11.257 L4.5688 13.4289 L5.0075 13.8675 L5.4266 13.4485 L7.5985 11.2766 L8.531 10.3441 C8.8282 10.0468 9.3102 10.0468 9.6075 10.3441 C9.9047 10.6414 9.9047 11.1233 9.6075 11.4206 L8.675 12.3531 L6.5031 14.525 L5.5706 15.4574 C5.3594 15.6686 5.0551 15.7298 4.7899 15.6409 C4.6561 15.6098 4.5291 15.5421 4.4248 15.4378 L3.4924 14.5053 L1.3205 12.3335 L0.388 11.401 C0.0907 11.1037 0.0907 10.6217 0.388 10.3245 C0.6853 10.0272 1.1672 10.0272 1.4645 10.3245 L2.397 11.257 Z',
    },
  ],
})

export const IconCheck = makeIcon('Check', {
  width: 26,
  height: 26,
  vw: 56,
  vh: 56,
  paths: [
    {
      d: 'M46.8171 18.1514 C48.0496 16.6624 47.8417 14.4561 46.3527 13.2235 C44.8636 11.991 42.6573 12.1989 41.4247 13.6879 L22.9535 36.0031 L13.4007 26.4502 C12.0338 25.0833 9.8177 25.0833 8.4509 26.4502 C7.0841 27.817 7.0841 30.0331 8.4509 31.3999 L20.7077 43.6567 C21.7243 44.6733 23.2108 44.9338 24.4682 44.4381 C25.0159 44.2302 25.5189 43.8818 25.9192 43.3982 L46.8171 18.1514 Z',
    },
  ],
})

export const IconSearch = makeIcon('Search', {
  width: 20,
  height: 20,
  vw: 20,
  vh: 20,
  paths: [
    {
      d: 'M12.572 13.379 C11.541 14.183 10.244 14.662 8.835 14.662 C5.477 14.662 2.754 11.94 2.754 8.581 C2.754 5.223 5.477 2.5 8.835 2.5 C12.194 2.5 14.916 5.223 14.916 8.581 C14.916 9.99 14.437 11.287 13.633 12.318 L17.464 16.149 C17.563 16.248 17.612 16.297 17.645 16.346 C17.78 16.548 17.78 16.811 17.645 17.013 C17.612 17.062 17.563 17.111 17.464 17.21 C17.366 17.308 17.316 17.358 17.267 17.39 C17.065 17.525 16.802 17.525 16.601 17.39 C16.551 17.358 16.502 17.308 16.403 17.21 L12.572 13.379 Z M13.416 8.581 C13.416 11.111 11.365 13.162 8.835 13.162 C6.305 13.162 4.254 11.111 4.254 8.581 C4.254 6.051 6.305 4 8.835 4 C11.365 4 13.416 6.051 13.416 8.581 Z',
    },
  ],
})
