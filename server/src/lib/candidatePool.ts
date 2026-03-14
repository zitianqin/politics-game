import { TOPIC_POOL } from "./topicPool";

export interface CandidateProfile {
  fullName: string;
  age: number;
  partyName: string;
  electorate: string;
  background: string;
  profession: string;
  keyActions: {
    positive: [string, string];
    controversial: string;
  };
  policyPositions: [string, string, string];
  personalValues: [string, string, string];
  flaws: string[];
}

interface CandidateArchetype {
  profession: string;
  backgroundFrames: [string, string, string];
  keyActionPool: readonly string[];
  controversyPool: readonly string[];
  values: [string, string, string];
  flawPool: readonly string[];
}

const FIRST_NAMES: readonly string[] = [
  "Amelia",
  "Jack",
  "Sienna",
  "Noah",
  "Priya",
  "Lachlan",
  "Ruby",
  "Ethan",
  "Mia",
  "Aiden",
  "Olivia",
  "Archer",
  "Grace",
  "William",
  "Zara",
  "Cooper",
  "Hannah",
  "James",
  "Harper",
  "Liam",
];

const LAST_NAMES: readonly string[] = [
  "Nguyen",
  "Patel",
  "Williams",
  "Singh",
  "Murphy",
  "Bennett",
  "Davies",
  "Rahman",
  "Taylor",
  "Campbell",
  "Khan",
  "Anderson",
  "O'Connor",
  "Brooks",
  "Wilson",
  "Dawson",
  "Foley",
  "Hughes",
  "Sullivan",
  "Morrison",
];

const PARTY_NAMES: readonly string[] = [
  "The Common Ground Party",
  "New Australia Alliance",
  "Australian Main Street League",
  "Civic Renewal Party",
  "Future Fairness Coalition",
  "Practical Progress Party",
  "National Opportunity Party",
  "United Community Front",
];

const ELECTORATES: readonly string[] = [
  "Warringah (NSW)",
  "Brisbane (QLD)",
  "Bean (ACT)",
  "Boothby (SA)",
  "Corangamite (VIC)",
  "Burt (WA)",
  "Bass (TAS)",
  "Lingiari (NT)",
  "Macnamara (VIC)",
  "Leichhardt (QLD)",
  "Hindmarsh (SA)",
  "Lyons (TAS)",
  "Hasluck (WA)",
  "Bennelong (NSW)",
  "Menzies (VIC)",
  "Ryan (QLD)",
  "Page (NSW)",
  "Spence (SA)",
];

