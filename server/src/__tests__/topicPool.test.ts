import { TOPIC_POOL, getRandomTopics } from "../lib/topicPool";

describe("Pre-Debate Topic Pool Engine", () => {
  test("should have exactly 24 predefined debate topics in the pool", () => {
    expect(TOPIC_POOL.length).toBe(24);
  });

  test("should select exactly 2 topics by default", () => {
    const selected = getRandomTopics();
    expect(selected.length).toBe(2);
  });

  test("should select distinct topics (no repeats)", () => {
    const selected = getRandomTopics(2);
    expect(selected[0]).not.toBe(selected[1]);
  });

  test("should select different topics on consecutive calls (randomness)", () => {
    const selection1 = getRandomTopics(2);
    const selection2 = getRandomTopics(2);
    
    // It's possible but unlikely to get the same pair in the same order
    const match = selection1[0] === selection2[0] && selection1[1] === selection2[1];
    expect(match).toBe(false);
  });

  test("all topics should be non-empty strings", () => {
    TOPIC_POOL.forEach(topic => {
      expect(typeof topic).toBe("string");
      expect(topic.length).toBeGreaterThan(0);
    });
  });
});
