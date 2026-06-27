/**
 * Symmetric jitter in `[-x, +x]`, scaled by roughness. The single source of
 * the hand-drawn wobble — every perturbed coordinate flows through here.
 */
export function offset(x: number, rng: () => number, roughness: number): number {
  return roughness * (rng() * 2 * x - x);
}

/**
 * Length-aware roughness damping. Long edges should not look more chaotic than
 * short ones, so effective roughness ramps down as the edge gets longer.
 */
export function roughnessGain(length: number): number {
  // Continuous ramp from 1 (short edges) down to 0.4 (long edges >= 500px),
  // clamped so the multiplier never jumps as an edge crosses a threshold.
  return Math.max(0.4, Math.min(1, -0.0016668 * length + 1.233334));
}
