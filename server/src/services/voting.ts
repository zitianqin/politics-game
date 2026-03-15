import { VoterProfile } from "../data/voterData";
import { Player, RoundState } from "../state/gameState";

const GEMINI_FLASH_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_PRO_MODEL = "gemini-3.1-pro-preview";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

const PERPLEXITY_ENDPOINT = "https://api.perplexity.ai/chat/completions";
const PERPLEXITY_MODEL = "sonar";

const REQUEST_TIMEOUT_MS = 20_000;
const GEMINI_FLASH_ATTEMPTS = 2;
const GEMINI_PRO_ATTEMPTS = 1;

export interface VoterVote {
  voterName: string;
  vote: 1 | 2;
  reason: string;
}

export interface VotingResult {
  votes: VoterVote[];
  p1Votes: number;
  p2Votes: number;
  winner: 0 | 1 | 2;
  p1CandidateName?: string;
  p2CandidateName?: string;
}

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in environment");
  return key;
}

function getPerplexityApiKey(): string {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY is not set in environment");
  return key;
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function formatVoterProfile(voter: VoterProfile, index: number): string {
  return [
    `Voter ${index + 1}: ${voter.name}, ${voter.age}, ${voter.location}`,
    `Occupation: ${voter.occupation}`,
    `Background: ${voter.background}`,
    `Political Lean: ${voter.lean}`,
    `Key Concerns: ${voter.concerns.join(", ")}`,
    `Reasoning Style: ${voter.reasoningStyle}`,
    `Susceptible To: ${voter.susceptibleTo}`,
  ].join("\n");
}

function formatCandidate(player: Player, label: string): string {
  const c = player.candidate;
  if (!c || Object.keys(c).length === 0) {
    return `${label}: Player ${player.slot} (no detailed profile available)`;
  }

  const fields: [string, string][] = [
    ["Name", String((c as any).fullName ?? (c as any).name ?? "")],
    ["Age", String(c.age ?? "")],
    ["Party", String((c as any).partyName ?? (c as any).party ?? "")],
    ["Electorate", String(c.electorate ?? "")],
    ["Profession", String(c.profession ?? "")],
    ["Background", String(c.background ?? "")],
    [
      "Key Past Actions",
      (() => {
        const keyActions = (c as any).keyPastActions;
        if (!keyActions) return "";
        const positives = Array.isArray(keyActions.positive)
          ? keyActions.positive.join("; ")
          : "";
        const controversial = String(keyActions.controversial ?? "");
        return [positives, controversial].filter(Boolean).join("; ");
      })(),
    ],
    [
      "Policy Positions",
      Array.isArray((c as any).policyPositions)
        ? ((c as any).policyPositions as string[]).join("; ")
        : Array.isArray((c as any).policies)
        ? ((c as any).policies as string[]).join("; ")
        : String((c as any).policies ?? ""),
    ],
    [
      "Personal Values",
      Array.isArray((c as any).personalValues)
        ? ((c as any).personalValues as string[]).join(", ")
        : String((c as any).values ?? ""),
    ],
    [
      "Flaws",
      Array.isArray((c as any).flaws)
        ? ((c as any).flaws as string[]).join("; ")
        : String((c as any).flaws ?? ""),
    ],
  ];

  const lines = [`${label}:`];
  for (const [key, val] of fields) {
    if (val) lines.push(`${key}: ${val}`);
  }
  return lines.join("\n");
}

function formatTranscript(rounds: RoundState[]): string {
  return rounds
    .map((round) => {
      const header = `--- Round ${round.roundNumber}: "${round.topic}" ---`;
      const entries = round.transcript
        .map((entry) => {
          const speaker =
            entry.speaker === "player1" || entry.speaker === "1"
              ? "Candidate A"
              : entry.speaker === "player2" || entry.speaker === "2"
              ? "Candidate B"
              : entry.speaker;
          const objection = entry.isObjectionEnd ? " [OBJECTION]" : "";
          const inaudible = entry.inaudible ? " [inaudible]" : "";
          return `[${entry.timestamp}s] ${speaker}${objection}${inaudible}: ${entry.text}`;
        })
        .join("\n");
      return `${header}\n${entries}`;
    })
    .join("\n\n");
}

function buildPrompt(
  voters: VoterProfile[],
  players: Player[],
  rounds: RoundState[],
  topics: string[]
): string {
  const voterProfiles = voters
    .map((v, i) => formatVoterProfile(v, i))
    .join("\n\n");

  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);

  const candidateA = p1
    ? formatCandidate(p1, "Candidate A")
    : "Candidate A: Player 1";
  const candidateB = p2
    ? formatCandidate(p2, "Candidate B")
    : "Candidate B: Player 2";

  const transcript = formatTranscript(rounds);

  const voterJsonExample = voters
    .map(
      (_, i) =>
        `"voter_${
          i + 1
        }": { "name": "...", "vote": "Candidate A" or "Candidate B", "reason": "1-2 sentences in that voter's own voice" }`
    )
    .join(", ");

  return `Below are the profiles of ${
    voters.length
  } Australian voters and the transcript of the CURRENT political debate round so far. For each voter, imagine you are that specific person — with their background, biases, values, and reasoning style. Decide which candidate they would vote for BASED SPECIFICALLY ON THE ARGUMENTS MADE IN THIS ROUND.

CANDIDATES:

${candidateA}

${candidateB}

TOPICS DISCUSSED: ${topics.join(", ")}

VOTER PROFILES:

${voterProfiles}

DEBATE TRANSCRIPT:

${transcript}

Important: Not every voter will make a rational, policy-based decision. Many real people vote on gut feel, emotion, personal impressions, or tribal loyalty rather than logical argument. A retiree might vote for whoever seems kinder even if their policy is weaker. A young voter might be swayed by a candidate's confidence or energy rather than what they actually said. Someone who feels talked down to might vote against a candidate purely out of spite. A voter with strong tribal loyalty may not be moveable at all regardless of argument quality. For each voter, stay true to their specific background, personality, and susceptibility as described — do not default to rational policy analysis for everyone. Some voters should absolutely be swayed by emotional appeals, populist rhetoric, personal attacks, or charisma over substance, if that fits who they are.

NOTE: YOU ARE A CLOSED SYSTEM. DO NOT ATTEMPT TO SEARCH THE INTERNET OR USE EXTERNAL TOOLS. BASE YOUR DECISIONS ONLY ON THE PROVIDED TRANSCRIPTS AND PROFILES.

Return ONLY a valid JSON object in this exact format, with no additional text:
{ ${voterJsonExample} }`;
}

