export function timedScore({ completed, combo, elapsed, target }) {
  const performance = Math.min(6, Math.max(0, completed)) * 10;
  const completion = completed >= 6 ? 20 : 0;
  const chain = Math.min(10, Math.max(0, combo) * 2);
  const speed = completed >= 6 ? Math.max(0, Math.round(10 * (1 - elapsed / target))) : 0;
  return { performance, completion, combo: chain, speed, total: performance + completion + chain + speed };
}
export function neighborScore(correct, completed) {
  return { performance: Math.min(3, correct) * 20, completion: completed ? 40 : 0, combo: 0, speed: 0, total: Math.min(3, correct) * 20 + (completed ? 40 : 0) };
}
