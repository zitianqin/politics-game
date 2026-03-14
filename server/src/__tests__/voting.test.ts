import { runVoterSimulation } from "../services/voting";
import { VoterProfile } from "../data/voterData";
import { Player, RoundState } from "../state/gameState";

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe("voting service", () => {
  const mockVoters: VoterProfile[] = [
    {
      id: 1,
      name: "Test Voter",
      age: 30,
      location: "Sydney",
      occupation: "Tester",
      background: "Likes tests",
      lean: "CENTRE",
      concerns: ["Tests"],
      reasoningStyle: "RATIONAL",
      susceptibleTo: "Evidence",
    },
  ];

  const mockPlayers: Player[] = [
    {
      id: "p1",
      slot: 1,
      socketId: "s1",
      displayName: "P1",
      candidate: {
        fullName: "Candidate A",
        age: 40,
        partyName: "Party A",
        electorate: "Seat A",
        background: "Back A",
        profession: "Prof A",
        keyPastActions: { positive: ["A1", "A2"], controversial: "C1" },
        policyPositions: ["P1", "P2", "P3"],
        personalValues: ["V1", "V2", "V3"],
        flaws: ["F1"],
      },
    } as any,
    {
      id: "p2",
      slot: 2,
      socketId: "s2",
      displayName: "P2",
      candidate: {
        fullName: "Candidate B",
        age: 45,
        partyName: "Party B",
        electorate: "Seat B",
        background: "Back B",
        profession: "Prof B",
        keyPastActions: { positive: ["B1", "B2"], controversial: "C2" },
        policyPositions: ["P4", "P5", "P6"],
        personalValues: ["V4", "V5", "V6"],
        flaws: ["F2"],
      },
    } as any,
  ];

  const mockRounds: RoundState[] = [
    {
      roundNumber: 1,
      topic: "Test Topic",
      transcript: [{ speaker: "player1", text: "Hello", timestamp: 10 }],
    },
  ];

  const mockTopics = ["Test Topic"];

  beforeEach(() => {
    mockFetch.mockClear();
    process.env.GEMINI_API_KEY = "dummy-gemini-key";
    process.env.PERPLEXITY_API_KEY = "dummy-perplexity-key";
  });

  it("should fall back to Gemini Pro then Perplexity if Gemini Flash fails", async () => {
    // 1st & 2nd call: Gemini Flash fails
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Flash Error") });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Flash Error") });

    // 3rd call: Gemini Pro fails
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Pro Error") });

    // 4th call: Perplexity succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  voter_1: { name: "Test Voter", vote: "Candidate A", reason: "Good test" },
                }),
              },
            },
          ],
        }),
    });

    const result = await runVoterSimulation(mockVoters, mockPlayers, mockRounds, mockTopics);

    expect(result.votes[0].vote).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(4);

    // Verify URLs to ensure fallback models were used
    expect(mockFetch.mock.calls[0][0]).toContain("gemini-3.1-flash-lite-preview");
    expect(mockFetch.mock.calls[1][0]).toContain("gemini-3.1-flash-lite-preview");
    expect(mockFetch.mock.calls[2][0]).toContain("gemini-3.1-pro-preview");
    expect(mockFetch.mock.calls[3][0]).toContain("api.perplexity.ai");
  });

  it("should parse Gemini response correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      voter_1: { name: "Test Voter", vote: "Candidate B", reason: "I like B" },
                    }),
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await runVoterSimulation(mockVoters, mockPlayers, mockRounds, mockTopics);

    expect(result.votes[0].vote).toBe(2);
    expect(result.votes[0].reason).toBe("I like B");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("gemini-3.1-flash-lite-preview");
  });
});
