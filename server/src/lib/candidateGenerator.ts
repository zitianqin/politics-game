export interface CandidateProfile {
  fullName: string;
  age: number;
  partyName: string;
  electorate: string;
  background: string;
  profession: string;
}

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Sam",
  "Taylor",
  "Casey",
  "Morgan",
  "Riley",
  "Jamie",
  "Avery",
  "Parker",
  "Cameron",
  "Blake",
  "Hayden",
  "Drew",
  "Quinn",
  "Reese",
  "Mia",
  "Olivia",
  "Charlotte",
  "Amelia",
  "Isla",
  "Noah",
  "Liam",
  "Jack",
  "Ethan",
  "Lucas",
  "Harper",
  "Ruby",
  "Matilda",
  "Archie",
];

const LAST_NAMES = [
  "Bennett",
  "Callaghan",
  "Nguyen",
  "Singh",
  "Haddad",
  "Murray",
  "Taylor",
  "Wilson",
  "Chen",
  "Patel",
  "O'Connor",
  "Williams",
  "Martin",
  "Stewart",
  "Foley",
  "Kaur",
  "Papadopoulos",
  "Rahman",
  "Anderson",
  "Clarke",
  "Deng",
  "Sato",
  "Murphy",
  "Dawson",
  "Brooks",
  "Costa",
  "Ellis",
  "Khan",
  "Parker",
  "Reid",
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
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Canberra",
  "Hobart",
  "Darwin",
  "Parramatta",
  "Fowler",
  "Warringah",
  "Wentworth",
  "Grayndler",
  "Moncrieff",
  "Griffith",
  "Lilley",
  "Boothby",
  "Mayo",
  "Higgins",
  "Chisholm",
  "Maribyrnong",
  "Curtin",
  "Swan",
  "Burt",
  "Bass",
  "Braddon",
  "Lingiari",
  "Solomon",
  "Riverina",
  "Calare",
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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
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

function buildBackground(
  name: string,
  profession: string,
  electorate: string
): string {
  const sentenceA = `${name} is a ${profession.toLowerCase()} from the electorate of ${electorate} who built a reputation for practical problem solving.`;
  const sentenceB =
    "They position themselves as a steady operator focused on what families and workers feel every week.";
  const sentenceC =
    "Critics say they can be overly cautious, while supporters argue that style keeps policy grounded in reality.";
  return `${sentenceA} ${sentenceB} ${sentenceC}`;
}

function generateCandidate(
  _topics: string[],
  usedNames: Set<string>
): CandidateProfile {
  const fullName = generateName(usedNames);
  const profession = pickOne(PROFESSIONS);
  const electorate = pickOne(ELECTORATES);

  return {
    fullName,
    age: randomInt(35, 70),
    partyName: pickOne(PARTY_NAMES),
    electorate,
    background: buildBackground(fullName, profession, electorate),
    profession,
  };
}

/**
 * Generates two balanced candidate profiles for a single game session.
 * Both candidates receive the same field shape.
 */
export function generateCandidatePair(
  topics: string[]
): [CandidateProfile, CandidateProfile] {
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
