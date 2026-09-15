const CHEERS: { min: number; text: string }[] = [
  { min: 0, text: "Ok!" },
  { min: 1, text: "Getting there!" },
  { min: 3, text: "Better!" },
  { min: 6, text: "Positive!" },
  { min: 10, text: "Good!" },
  { min: 15, text: "Great!" },
  { min: 20, text: "Awesome!" },
  { min: 30, text: "Outstanding!" },
  { min: 45, text: "Incredible!" },
  { min: 60, text: "Terrific!" },
  { min: 80, text: "Unbelievable!" },
];

export function cheerForScore(score: number): string {
  const n = Math.max(0, Math.floor(score));
  let text = CHEERS[0].text;
  for (const row of CHEERS) {
    if (n >= row.min) text = row.text;
  }
  return text;
}
