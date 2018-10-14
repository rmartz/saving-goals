export function roundRandom(value: number) {
  const base = Math.floor(value);
  const fraction = value - base;

  // Return base or base+1 with probability fraction
  // If fraction is 0.1, then it will return base with probability 0.9, and base+1 with probability 0.1
  return base + (Math.random() < fraction ? 1 : 0);
}
