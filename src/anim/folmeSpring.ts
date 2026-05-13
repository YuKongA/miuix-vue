// Copyright 2026, miuix-vue contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transition } from 'motion-v'

/**
 * Convert miuix `spring(dampingRatio, stiffness)` to a motion-v spring transition.
 *
 * Compose's dampingRatio is normalized (≈0.6–1.0 typical), while motion-v's
 * `damping` is raw force. For mass = 1:
 *
 *   damping = 2 * dampingRatio * sqrt(stiffness)
 *
 * Use this for every spring in miuix sources that is written as raw
 * `spring(dampingRatio=X, stiffness=Y)`.
 */
export function folmeSpring(dampingRatio: number, stiffness: number): Transition {
  return {
    type: 'spring',
    stiffness,
    damping: 2 * dampingRatio * Math.sqrt(stiffness),
    mass: 1,
  }
}

/**
 * Convert miuix `folmeSpring(damping, response)` (from `anim/MiuixEasing.kt`)
 * to a motion-v spring transition.
 *
 *   stiffness = (2π / response)²
 *
 * Use this when the source code calls `folmeSpring(damping, response)` rather
 * than constructing a raw spring spec.
 */
export function folmeSpringByResponse(damping: number, response: number): Transition {
  const stiffness = ((2 * Math.PI) / response) ** 2
  return folmeSpring(damping, stiffness)
}
