import { PoliticalLean, VotingStyle } from '../components/VoterSVG';

export interface VoterProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  occupation: string;
  background: string;
  lean: PoliticalLean;
  concerns: string[];
  reasoningStyle: VotingStyle | 'IDEOLOGICAL'; // Extended VotingStyle to include IDEOLOGICAL which appears in PRD
  susceptibleTo: string;
}

// 21 sample voters based on the PRD pool
export const votersData: VoterProfile[] = [
  {
    id: 1,
    name: "Barry Nolan",
    age: 64,
    location: "Penrith NSW",
    occupation: "Retired Electrician",
    background: "Retired electrician who spent 35 years on construction sites. His back is shot and he's bitter about how much his energy bills have gone up since he left work. Votes based on gut feel and who seems like a 'normal bloke.' Distrusts inner-city politicians.",
    lean: "CONSERVATIVE",
    concerns: ["Energy costs", "Cost of living"],
    reasoningStyle: "POPULIST",
    susceptibleTo: "Straight-talking, anti-establishment rhetoric"
  },
  {
    id: 2,
    name: "Chloe Atkinson",
    age: 23,
    location: "Fitzroy VIC",
    occupation: "Barista / Student",
    background: "Barista and part-time environmental science student at Melbourne Uni. Grew up in a middle-class household but moved to the inner city and had her politics reshaped entirely. Anxious about climate change and housing. Very online.",
    lean: "PROGRESSIVE",
    concerns: ["Climate", "Housing", "LGBTQ+ rights"],
    reasoningStyle: "EMOTIONAL",
    susceptibleTo: "Values-based appeals, peer consensus"
  },
  {
    id: 3,
    name: "Minh Nguyen",
    age: 51,
    location: "Cabramatta NSW",
    occupation: "Restaurant Owner",
    background: "Vietnamese-Australian who came to Australia as a child refugee in the 1980s. Runs a successful Vietnamese restaurant and is deeply proud of what he has built. Worried about rising food costs and labour shortages. Hates being told what to do by government.",
    lean: "CENTRE",
    concerns: ["Small business", "Immigration", "Cost of living"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Economic arguments, personal success stories"
  },
  {
    id: 4,
    name: "Tracey Dunbar",
    age: 38,
    location: "Townsville QLD",
    occupation: "School Aide",
    background: "Single mother of three kids aged 5, 8, and 11. Works part-time as a school aide and relies on family tax benefits. Doesn't follow politics closely but votes for whoever seems to care about families like hers. Warm but exhausted.",
    lean: "CENTRE",
    concerns: ["Cost of living", "Childcare", "Schools"],
    reasoningStyle: "EMOTIONAL",
    susceptibleTo: "Relatable personal stories, direct family benefits"
  },
  {
    id: 5,
    name: "Col. David Marsh",
    age: 69,
    location: "Canberra ACT",
    occupation: "Retired Army",
    background: "Retired Army officer with 30 years of service. Disciplined, structured, and deeply patriotic. Believes in strong institutions and is suspicious of the erosion of standards. Respects composure and authority.",
    lean: "CONSERVATIVE",
    concerns: ["Defence", "Border security", "Law and order"],
    reasoningStyle: "TRIBAL",
    susceptibleTo: "Authoritative delivery, national security framing"
  },
  {
    id: 6,
    name: "Rose Napurrula",
    age: 58,
    location: "Darwin NT",
    occupation: "Health Worker",
    background: "Indigenous Australian community health worker who has spent her career advocating for remote community services. Sceptical of politicians who make promises and disappear. Wants candidates who understand life outside capital cities.",
    lean: "PROGRESSIVE",
    concerns: ["Indigenous health", "Remote services", "Housing"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Genuine acknowledgment, specific policy detail"
  },
  {
    id: 7,
    name: "Dr. Helen Fairweather",
    age: 72,
    location: "Toorak VIC",
    occupation: "Retired GP",
    background: "Wealthy retired GP who has always voted centre-right but has softened considerably in recent years on social issues. Reads the AFR. Believes in evidence and resents populism, but also resents high taxes.",
    lean: "CENTRE",
    concerns: ["Healthcare system", "Fiscal resp.", "Social cohesion"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Expert references, calm logical delivery"
  },
  {
    id: 8,
    name: "Damo Perkins",
    age: 46,
    location: "Broken Hill NSW",
    occupation: "Truck Driver",
    background: "Long-haul truckie who has driven every highway in Australia. Convinced both major parties are rotten. Responds to raw authenticity and thinks most politicians are full of it. Will vote for whoever pisses him off least.",
    lean: "APATHETIC",
    concerns: ["Fuel costs", "Infrastructure", "Overreach"],
    reasoningStyle: "POPULIST",
    susceptibleTo: "Bluntness, anti-politician sentiment"
  },
  {
    id: 9,
    name: "Sandra Kowalski",
    age: 44,
    location: "Hobart TAS",
    occupation: "Science Teacher",
    background: "High school science teacher of 18 years. Methodical, evidence-driven, and deeply frustrated by misinformation in public debate. Votes carefully after researching policies.",
    lean: "PROGRESSIVE",
    concerns: ["Education", "Climate", "Public services"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Data, nuanced policy, intellectual honesty"
  },
  {
    id: 10,
    name: "Jake Sorensen",
    age: 20,
    location: "Brisbane QLD",
    occupation: "Law Student",
    background: "First-year law student at QUT. Politically engaged, very online, and has strong opinions on everything. Impatient with older politicians. Easily influenced by progressive ideas.",
    lean: "PROGRESSIVE",
    concerns: ["Housing", "Climate", "Student debt"],
    reasoningStyle: "IDEOLOGICAL",
    susceptibleTo: "Bold progressive policy, idealism"
  },
  {
    id: 11,
    name: "George Haddad",
    age: 39,
    location: "Parramatta NSW",
    occupation: "Accountant",
    background: "Second-generation Lebanese-Australian accountant. Family-oriented, pragmatic, and focused on economic stability. Proud of his parents. Wants low taxes and government to stay out of his way.",
    lean: "CONSERVATIVE",
    concerns: ["Taxes", "Small business", "Family values"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Economic competence, fiscal arguments"
  },
  {
    id: 12,
    name: "Ken Walters",
    age: 61,
    location: "Griffith NSW",
    occupation: "Farmer",
    background: "Third-generation farmer in the Riverina. Deeply conservative but will cross the floor on issues that directly affect his livelihood. Suspicious of greenies but pragmatic about drought.",
    lean: "CONSERVATIVE",
    concerns: ["Water rights", "Farming subsidies", "Regional"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Practical rural policy, respecting farms"
  },
  {
    id: 13,
    name: "Priya Sundaram",
    age: 34,
    location: "Whyalla SA",
    occupation: "Nurse",
    background: "Nurse at a regional hospital that has been chronically understaffed for years. Works double shifts and is exhausted. Originally from Chennai, became a citizen six years ago.",
    lean: "PROGRESSIVE",
    concerns: ["Healthcare funding", "Nursing wages", "Immigration"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Healthcare policy, personal dignity appeals"
  },
  {
    id: 14,
    name: "Scott Rennie",
    age: 42,
    location: "Perth WA",
    occupation: "Real Estate Agent",
    background: "Real estate agent in a booming Perth market. Personally benefits from high property prices but is aware it's locking young people out. Charismatic, votes based on business trust.",
    lean: "CENTRE",
    concerns: ["Property market", "Interest rates", "Business"],
    reasoningStyle: "POPULIST",
    susceptibleTo: "Confidence, economic optimism"
  },
  {
    id: 15,
    name: "Margaret Ellison",
    age: 74,
    location: "Gold Coast QLD",
    occupation: "Retired Bookkeeper",
    background: "Lives off her super and a part pension. Biggest fear is that the government will change the rules on super again. Very loyal once she makes up her mind.",
    lean: "CONSERVATIVE",
    concerns: ["Superannuation", "Pension", "Cost of living"],
    reasoningStyle: "TRIBAL",
    susceptibleTo: "Reassurance, simplicity, trustworthiness"
  },
  {
    id: 16,
    name: "Aidan Foley",
    age: 31,
    location: "Surry Hills NSW",
    occupation: "Software Engineer",
    background: "Globally minded, reads international media, and cares deeply about Australia's place in the world. Pays enormous rent and is annoyed about it. Votes on policy substance.",
    lean: "PROGRESSIVE",
    concerns: ["Housing", "Tech policy", "Climate"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Smart policy, international comparisons"
  },
  {
    id: 17,
    name: "Emmanuel Akol",
    age: 29,
    location: "Adelaide SA",
    occupation: "Youth Worker",
    background: "South Sudanese-Australian who arrived as a refugee at age 10. Works supporting newly arrived refugee communities. Passionate, articulate, and deeply invested in equality.",
    lean: "PROGRESSIVE",
    concerns: ["Refugee policy", "Youth services", "Equality"],
    reasoningStyle: "RATIONAL",
    susceptibleTo: "Genuine policy commitment, respect"
  },
  {
    id: 18,
    name: "Craig Murchison",
    age: 53,
    location: "Dubbo NSW",
    occupation: "Pub Owner",
    background: "Owns the main pub in a small town. Pragmatic, community-focused, and increasingly frustrated that regional towns are being left behind.",
    lean: "APATHETIC",
    concerns: ["Regional investment", "Small business", "Roads"],
    reasoningStyle: "POPULIST",
    susceptibleTo: "Regional acknowledgment, community values"
  },
  {
    id: 19,
    name: "Kylie Pemberton",
    age: 36,
    location: "Cranbourne VIC",
    occupation: "Stay-at-home Parent",
    background: "Husband drives forklifts. They bought their house at the edge of affordability and the mortgage is tight. School quality and local safety are her main lenses.",
    lean: "CENTRE",
    concerns: ["Schools", "Cost of living", "Safety"],
    reasoningStyle: "EMOTIONAL",
    susceptibleTo: "Relatable family framing, local investment"
  },
  {
    id: 20,
    name: "Zara Willis",
    age: 19,
    location: "Wollongong NSW",
    occupation: "First-time Voter",
    background: "Consumes most of her political content via TikTok. Inconsistent — views shift depending on what went viral. Responds to charisma and delivery more than policy substance.",
    lean: "PROGRESSIVE",
    concerns: ["Climate", "Housing", "Cost of living"],
    reasoningStyle: "EMOTIONAL",
    susceptibleTo: "Charisma, viral-style messaging"
  },
  {
    id: 21,
    name: "Franco Moretti",
    age: 66,
    location: "Barossa Valley SA",
    occupation: "Winemaker",
    background: "Italian-Australian winemaker. Proud of his heritage, wine, and South Australia. Deeply conservative on economic issues but surprisingly progressive on multiculturalism. Votes with his gut.",
    lean: "CONSERVATIVE",
    concerns: ["Agriculture", "Exports", "Water"],
    reasoningStyle: "EMOTIONAL",
    susceptibleTo: "National pride, economic confidence"
  }
];