function parseVoteChoice(voteString: string): 1 | 2 {
  const normalized = voteString.trim().toLowerCase();
  if (normalized.includes("candidate a") || normalized === "a") return 1;
  if (normalized.includes("candidate b") || normalized === "b") return 2;
  if (normalized.includes("player 1")) return 1;
  if (normalized.includes("player 2")) return 2;
  console.warn(
    `[voting] Ambiguous vote value: "${voteString}", defaulting to 1`
  );
  return 1;
}

function parseVoteChoiceWithNames(
  voteString: string,
  p1Name: string,
  p2Name: string
): 1 | 2 {
  // Always parse as Candidate A or B since that's what the prompt uses
  return parseVoteChoice(voteString);
}

function parseVotingResponse(
  raw: Record<string, { name: string; vote: string; reason: string }>,
  voters: VoterProfile[],
  p1Name?: string,
  p2Name?: string
): VotingResult {
  const votes: VoterVote[] = [];
  let p1Votes = 0;
  let p2Votes = 0;

  for (let i = 0; i < voters.length; i++) {
    const key = `voter_${i + 1}`;
    const entry = raw[key];

    if (!entry) {
      console.warn(
        `[voting] Missing vote for ${key} (${voters[i].name}), skipping`
      );
      continue;
    }

    const voteFor =
      p1Name && p2Name
        ? parseVoteChoiceWithNames(entry.vote, p1Name, p2Name)
        : parseVoteChoice(entry.vote);

    votes.push({
      voterName: entry.name || voters[i].name,
      vote: voteFor,
      reason: entry.reason || "No reason given",
    });

    if (voteFor === 1) p1Votes++;
    else p2Votes++;
  }

  return {
    votes,
    p1Votes,
    p2Votes,
    winner: p1Votes > p2Votes ? 1 : p1Votes < p2Votes ? 2 : 0, // 0 indicates a tie
  };
}

type RawVoterResponse = Record<
  string,
  { name: string; vote: string; reason: string }
>;