const CANDIDATE_ARCHETYPES: readonly CandidateArchetype[] = [
  {
    profession: "Former public school principal",
    backgroundFrames: [
      "Spent two decades improving underperforming public schools in growth suburbs.",
      "Built a reputation for transparent budgets and practical service delivery over slogans.",
      "Entered federal politics after leading local education and youth support coalitions.",
    ],
    keyActionPool: [
      "Secured bipartisan funding for regional teacher retention.",
      "Published annual community scorecards on school outcomes.",
      "Expanded after-school tutoring partnerships for low-income students.",
      "Negotiated cross-council support for school mental health teams.",
    ],
    controversyPool: [
      "Faced criticism after backing a strict attendance policy for struggling schools.",
      "Was accused of centralising too much decision-making during a budget crunch.",
      "Received backlash for closing one underused specialist program.",
    ],
    values: ["Fairness", "Accountability", "Opportunity"],
    flawPool: [
      "Can sound overly scripted in debates.",
      "Sometimes over-explains details under pressure.",
      "Struggles to pivot quickly when attacked.",
    ],
  },
  {
    profession: "Small-business owner",
    backgroundFrames: [
      "Started with one family-run shop and expanded through volatile cost-of-living cycles.",
      "Known locally for mentoring apprentices and first-time operators in outer suburbs.",
      "Moved into politics after years of lobbying for small-business policy reform.",
    ],
    keyActionPool: [
      "Built a local supplier network that kept contracts in regional towns.",
      "Introduced a payroll simplification package for micro-businesses.",
      "Expanded apprenticeship placements through a cross-industry compact.",
      "Negotiated discounted energy purchasing for independent operators.",
    ],
    controversyPool: [
      "Drew criticism after opposing a workplace regulation update.",
      "Faced scrutiny when a franchise partner was found underpaying staff.",
      "Backed a tax concession opponents called too generous to business owners.",
    ],
    values: ["Self-reliance", "Growth", "Stability"],
    flawPool: [
      "Can underplay social policy complexity.",
      "Sometimes appears transactional in interviews.",
      "Leans too heavily on business metaphors.",
    ],
  },
  {
    profession: "Regional nurse coordinator",
    backgroundFrames: [
      "Worked across metro and remote hospitals managing workforce shortages and emergency demand.",
      "Known for combining frontline healthcare experience with hard budget trade-offs.",
      "Entered politics after leading statewide rural health access campaigns.",
    ],
    keyActionPool: [
      "Expanded after-hours primary care hubs in underserved electorates.",
      "Secured retention incentives for nurses and allied health workers.",
      "Piloted integrated care pathways between local clinics and hospitals.",
      "Delivered telehealth infrastructure upgrades for remote communities.",
    ],
    controversyPool: [
      "Backed a hospital restructure that closed one low-use ward.",
      "Was criticised for approving temporary private-provider contracts.",
      "Faced backlash over delayed rollout of a youth mental health program.",
    ],
    values: ["Dignity", "Practical reform", "Community trust"],
    flawPool: [
      "Can be cautious when bold messaging is expected.",
      "Sometimes avoids direct confrontation.",
      "Uses technical language that loses some voters.",
    ],
  },
  {
    profession: "Infrastructure policy consultant",
    backgroundFrames: [
      "Built a career linking energy reliability, industrial jobs, and long-term transition planning.",
      "Known for brokering deals between regional employers and climate-focused councils.",
      "Entered parliament after advising major transport and grid projects across Australia.",
    ],
    keyActionPool: [
      "Secured grid upgrades that cut repeated summer outages.",
      "Designed retraining programs for workers leaving legacy energy sectors.",
      "Negotiated a staged emissions roadmap with regional safeguards.",
      "Expanded freight corridor upgrades supporting local manufacturing.",
    ],
    controversyPool: [
      "Was criticised by activists for supporting a transitional gas project.",
      "Drew backlash from industry after endorsing stricter emissions reporting.",
      "Faced claims of mixed messaging during an energy price spike.",
    ],
    values: ["Security", "Transition fairness", "Long-term planning"],
    flawPool: [
      "Can sound cautious rather than inspiring.",
      "Sometimes gets stuck in technical framing.",
      "Appears indecisive in fast media cycles.",
    ],
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)] as T;
}

function sampleWithoutReplacement<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const selected: T[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = randomInt(0, pool.length - 1);
    const [item] = pool.splice(idx, 1);
    selected.push(item as T);
  }

  return selected;
}

function topicToPosition(topic: string): string {
  const stem = topic.trim().replace(/^Should\s+/i, "").replace(/\?$/, "").toLowerCase();
  const side = Math.random() < 0.5 ? "Supports" : "Opposes";
  return `${side} ${stem}.`;
}

function buildCandidate(archetype: CandidateArchetype): CandidateProfile {
  const fullName = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  const age = randomInt(35, 70);
  const partyName = pickOne(PARTY_NAMES);
  const electorate = pickOne(ELECTORATES);

  const positiveActions = sampleWithoutReplacement(archetype.keyActionPool, 2) as [
    string,
    string,
  ];

  const policyPositions = sampleWithoutReplacement(TOPIC_POOL, 3).map(topicToPosition) as [
    string,
    string,
    string,
  ];

  return {
    fullName,
    age,
    partyName,
    electorate,
    background: `${archetype.backgroundFrames[0]} ${archetype.backgroundFrames[1]} ${archetype.backgroundFrames[2]}`,
    profession: archetype.profession,
    keyActions: {
      positive: positiveActions,
      controversial: pickOne(archetype.controversyPool),
    },
    policyPositions,
    personalValues: [...archetype.values] as [string, string, string],
    flaws: [pickOne(archetype.flawPool)],
  };
}

export function getRandomCandidates(count: number = 2): CandidateProfile[] {
  const archetypes = sampleWithoutReplacement(
    CANDIDATE_ARCHETYPES,
    Math.min(count, CANDIDATE_ARCHETYPES.length)
  );

  return archetypes.map((archetype) => buildCandidate(archetype));
}
