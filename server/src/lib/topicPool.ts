export const TOPIC_POOL: string[] = [
  "Should Australia raise the minimum wage to $28/hour?",
  "Should public transport in Australian cities be made free?",
  "Should Australia ban new coal and gas projects?",
  "Should the school leaving age be raised to 18?",
  "Should Australia become a republic and remove the King as head of state?",
  "Should negative gearing on investment properties be abolished?",
  "Should Australia introduce a sugar tax on soft drinks?",
  "Should all Australians be required to vote (compulsory voting) — or should it become optional?",
  "Should Australia increase its annual refugee and humanitarian intake?",
  "Should the retirement age be raised to 70?",
  "Should mobile phones be banned in Australian high schools?",
  "Should Australia legalise recreational cannabis?",
  "Should private school funding from the government be reduced?",
  "Should Australia introduce a four-day working week?",
  "Should speed cameras be placed on every major road in Australia?",
  "Should the ABC (Australian Broadcasting Corporation) be privatised?",
  "Should Australia introduce a universal basic income?",
  "Should first home buyers receive a $50,000 government grant?",
  "Should Australia increase defence spending significantly?",
  "Should Australia extend its social media age ban from under-16s to under-18s?",
  "Should water usage rights be restructured to prioritise environmental flows?",
  "Should Australia fast-track nuclear energy?",
  "Should religious exemptions in anti-discrimination law be removed?",
  "Should Australia introduce a wealth tax on billionaires?",
];

export function getRandomTopics(count: number = 2): string[] {
  const shuffled = [...TOPIC_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