async function callGemini(
  prompt: string,
  model: string
): Promise<RawVoterResponse> {
  const apiKey = getGeminiApiKey();
  const url = `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemini API error (${model}, ${response.status}): ${errText}`
    );
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error(`Gemini (${model}) returned no content`);
  }

  console.log(
    `[voting] Gemini (${model}) raw response: ${jsonText.slice(0, 300)}...`
  );
  return JSON.parse(jsonText) as RawVoterResponse;
}

async function callPerplexity(prompt: string): Promise<RawVoterResponse> {
  const apiKey = getPerplexityApiKey();

  const response = await fetchWithTimeout(
    PERPLEXITY_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Perplexity returned no content");
  }

  console.log(`[voting] Perplexity raw response: ${content.slice(0, 300)}...`);

  const jsonMatch = /\{[\s\S]*\}/.exec(content);
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from Perplexity response");
  }
  return JSON.parse(jsonMatch[0]) as RawVoterResponse;
}

function validateVotingResponse(
  parsed: RawVoterResponse,
  voters: VoterProfile[]
): void {
  for (let i = 0; i < voters.length; i++) {
    const key = `voter_${i + 1}`;
    const entry = parsed[key];
    if (!entry?.vote || !entry?.reason) {
      throw new Error(`Invalid or missing vote for ${key} (${voters[i].name})`);
    }
  }
}

export async function runVoterSimulation(
  voters: VoterProfile[],
  players: Player[],
  rounds: RoundState[],
  topics: string[],
  p1CandidateName?: string,
  p2CandidateName?: string
): Promise<VotingResult> {
  const p1 = players.find((p) => p.slot === 1);
  const p2 = players.find((p) => p.slot === 2);
  const p1Name = p1?.candidate?.fullName ?? p1CandidateName ?? "Player 1";
  const p2Name = p2?.candidate?.fullName ?? p2CandidateName ?? "Player 2";

  const prompt = buildPrompt(voters, players, rounds, topics);

  console.log(
    `[voting] Starting voter simulation (${voters.length} voters, ${rounds.length} rounds)`
  );

  let parsed: RawVoterResponse | null = null;
  let lastError: Error | null = null;

  // 1. Gemini Flash: up to GEMINI_FLASH_ATTEMPTS
  for (let attempt = 1; attempt <= GEMINI_FLASH_ATTEMPTS; attempt++) {
    try {
      console.log(
        `[voting] Gemini Flash attempt ${attempt}/${GEMINI_FLASH_ATTEMPTS}`
      );
      const raw = await callGemini(prompt, GEMINI_FLASH_MODEL);
      validateVotingResponse(raw, voters);
      parsed = raw;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[voting] Gemini Flash attempt ${attempt} failed: ${lastError.message}`
      );
    }
  }

  // 2. Gemini Pro fallback: up to GEMINI_PRO_ATTEMPTS
  if (!parsed) {
    console.log(`[voting] Gemini Flash failed, falling back to Gemini Pro`);
    for (let attempt = 1; attempt <= GEMINI_PRO_ATTEMPTS; attempt++) {
      try {
        console.log(
          `[voting] Gemini Pro attempt ${attempt}/${GEMINI_PRO_ATTEMPTS}`
        );
        const raw = await callGemini(prompt, GEMINI_PRO_MODEL);
        validateVotingResponse(raw, voters);
        parsed = raw;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(
          `[voting] Gemini Pro attempt ${attempt} failed: ${lastError.message}`
        );
      }
    }
  }

  // 3. Perplexity fallback
  if (!parsed) {
    console.log(
      `[voting] Gemini Pro failed, falling back to Perplexity (Sonar)`
    );
    try {
      const raw = await callPerplexity(prompt);
      validateVotingResponse(raw, voters);
      parsed = raw;
    } catch (err) {
      const perplexityErr = err instanceof Error ? err : new Error(String(err));
      console.error(
        `[voting] Perplexity fallback also failed: ${perplexityErr.message}`
      );
      throw new Error(
        `All LLM providers failed. Last Gemini error: ${lastError?.message}. Perplexity: ${perplexityErr.message}`
      );
    }
  }

  const result = parseVotingResponse(parsed, voters, p1Name, p2Name);
  result.p1CandidateName = p1CandidateName || p1Name;
  result.p2CandidateName = p2CandidateName || p2Name;

  console.log(
    `[voting] Result: P1=${result.p1Votes} P2=${result.p2Votes} Winner=Player ${result.winner}`
  );

  return result;
}
