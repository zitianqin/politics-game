import { VOTER_POOL, getRandomVoters } from "../lib/voterPool";

describe("Voter Profile Selection System", () => {
  test("should have exactly 67 static voter profiles in the pool", () => {
    expect(VOTER_POOL.length).toBe(67);
  });

  test("should select exactly 21 voters by default", () => {
    const selected = getRandomVoters();
    expect(selected.length).toBe(21);
  });

  test("should select distinct voters (no duplicates)", () => {
    const selected = getRandomVoters(21);
    const uniqueNames = new Set(selected.map(v => v.name));
    expect(uniqueNames.size).toBe(21);
  });

  test("should select different voters on consecutive calls (randomness)", () => {
    const selection1 = getRandomVoters(21);
    const selection2 = getRandomVoters(21);
    
    const names1 = selection1.map(v => v.name).sort();
    const names2 = selection2.map(v => v.name).sort();
    
    // It's technically possible but statistically astronomical to get the same 21
    expect(names1).not.toEqual(names2);
  });

  test("each profile should have all required fields", () => {
    const selected = getRandomVoters(1);
    const voter = selected[0];
    
    expect(voter).toHaveProperty("name");
    expect(voter).toHaveProperty("age");
    expect(voter).toHaveProperty("location");
    expect(voter).toHaveProperty("occupation");
    expect(voter).toHaveProperty("background");
    expect(voter).toHaveProperty("politicalLean");
    expect(voter).toHaveProperty("concerns");
    expect(voter).toHaveProperty("reasoning");
    expect(voter).toHaveProperty("susceptibility");
    
    expect(Array.isArray(voter.concerns)).toBe(true);
    expect(Array.isArray(voter.susceptibility)).toBe(true);
  });
});
