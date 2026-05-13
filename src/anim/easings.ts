// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0
//
// 1:1 ports of miuix custom easings. Pass results directly as motion-v's
// `transition.ease` field (motion-v accepts an (t: number) => number function).

export type EasingFn = (fraction: number) => number

/**
 * miuix AccelerateEasing.
 *
 *   factor = 1 → y = x²
 *   factor > 1 → exaggerated ease-in
 */
export function accelerateEasing(factor: number = 1.0): EasingFn {
  if (factor === 1.0) return (x) => x * x
  const exp = 2 * factor
  return (x) => x ** exp
}

/**
 * miuix DecelerateEasing.
 *
 *   factor = 1 → y = 1 - (1-x)² = 2x - x²
 *   factor > 1 → exaggerated ease-out (e.g. Dialog dim uses factor = 1.5)
 */
export function decelerateEasing(factor: number = 1.0): EasingFn {
  if (factor === 1.0) return (x) => 1 - (1 - x) * (1 - x)
  const exp = 2 * factor
  return (x) => 1 - (1 - x) ** exp
}

/**
 * miuix SinOutEasing: y = sin(x * π / 2).
 */
export const sinOutEasing: EasingFn = (x) => Math.sin((x * Math.PI) / 2)
