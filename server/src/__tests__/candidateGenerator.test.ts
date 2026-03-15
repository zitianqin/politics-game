import { generateCandidatePair } from "../lib/candidateGenerator";

describe("Procedural Candidate Generation Engine", () => {
  const topics = [
    "Should Australia raise the minimum wage to $28/hour?",
    "Should Australia ban new coal and gas projects?",
  ];

  test("should generate exactly two candidates", () => {
    const [c1, c2] = generateCandidatePair(topics);

    expect(c1).toBeDefined();
    expect(c2).toBeDefined();
  });

  test("should generate required profile fields", () => {
    const [candidate] = generateCandidatePair(topics);

    expect(candidate).toHaveProperty("fullName");
    expect(candidate).toHaveProperty("age");
    expect(candidate).toHaveProperty("partyName");
    expect(candidate).toHaveProperty("electorate");
    expect(candidate).toHaveProperty("background");
    expect(candidate).toHaveProperty("profession");
  });

  test("should keep age within 35-70", () => {
    const [c1, c2] = generateCandidatePair(topics);

    expect(c1.age).toBeGreaterThanOrEqual(35);
    expect(c1.age).toBeLessThanOrEqual(70);
    expect(c2.age).toBeGreaterThanOrEqual(35);
    expect(c2.age).toBeLessThanOrEqual(70);
  });

  test("should include a non-empty background description", () => {
    const [candidate] = generateCandidatePair(topics);

    expect(typeof candidate.background).toBe("string");
    expect(candidate.background.length).toBeGreaterThan(0);
  });

  test("should generate distinct names for the two candidates", () => {
    const [c1, c2] = generateCandidatePair(topics);
    expect(c1.fullName).not.toBe(c2.fullName);
  });
});
