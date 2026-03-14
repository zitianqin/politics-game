import { TOPIC_POOL } from "./topicPool";

export interface CandidateProfile {
  fullName: string;
  age: number;
  partyName: string;
  electorate: string;
  background: string;
  profession: string;
  keyPastActions: {
    positive: [string, string];
    controversial: string;
  };
  policyPositions: [string, string, string];
  personalValues: [string, string, string];
  flaws: [string];
}

const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Casey", "Morgan", "Riley", "Jamie",
  "Avery", "Parker", "Cameron", "Blake", "Hayden", "Drew", "Quinn", "Reese",
  "Mia", "Olivia", "Charlotte", "Amelia", "Isla", "Noah", "Liam", "Jack",
  "Ethan", "Lucas", "Harper", "Ruby", "Matilda", "Archie",
];

const LAST_NAMES = [
  "Bennett", "Callaghan", "Nguyen", "Singh", "Haddad", "Murray", "Taylor", "Wilson",
  "Chen", "Patel", "O'Connor", "Williams", "Martin", "Stewart", "Foley", "Kaur",
  "Papadopoulos", "Rahman", "Anderson", "Clarke", "Deng", "Sato", "Murphy", "Dawson",
  "Brooks", "Costa", "Ellis", "Khan", "Parker", "Reid",
];

const PARTY_NAMES = [
  "The Common Ground Party",
  "New Australia Alliance",
  "Fair Go Movement",
  "Future Together Party",
  "Regional Voice Coalition",
  "Practical Progress Party",
  "People First Union",
  "National Renewal Group",
  "Everyday Australia Party",
  "United Communities Front",
];

const ELECTORATES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin",
  "Parramatta", "Fowler", "Warringah", "Wentworth", "Grayndler", "Moncrieff", "Griffith",
  "Lilley", "Boothby", "Mayo", "Higgins", "Chisholm", "Maribyrnong", "Curtin", "Swan",
  "Burt", "Bass", "Braddon", "Lingiari", "Solomon", "Riverina", "Calare",
];

const PROFESSIONS = [
  "Former Nurse",
  "Small-Business Owner",
  "Retired Teacher",
  "Ex-Police Sergeant",
  "Community Legal Advocate",
  "Regional Mayor",
  "Union Organiser",
  "Civil Engineer",
  "Pharmacist",
  "Paramedic",
  "Local Councillor",
  "Agricultural Consultant",
  "Aged Care Manager",
  "Public School Principal",
];

const PERSONAL_VALUES = [
  "family", "fairness", "economic stability", "community safety", "opportunity",
  "accountability", "environmental stewardship", "regional dignity", "pragmatism",
  "respect", "social cohesion", "public service", "hard work", "cost-of-living relief",
];

const FLAWS = [
  "Accused of ducking media questions during a local crisis",
  "Faced criticism over a past expenses claim",
  "Recorded making an off-the-cuff gaffe at a town hall",
  "Called out for slow action during a staffing dispute",
  "Questioned over a close donor relationship",
  "Seen as overly scripted in high-pressure interviews",
];

const POSITIVE_ACTIONS = [
  "Secured funding to expand a local hospital wing",
  "Negotiated a bipartisan package for small-business relief",
  "Led a successful regional drought support initiative",
  "Delivered upgrades for overcrowded public schools",
  "Helped launch a local jobs and retraining program",
  "Coordinated rapid community support after severe flooding",
  "Pushed through red-tape cuts for family-owned businesses",
  "Won support for safer roads in outer-suburban corridors",
  "Expanded apprenticeship pathways for young workers",
  "Brokered practical reform with crossbench support",
];

const CONTROVERSIAL_ACTIONS = [
  "Backed a rushed policy rollout that caused administrative confusion",
  "Was criticized for missing a key vote tied to constituent concerns",
  "Defended a party decision that proved unpopular locally",
  "Initially opposed a reform they later reversed on under pressure",
  "Clashed publicly with local council leaders over planning decisions",
  "Supported a budget cut that critics said hurt frontline services",
];

