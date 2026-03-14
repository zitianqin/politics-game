/**
 * Mock voter rationales for debate outcomes.
 * Until the backend LLM integration is ready, this provides context-aware
 * rationales that each voter would give based on their personality and reasoning style.
 *
 * Format: voters[voterName][candidateName] = "1-2 sentence rationale in voter's voice"
 */

interface VoterRationales {
  [voterName: string]: {
    [candidateName: string]: string;
  };
}

export const voterRationales: VoterRationales = {
  "Barry Nolan": {
    "Candidate A":
      "Talks like a normal bloke, not all fancy words. Says what he means.",
    "Candidate B":
      "Too much waffle. Sounds like an inner-city politician who doesn't get it.",
  },
  "Chloe Atkinson": {
    "Candidate A":
      "I liked what they said about the environment, but it felt a bit surface-level for me.",
    "Candidate B":
      "Really resonated with their values and passion for the future. That matters to me.",
  },
  "Minh Nguyen": {
    "Candidate A":
      "They understand small business. That's what I care about — real economic sense.",
    "Candidate B":
      "Too theoretical. I need someone who gets what it's like to actually run something.",
  },
  "Tracey Dunbar": {
    "Candidate A":
      "They get what life is like for families like mine. That matters more than anything.",
    "Candidate B":
      "Felt disconnected from real parenting struggles. I didn't see myself in their answer.",
  },
  "Colonel David Marsh": {
    "Candidate A":
      "Composed, respectful, disciplined in their argument. That's leadership.",
    "Candidate B":
      "All over the place. Doesn't inspire confidence in someone with this responsibility.",
  },
  "Aunty Rose": {
    "Candidate A":
      "Gave specifics about remote communities. Finally someone who's done their homework.",
    "Candidate B":
      "More empty promises. I've heard this before and nothing changes for us.",
  },
  "Dr. Helen Fairweather": {
    "Candidate A":
      "Grounded in evidence and spoke calmly. I could follow their logic.",
    "Candidate B":
      "Too much emotion, not enough data. I need to trust what I'm hearing.",
  },
  "Damo Perkins": {
    "Candidate A":
      "At least they weren't performing. Felt genuine, even if I didn't agree on everything.",
    "Candidate B":
      "Just more politician BS. Both of them are the same when you really listen.",
  },
  "Sandra Kowalski": {
    "Candidate A":
      "Acknowledged nuance and didn't oversimplify. That's what education needs.",
    "Candidate B":
      "Made statements that weren't actually backed up. I can't support that.",
  },
  "Jake Sorensen": {
    "Candidate A":
      "Bold vision, calls out the real problems my generation faces. I'm in.",
    "Candidate B":
      "Sounds like the old guard. Not ambitious enough for the changes we need.",
  },
  "George Haddad": {
    "Candidate A":
      "Understood economic competence and small business. That's what builds wealth.",
    "Candidate B":
      "Too focused on intervention. I want a government that lets people succeed.",
  },
  "Ken Walters": {
    "Candidate A":
      "Respects farming communities and understands water is life out here. Got my vote.",
    "Candidate B":
      "Sounded like they wanted to shut everything down. Can't support that.",
  },
  "Priya Sundaram": {
    "Candidate A":
      "Spoke about healthcare funding with real commitment. I feel heard.",
    "Candidate B":
      "Just rhetoric. You can't fix healthcare with empty promises.",
  },
  "Scott Rennie": {
    "Candidate A":
      "Confident, decisive. Sounds like someone who can keep the economy strong.",
    "Candidate B":
      "Uncertain. I need to trust whoever's running the show with my business.",
  },
  "Margaret Ellison": {
    "Candidate A":
      "Calm, trustworthy tone. Gave me reassurance about my retirement.",
    "Candidate B":
      "Made me nervous. I need stability, not uncertainty about my super.",
  },
  "Aidan Foley": {
    "Candidate A":
      "Smart policy on tech and housing. Clearly done the work on the details.",
    "Candidate B":
      "Generic responses. Felt like they weren't really prepared for real questions.",
  },
  "Emmanuel Akol": {
    "Candidate A":
      "Spoke with genuine respect for refugee communities. You can tell they mean it.",
    "Candidate B":
      "Words without understanding. I can sense tokenism from a mile away.",
  },
  "Craig Murchison": {
    "Candidate A":
      "Finally someone who gets that regional towns need real investment, not just lip service.",
    "Candidate B":
      "Same old story — Canberra doesn't care about us unless it's election time.",
  },
  "Kylie Pemberton": {
    "Candidate A":
      "Spoke about schools and safety like they actually know what matters to families.",
    "Candidate B":
      "Didn't connect with what I worry about every day for my kids.",
  },
  "Zara Willis": {
    "Candidate A":
      "Got energy, spoke about climate like it actually matters. That's my vote.",
    "Candidate B":
      "Boring and disconnected. My friends would laugh if I voted for them.",
  },
  "Franco Moretti": {
    "Candidate A":
      "Shows pride in Australian agriculture and trade. That's the kind of patriot we need.",
    "Candidate B":
      "Too anti-business. My family built something here, and I won't vote for that.",
  },
  "Bec Thornton": {
    "Candidate A":
      "Actually understands how stretched NDIS funding is. Gave me hope.",
    "Candidate B":
      "Vague on the details. People like me need concrete disability support policy.",
  },
  "Phil Huang": {
    "Candidate A":
      "Measured, precise on healthcare and PBS. This is someone I can trust.",
    "Candidate B":
      "Not enough substance. I need practical, pharmacy-level policy.",
  },
  "Lorraine Cattanach": {
    "Candidate A": "Didn't make me feel guilty for my job. Respect for that.",
    "Candidate B":
      "Sounded like they wanted coal plants gone tomorrow. My town needs those jobs.",
  },
  "Abdul Rahman Siddiqui": {
    "Candidate A":
      "Spoke about family and cost of living like they understand real struggle.",
    "Candidate B":
      "Didn't speak to what matters to people like me building a life here.",
  },
  "Natasha Brennan": {
    "Candidate A":
      "Evidence-based thinking on climate and oceans. Finally someone who respects science.",
    "Candidate B":
      "Denied or downplayed the science. I can't support that as a scientist.",
  },
  "Terry Scullin": {
    "Candidate A":
      "Acknowledged what happened to manufacturing without blaming me for it.",
    "Candidate B":
      "More of the same globalization stuff that left people like me behind.",
  },
  "Jasmine Lee": {
    "Candidate A":
      "Gets intergenerational unfairness and isn't afraid to call out boomers.",
    "Candidate B":
      "Defended the status quo. Housing is unaffordable because of policies like theirs.",
  },
  "Bob Stafford": {
    "Candidate A":
      "Respectful, dignified, didn't seem to be performing. I like that.",
    "Candidate B":
      "Too aggressive, didn't treat my generation with courtesy. That matters.",
  },
  "Amelia Watson": {
    "Candidate A":
      "Spoke about remote healthcare with the specificity that only comes from knowing the gaps.",
    "Candidate B":
      "Romanticized outback life without addressing what we actually need.",
  },
  "Reg Hollingsworth": {
    "Candidate A":
      "Had the numbers to back up their claims. Showed fiscal discipline.",
    "Candidate B":
      "Budget math didn't add up. I can't support policies without proper costings.",
  },
  "Mei-Ling Zhang": {
    "Candidate A":
      "Acknowledged multicultural communities in real terms, not just tokenism.",
    "Candidate B":
      "Felt invisible again — neither candidate speaks to people like my family.",
  },
  "Shaun Daly": {
    "Candidate A":
      "Cared about the reef like I care about it. That passion was genuine.",
    "Candidate B":
      "Talked like corporate development didn't matter. Lost me there.",
  },
  "Helen Trujillo": {
    "Candidate A":
      "Showed genuine compassion and specific policy on social services. That's what we need.",
    "Candidate B": "Kind words but no real commitment. I've seen that before.",
  },
  "Greg Papadopoulos": {
    "Candidate A":
      "Understands construction and business. Worried about my 12 employees.",
    "Candidate B":
      "Too anti-business. My industry needs certainty, not restrictions.",
  },
  "Tanya Gorman": {
    "Candidate A":
      "Actually knows NT issues aren't the same as federal issues. Finally.",
    "Candidate B": "Federal solution thinking. That never works out here.",
  },
  "Oliver Nguyen": {
    "Candidate A":
      "Bold on climate and education, sounds like they actually believe in my future.",
    "Candidate B": "Sounds like my parents' generation. Where's the optimism?",
  },
  "Ruth Andersen": {
    "Candidate A":
      "Thoughtful, substantive, didn't treat me like I need simple words. Respect.",
    "Candidate B": "Too slick, trying too hard. I prefer depth to polish.",
  },
  "Steve Nakamura": {
    "Candidate A":
      "They got it — climate preparedness isn't radical, it's practical after what we saw.",
    "Candidate B":
      "Sounded like floods weren't real or weren't predictable. I live it.",
  },
  "Patricia O'Brien": {
    "Candidate A":
      "Spoke with decency and respect for community values. That's leadership.",
    "Candidate B":
      "Rude tone, no respect for the people they want to govern. Can't support that.",
  },
  "Isaac Mwangi": {
    "Candidate A":
      "Spoke about hard work and fairness like they respect what migrants build.",
    "Candidate B":
      "Didn't acknowledge the pathways question. That's personal to me.",
  },
  "Sharon Koloamatangi": {
    "Candidate A":
      "Spoke to community and dignity. My church and my neighbourhood matter to them.",
    "Candidate B":
      "No empathy for people who don't have a voice. Not good enough.",
  },
  "Neil Patterson": {
    "Candidate A":
      "Understood Darling Downs agriculture like they'd actually talked to farmers.",
    "Candidate B":
      "Sounded like they've never left the city. Can't trust that.",
  },
  "Leila Hosseini": {
    "Candidate A":
      "Spoke about housing policy depth. That's what Australia needs.",
    "Candidate B":
      "Generic housing talk. I need someone who understands affordable design.",
  },
  "Murray Blackwood": {
    "Candidate A":
      "Respected mining and FIFO workers. We're not invisible to them.",
    "Candidate B":
      "Anti-mining rhetoric. Our industry matters and they don't get it.",
  },
  "Fiona Castle": {
    "Candidate A":
      "Just transition thinking — practical and fair for people like me retrained from coal.",
    "Candidate B": "Either too pro-coal or too anti-worker. Neither helps us.",
  },
  "Tom Delacroix": {
    "Candidate A":
      "Anti-establishment and serious on LGBTQ+ rights. They get what's needed.",
    "Candidate B": "Defended the system that doesn't work for people like me.",
  },
  "Deborah Yuen": {
    "Candidate A":
      "Spoke with respect for institutions and accountability. That matters in government.",
    "Candidate B":
      "Undermined institutional integrity. I can't support that professionally.",
  },
  "Aaron Bullock": {
    "Candidate A":
      "Nuanced on crime — tough but understanding why people end up in prison.",
    "Candidate B":
      "Either ignored the real causes or was all punishment, no rehabilitation.",
  },
  "Wendy Broadhurst": {
    "Candidate A":
      "Intellectual honesty and respectful debate. That's what democracy needs.",
    "Candidate B":
      "Dodged questions and wasn't truthful. I can't vote for that.",
  },
  "Danny Ruiz": {
    "Candidate A":
      "Direct, confident, understood why tradies care about earning power.",
    "Candidate B":
      "Uncertain and waffling. I want someone decisive about wages.",
  },
  "Heather Moss": {
    "Candidate A":
      "Practical policy on small business and community investment. That's my livelihood.",
    "Candidate B":
      "Too theoretical. I need workable solutions for my pharmacy.",
  },
  "Doug Mercer": {
    "Candidate A":
      "Working-class solidarity without the preaching. That's what I respect.",
    "Candidate B": "Pro-corporation and anti-worker. Same old story.",
  },
  "Anita Sharma": {
    "Candidate A":
      "Took teacher pay seriously and understood visa pathways matter. I felt heard.",
    "Candidate B": "Education policy wasn't specific enough for my needs.",
  },
  "Carl Briggs": {
    "Candidate A":
      "Authentic about regional towns and entertainment. Not playing us.",
    "Candidate B": "Same tokenistic regional stuff every cycle. Full of it.",
  },
  "Susan Fitzgibbon": {
    "Candidate A":
      "Evidence-based on marine environment and science funding. This is who we need.",
    "Candidate B": "Climate science scepticism. I can't support that.",
  },
  "Robyn Deng": {
    "Candidate A":
      "Pro-business, respects property rights and wealth creation. That works for me.",
    "Candidate B":
      "Anti-property sentiment. My investments are how I built security.",
  },
  "James Okafor": {
    "Candidate A":
      "Spoke about family values and faith respect without being performative.",
    "Candidate B":
      "Didn't acknowledge what faith and family mean to people like me.",
  },
  "Penny Albrecht": {
    "Candidate A":
      "Warm, genuine about climate and regional life. You can tell they care.",
    "Candidate B":
      "Climate wasn't urgent enough. Drought in wine country is real.",
  },
  "Frank Delosa": {
    "Candidate A":
      "Spoke working-class language and cared about community character.",
    "Candidate B":
      "Sounded like they didn't get what I've lost to gentrification.",
  },
  "Grace Muir": {
    "Candidate A":
      "Practical relief on cost of living. That changes whether I eat or not.",
    "Candidate B":
      "Ambitious but no real plan to help students like me right now.",
  },
  "Kev Thompson": {
    "Candidate A":
      "Practical climate adaptation — not ideology, just preparation for what's coming.",
    "Candidate B":
      "Either denying climate is changing or wanted to shut farming down.",
  },
  "Miriam Gold": {
    "Candidate A":
      "Inequality and welfare and human rights — the real progressive vision.",
    "Candidate B":
      "Not serious enough about the systems that keep people down.",
  },
  "Ben Sato": {
    "Candidate A":
      "Understands small business costs. My café stays open because of policy.",
    "Candidate B":
      "Too much regulation and interest rate rhetoric. Not helpful.",
  },
  "Colleen Nguyen": {
    "Candidate A":
      "Specific about aged care and acknowledged frontline workers. Finally.",
    "Candidate B":
      "Vague on aged care. We're burning out and they don't see us.",
  },
  "Andrew Payne": {
    "Candidate A":
      "Economic rigour and long-term thinking on climate. That's sophisticated.",
    "Candidate B":
      "Short-term thinking, not enough depth for a complex economy.",
  },
  "Destiny Williams": {
    "Candidate A":
      "Specific on Indigenous policy, you can tell they've actually learned the history.",
    "Candidate B":
      "Tokenism again. Indigenous communities deserve specificity, not just words.",
  },
};

/**
 * Utility function to get a voter's rationale for a candidate.
 * If exact match not found, returns a fallback generic rationale.
 */
export function getVoterRationale(
  voterName: string,
  candidateName: string
): string {
  if (voterRationales[voterName] && voterRationales[voterName][candidateName]) {
    return voterRationales[voterName][candidateName];
  }

  // Fallback rationales if specific voter not found
  const fallbacks: { [key: string]: string[] } = {
    rational: [
      "They had better policy detail.",
      "Made a more logical argument.",
      "I responded to the facts they presented.",
    ],
    emotional: [
      "They spoke to what I care about.",
      "I felt they were being genuine.",
      "Their passion was convincing.",
    ],
    populist: [
      "Felt like they were on the level.",
      "Sounded authentic to me.",
      "They weren't pretending to be something they're not.",
    ],
  };

  const reasoningStyle =
    Object.keys(fallbacks)[
      Math.floor(Math.random() * Object.keys(fallbacks).length)
    ];
  const options = fallbacks[reasoningStyle];
  return options[Math.floor(Math.random() * options.length)];
}
