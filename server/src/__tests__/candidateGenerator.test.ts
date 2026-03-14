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
    expect(candidate).toHaveProperty("keyPastActions");
    expect(candidate).toHaveProperty("policyPositions");
    expect(candidate).toHaveProperty("personalValues");
    expect(candidate).toHaveProperty("flaws");
  });

  test("should keep age within 35-70", () => {
    const [c1, c2] = generateCandidatePair(topics);

    expect(c1.age).toBeGreaterThanOrEqual(35);
    expect(c1.age).toBeLessThanOrEqual(70);
    expect(c2.age).toBeGreaterThanOrEqual(35);
    expect(c2.age).toBeLessThanOrEqual(70);
  });

  test("should include 2 positive actions and 1 controversial action", () => {
    const [candidate] = generateCandidatePair(topics);

    expect(candidate.keyPastActions.positive.length).toBe(2);
    expect(typeof candidate.keyPastActions.controversial).toBe("string");
    expect(candidate.keyPastActions.controversial.length).toBeGreaterThan(0);
  });

  test("should include exactly 3 policy positions", () => {
    const [candidate] = generateCandidatePair(topics);
    expect(candidate.policyPositions.length).toBe(3);
  });

  test("should include exactly 3 personal values and 1 flaw", () => {
    const [candidate] = generateCandidatePair(topics);
    expect(candidate.personalValues.length).toBe(3);
    expect(candidate.flaws.length).toBe(1);
  });

  test("should generate distinct names for the two candidates", () => {
    const [c1, c2] = generateCandidatePair(topics);
    expect(c1.fullName).not.toBe(c2.fullName);
  });
});