const POLICY_POSITION_MAP: Array<{ match: RegExp; options: string[] }> = [
  {
    match: /minimum wage|working week|wages/i,
    options: [
      "Lift pay for low-income workers while phasing support for small employers",
      "Tie wage growth to inflation and productivity so pay keeps up with living costs",
    ],
  },
  {
    match: /public transport/i,
    options: [
      "Pilot free off-peak public transport and expand affordable commuter routes",
      "Cap fares and fund reliability upgrades in outer suburbs and growth corridors",
    ],
  },
  {
    match: /coal|gas|nuclear|energy/i,
    options: [
      "Protect energy reliability while accelerating lower-emission generation",
      "Back a practical transition plan with retraining and regional job guarantees",
    ],
  },
  {
    match: /housing|negative gearing|first home/i,
    options: [
      "Boost first-home access with targeted support and faster housing supply",
      "Prioritise build-to-rent and planning reform to lower long-term rents",
    ],
  },
  {
    match: /refugee|immigration|humanitarian/i,
    options: [
      "Support orderly migration with stronger settlement and skills pathways",
      "Increase humanitarian places while investing in local integration services",
    ],
  },
  {
    match: /health|sugar tax|aged care/i,
    options: [
      "Strengthen Medicare and frontline staffing in under-served communities",
      "Invest in preventive health to reduce long-term system pressure",
    ],
  },
  {
    match: /school|education|phones|student/i,
    options: [
      "Raise classroom standards while giving schools practical wellbeing support",
      "Fund teacher retention and modern skills pathways for young Australians",
    ],
  },
  {
    match: /defence|security|crime|speed cameras/i,
    options: [
      "Maintain strong national security with transparent oversight",
      "Back smarter crime prevention and frontline emergency capability",
    ],
  },
  {
    match: /social media|lgbtq|discrimination|religious/i,
    options: [
      "Protect young people online while preserving civil liberties",
      "Defend equal treatment under law with practical community safeguards",
    ],
  },
  {
    match: /tax|wealth tax|super|pension/i,
    options: [
      "Keep taxes predictable while closing loopholes that distort fairness",
      "Protect retirement security with clear long-term rules",
    ],
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function pickDistinct<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const selected: T[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool[idx] as T);
    pool.splice(idx, 1);
  }

  return selected;
}

function generateName(usedNames: Set<string>): string {
  for (let attempts = 0; attempts < 100; attempts++) {
    const name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }

  const fallback = `Candidate ${usedNames.size + 1}`;
  usedNames.add(fallback);
  return fallback;
}

function topicAlignedPosition(topic: string): string {
  for (const rule of POLICY_POSITION_MAP) {
    if (rule.match.test(topic)) {
      return pickOne(rule.options);
    }
  }

  return "Support evidence-led reform with measurable outcomes for everyday Australians";
}

function buildPolicyPositions(topics: string[]): [string, string, string] {
  const fromTopics = topics.slice(0, 2).map((topic) => topicAlignedPosition(topic));
  const thirdTopic = pickOne(TOPIC_POOL);
  const thirdPosition = topicAlignedPosition(thirdTopic);
  const positions = [...fromTopics, thirdPosition];

  const uniquePositions = Array.from(new Set(positions));
  while (uniquePositions.length < 3) {
    uniquePositions.push(topicAlignedPosition(pickOne(TOPIC_POOL)));
  }

  return [uniquePositions[0] as string, uniquePositions[1] as string, uniquePositions[2] as string];
}

function buildBackground(name: string, profession: string, electorate: string): string {
  const sentenceA = `${name} is a ${profession.toLowerCase()} from the electorate of ${electorate} who built a reputation for practical problem solving.`;
  const sentenceB = "They position themselves as a steady operator focused on what families and workers feel every week.";
  const sentenceC = "Critics say they can be overly cautious, while supporters argue that style keeps policy grounded in reality.";
  return `${sentenceA} ${sentenceB} ${sentenceC}`;
}

function generateCandidate(topics: string[], usedNames: Set<string>): CandidateProfile {
  const fullName = generateName(usedNames);
  const profession = pickOne(PROFESSIONS);
  const electorate = pickOne(ELECTORATES);
  const [valueA, valueB, valueC] = pickDistinct(PERSONAL_VALUES, 3) as [string, string, string];
  const [positiveA, positiveB] = pickDistinct(POSITIVE_ACTIONS, 2) as [string, string];
  const controversial = pickOne(CONTROVERSIAL_ACTIONS);
  const flaw = pickOne(FLAWS);

  return {
    fullName,
    age: randomInt(35, 70),
    partyName: pickOne(PARTY_NAMES),
    electorate,
    background: buildBackground(fullName, profession, electorate),
    profession,
    keyPastActions: {
      positive: [positiveA, positiveB],
      controversial,
    },
    policyPositions: buildPolicyPositions(topics),
    personalValues: [valueA, valueB, valueC],
    flaws: [flaw],
  };
}

/**
 * Generates two balanced candidate profiles for a single game session.
 * Both candidates receive the same field shape and equivalent action counts.
 */
export function generateCandidatePair(topics: string[]): [CandidateProfile, CandidateProfile] {
  const usedNames = new Set<string>();
  const c1 = generateCandidate(topics, usedNames);
  let c2 = generateCandidate(topics, usedNames);

  // Avoid accidental same-party mirror match for better visual/personality separation.
  if (c1.partyName === c2.partyName) {
    const alternatives = PARTY_NAMES.filter((name) => name !== c1.partyName);
    c2 = { ...c2, partyName: pickOne(alternatives) };
  }

  return [c1, c2];
}
