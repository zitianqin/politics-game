# PRD: 1v1 Australian Politics Debate Game

**Version:** 1.0  
**Status:** Draft  
**Stack:** Next.js · Express.js · Socket.io · Groq Whisper · Gemini API

---

## 1. Overview

A real-time, browser-based 1v1 party game in which two players compete to win a fictional Australian election by out-debating each other in front of 5 AI-simulated voters. Players connect from separate devices, are assigned procedurally generated candidate profiles, and debate two randomised policy topics under live time pressure. The game is inspired by the visual energy of Jackbox Party Pack — bright, bold, and fun for ordinary people with no political expertise required.

---

## 2. Goals & Non-Goals

### Goals

- Deliver a low-friction, high-entertainment multiplayer debate game playable by two people anywhere in the world.
- Use real speech (microphone) captured via Groq Whisper transcription as the primary input.
- Use Gemini (Gemini 3.1 Flash) as the voter-simulation engine, with Perplexity API as fallback.
- Keep debate topics accessible to Australian laypeople — no specialist knowledge required.
- Maintain fair starting conditions: without a debate, the 5 AI voters would split ~50/50 between the two candidates.

### Non-Goals

- No spectator/audience mode in v1.
- No persistent leaderboard or ranking system in v1.
- No mobile app (browser only).
- No real-world political party affiliation or endorsement.

---

## 3. User Stories

| #   | As a…  | I want to…                                                          | So that…                                               |
| --- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Player | Create a new game and share a 6-character alphanumeric code         | My friend can join from another device                 |
| 2   | Player | Join a game by entering a code                                      | I don't need an account                                |
| 3   | Player | See my candidate's full biography before the debate starts          | I can roleplay convincingly                            |
| 4   | Player | See all 5 voter profiles before the debate                         | I can tailor my arguments                              |
| 5   | Player | Speak into my microphone during my turn                             | My speech is captured and transcribed                  |
| 6   | Player | Press an "Objection!" button to interrupt my opponent               | I can challenge a bad point if I have enough time left |
| 7   | Player | Watch a live timer showing my remaining speaking time               | I know when I'm about to run out                       |
| 8   | Player | See the debate topic with 10 seconds to read before speaking begins | I can gather my thoughts                               |
| 9   | Player | See the final vote breakdown after the debate                       | I know who won and why                                 |

---

## 4. Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  LOBBY                                                          │
│  Host creates game → Game code displayed                        │
│  Guest enters code → Both players in lobby                      │
│  Host presses "Start" → Character assignment                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  CHARACTER REVEAL (30 s read time)                              │
│  Both players see:                                              │
│    • Their own candidate bio                                    │
│    • Their opponent's candidate bio                             │
│    • All 5 voter profiles (names, age, occupation, values)     │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │          ROUND 1            │
          │                             │
          │  1. Topic reveal (display)  │
          │  2. 10 s prep countdown     │
          │  3. Debate phase (2 min)    │
          │     — P1 speaks first       │
          │     — Objections allowed    │
          │  4. Round ends              │
          │  5. Transcript sent to LLM  │
          │     → interim vote standings│
          └──────────────┬──────────────┘
                         │ immediately
          ┌──────────────▼──────────────┐
          │          ROUND 2            │
          │                             │
          │  1. Topic reveal (display)  │
          │  2. 10 s prep countdown     │
          │  3. Debate phase (2 min)    │
          │     — P2 speaks first       │
          │     — Objections allowed    │
          │  4. Round ends              │
          │  5. Full transcript sent    │
          │     to LLM → FINAL result   │
          └──────────────┬──────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  RESULTS                                                        │
│  Final LLM response (all rounds) determines winner             │
│  5 AI voters each cast a vote in character                     │
│  Animated vote reveal, winner declared                          │
└─────────────────────────────────────────────────────────────────┘
```

### Round Speaking Order

| Round | First Speaker |
| ----- | ------------- |
| 1     | Player 1      |
| 2     | Player 2      |

Each player has **60 seconds total** speaking time per round, used however they wish (one block, many small blocks, etc.).

---

## 5. Debate Mechanics

### 5.1 Speaking Time

- Each player has **60 seconds** of speaking time per round.
- Time only counts down while the microphone is considered "live" for that player.
- A large on-screen timer shows remaining time. Colour changes: green → amber (20 s) → red (10 s).

### 5.2 Objections

- At any point while the **opponent** is speaking, a player may press the **Objection!** button.
- **Conditions to object:**
  - The objecting player must have **> 15 seconds** of their own remaining time.
  - **Cost:** 15 seconds is immediately deducted from the objecting player's remaining time.
- Effect: The opponent's microphone is muted, the objecting player's microphone goes live, and the floor passes to them instantly.
- **Audio/visual flourish:** A bold "OBJECTION!" graphic slams onto the screen with a sharp gavel or buzzer sound effect. The objecting player's podium panel flashes red and the screen briefly shakes. The interrupted player's panel dims.
- The objected player's timer pauses; it resumes when the floor returns to them.
- There is no cap on the number of objections, but the cost means reckless objections are self-punishing.

### 5.3 Floor Passing

- Either player may voluntarily yield the floor back to the other player at any time.
- If a player's time runs out, the floor automatically passes to the opponent.
- When both players have exhausted their time, the round ends.

### 5.4 Transcription

- All audio is streamed to the backend and transcribed in real time using **Groq Whisper** (`whisper-large-v3-turbo` model).
- Transcripts are labelled with speaker, timestamp, and objection markers.
- The complete transcript for both rounds is stored in Supabase for use in the voting phase.

---

## 6. Candidate Generation

Each game session procedurally generates two candidate profiles. Profiles are balanced so that no candidate has an objectively dominant background.

### Candidate Profile Fields

| Field            | Details                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| Full name        | Procedurally generated Australian name                                      |
| Age              | 35–70                                                                       |
| Party name       | Fictional party (e.g., "The Common Ground Party", "New Australia Alliance") |
| Electorate       | A real Australian electorate                                                |
| Background       | 2–3 sentence biography                                                      |
| Profession       | e.g., former nurse, small-business owner, retired teacher                   |
| Key past actions | 2 positive + 1 controversial/negative                                       |
| Policy positions | 3 headline positions (aligned with debate topic pool)                       |
| Personal values  | Family, environment, economy, fairness, etc.                                |
| Flaws            | e.g., tax scandal, public gaffe, party leadership dispute                   |

Profiles are generated at session start and held in the server-side game state object in memory.

---

## 7. Voter Profiles

There is a **static predefined pool of 67 voter profiles**. At the start of each game, **5 are randomly selected** from this pool. The pool is balanced so that any random draw of 5 will produce a roughly even split between candidates in the absence of a debate. Voters are all Australian (may include immigrants or first-generation Australians).

### Voter Profile Fields

| Field             | Details                                                |
| ----------------- | ------------------------------------------------------ |
| Name              | Full Australian name                                   |
| Age               | 18–80                                                  |
| Location          | Australian state/city                                  |
| Occupation        | Diverse range                                          |
| Background blurb  | 2–3 sentences                                          |
| Political lean    | Centre, conservative, progressive, swinging, apathetic |
| Key concerns      | e.g., cost of living, climate, immigration, healthcare |
| Reasoning style   | Rational, emotional, populist, tribal                  |
| Susceptibility to | Policy argument, personal attacks, charisma, fear      |

### Full Voter Pool (67 profiles)

---

**1. Barry Nolan, 64, Penrith NSW**
Retired electrician who spent 35 years on construction sites across Western Sydney. His back is shot and he's bitter about how much his energy bills have gone up since he left work. Votes based on gut feel and who seems like a "normal bloke." Distrusts inner-city politicians and anyone who uses the word "transition."
_Lean:_ Conservative | _Concerns:_ Energy costs, cost of living | _Reasoning:_ Populist | _Susceptible to:_ Straight-talking, anti-establishment rhetoric

---

**2. Chloe Atkinson, 23, Fitzroy VIC**
Barista and part-time environmental science student at Melbourne Uni. Grew up in a middle-class household in Ballarat but moved to the inner city and had her politics reshaped entirely. Anxious about climate change and housing affordability in equal measure. Very online.
_Lean:_ Progressive | _Concerns:_ Climate, housing, LGBTQ+ rights | _Reasoning:_ Emotional | _Susceptible to:_ Values-based appeals, peer consensus

---

**3. Minh Nguyen, 51, Cabramatta NSW**
Vietnamese-Australian who came to Australia as a child refugee in the 1980s. Runs a successful Vietnamese restaurant and is deeply proud of what he has built. Worried about rising food costs and labour shortages. Fiercely independent, hates being told what to do by government.
_Lean:_ Swinging | _Concerns:_ Small business, immigration, cost of living | _Reasoning:_ Rational | _Susceptible to:_ Economic arguments, personal success stories

---

**4. Tracey Dunbar, 38, Townsville QLD**
Single mother of three kids aged 5, 8, and 11. Works part-time as a school aide and relies on family tax benefits. Every week is a juggle. She doesn't follow politics closely but votes for whoever seems to care about families like hers. Warm but exhausted.
_Lean:_ Swinging | _Concerns:_ Cost of living, childcare, schools | _Reasoning:_ Emotional | _Susceptible to:_ Relatable personal stories, direct family benefits

---

**5. Colonel (Ret.) David Marsh, 69, Canberra ACT**
Retired Army officer with 30 years of service. Disciplined, structured, and deeply patriotic. Believes in strong institutions and is suspicious of what he calls "the erosion of standards." Has voted the same way his entire life and sees no reason to change. Respects composure and authority.
_Lean:_ Conservative | _Concerns:_ Defence, border security, law and order | _Reasoning:_ Tribal | _Susceptible to:_ Authoritative delivery, national security framing

---

**6. Aunty Rose Napurrula, 58, Darwin NT**
Indigenous Australian community health worker who has spent her career advocating for remote community services. Deeply sceptical of politicians from both sides who make promises and disappear. Cares most about whether candidates actually understand what life is like outside capital cities.
_Lean:_ Progressive | _Concerns:_ Indigenous health, remote services, housing | _Reasoning:_ Rational | _Susceptible to:_ Genuine acknowledgment, specific policy detail

---

**7. Dr. Helen Fairweather, 72, Toorak VIC**
Wealthy retired GP who has always voted centre-right but has softened considerably in recent years on social issues. Reads the AFR and The Guardian on alternate days. Believes in evidence and resents populism, but also resents high taxes. Conflicted and analytical.
_Lean:_ Centre | _Concerns:_ Healthcare system, fiscal responsibility, social cohesion | _Reasoning:_ Rational | _Susceptible to:_ Expert references, calm logical delivery

---

**8. Damo Perkins, 46, Broken Hill NSW**
Long-haul truckie who has driven every highway in Australia. Deeply anti-establishment and convinced both major parties are rotten. Gets most of his news from podcasts and YouTube. Responds to raw authenticity and thinks most politicians are full of it. Will vote for whoever pisses him off least.
_Lean:_ Apathetic / anti-establishment | _Concerns:_ Fuel costs, regional infrastructure, government overreach | _Reasoning:_ Populist | _Susceptible to:_ Bluntness, anti-politician sentiment

---

**9. Sandra Kowalski, 44, Hobart TAS**
High school science teacher of 18 years. Methodical, evidence-driven, and deeply frustrated by misinformation in public debate. Votes carefully after researching policies. Finds it hard to respect candidates who oversimplify or misrepresent facts. Two kids in public school.
_Lean:_ Centre-progressive | _Concerns:_ Education funding, climate, public services | _Reasoning:_ Rational | _Susceptible to:_ Data, nuanced policy, intellectual honesty

---

**10. Jake Sorensen, 20, Brisbane QLD**
First-year law student at QUT. Politically engaged since Year 10, very online, and has strong opinions on everything from housing to criminal justice reform. Impatient with older politicians. Easily influenced by whoever sounds most progressive but will notice logical inconsistencies.
_Lean:_ Progressive | _Concerns:_ Housing affordability, climate, student debt | _Reasoning:_ Emotional / ideological | _Susceptible to:_ Bold progressive policy, idealism

---

**11. George Haddad, 39, Parramatta NSW**
Second-generation Lebanese-Australian accountant who runs his own small firm. Family-oriented, pragmatic, and focused on economic stability. His parents came to Australia with nothing and he's proud of how far they've come. Wants low taxes and a government that stays out of his way.
_Lean:_ Centre-right | _Concerns:_ Taxes, small business, family values | _Reasoning:_ Rational | _Susceptible to:_ Economic competence, fiscal arguments

---

**12. Ken Walters, 61, Griffith NSW**
Third-generation farmer in the Riverina who grows rice and cotton. Has watched water rights get more complicated every decade. Deeply conservative but will cross the floor on issues that directly affect his livelihood. Suspicious of greenies but pragmatic about drought.
_Lean:_ Conservative | _Concerns:_ Water rights, farming subsidies, regional investment | _Reasoning:_ Rational | _Susceptible to:_ Practical rural policy, respecting farming communities

---

**13. Priya Sundaram, 34, Whyalla SA**
Nurse at a regional South Australian hospital that has been chronically understaffed for years. Works double shifts regularly and is exhausted. Originally from Chennai, became a citizen six years ago. Believes the healthcare system is held together by goodwill alone and wants proper investment.
_Lean:_ Progressive | _Concerns:_ Healthcare funding, nursing wages, immigration pathways | _Reasoning:_ Rational | _Susceptible to:_ Healthcare policy, personal dignity appeals

---

**14. Scott Rennie, 42, Perth WA**
Real estate agent in a Perth market that has been booming. Personally benefits from high property prices but is aware it's locking young people out. Has some cognitive dissonance about this. Sociable, charismatic, and votes based on who he'd trust to run his business.
_Lean:_ Centre-right | _Concerns:_ Property market, interest rates, business confidence | _Reasoning:_ Populist | _Susceptible to:_ Confidence, economic optimism

---

**15. Margaret Ellison, 74, Gold Coast QLD**
Retired bookkeeper who lives off her super and a part pension. Her biggest fear is that the government will change the rules on super again. Goes to bowls on Wednesdays and watches the news every night. Very loyal once she makes up her mind, but she's still making it up.
_Lean:_ Conservative | _Concerns:_ Superannuation, pension, cost of living | _Reasoning:_ Tribal | _Susceptible to:_ Reassurance, simplicity, trustworthiness signals

---

**16. Aidan Foley, 31, Surry Hills NSW**
Software engineer at a Sydney tech startup. Globally minded, reads international media, and cares deeply about Australia's place in the world. Has considered moving to Europe for better work-life balance. Pays enormous rent and is annoyed about it. Votes on policy substance.
_Lean:_ Centre-progressive | _Concerns:_ Housing, tech policy, climate, global competitiveness | _Reasoning:_ Rational | _Susceptible to:_ Smart policy, international comparisons

---

**17. Emmanuel Akol, 29, Adelaide SA**
South Sudanese-Australian who arrived as a refugee at age 10 and became a citizen in his early twenties. Works as a youth worker supporting newly arrived refugee communities. Passionate, articulate, and deeply invested in how Australia treats vulnerable people. Not easily swayed by rhetoric.
_Lean:_ Progressive | _Concerns:_ Refugee policy, youth services, racial equality | _Reasoning:_ Rational | _Susceptible to:_ Genuine policy commitment, respect for lived experience

---

**18. Craig Murchison, 53, Dubbo NSW**
Owns the main pub in a small town west of Dubbo. His business is the social hub of the community. Cares about regional Australia being taken seriously in Canberra. Pragmatic, community-focused, and increasingly frustrated that regional towns are being left behind.
_Lean:_ Swinging | _Concerns:_ Regional investment, small business, roads and infrastructure | _Reasoning:_ Populist | _Susceptible to:_ Regional acknowledgment, relatable community values

---

**19. Kylie Pemberton, 36, Cranbourne VIC**
Stay-at-home parent to two primary school kids in outer Melbourne. Husband drives forklifts. They bought their house at the edge of affordability and the mortgage is tight. School quality and local safety are her main lenses. Warm but wary of being talked down to.
_Lean:_ Swinging | _Concerns:_ Schools, cost of living, neighbourhood safety | _Reasoning:_ Emotional | _Susceptible to:_ Relatable family framing, local community investment

---

**20. Zara Willis, 19, Wollongong NSW**
First-time voter who consumes most of her political content via TikTok and Instagram. She's passionate but inconsistent — her views shift depending on what went viral that week. Responds to charisma and delivery more than policy substance. Her friends' opinions matter enormously to her.
_Lean:_ Progressive (loosely) | _Concerns:_ Climate, housing, cost of living | _Reasoning:_ Emotional | _Susceptible to:_ Charisma, viral-style messaging, personal attacks on opponents

---

**5. Franco Moretti, 66, Barossa Valley SA**
Italian-Australian winemaker whose family has been in the Barossa for three generations. Proud of his heritage, proud of his wine, and proud of South Australia. Deeply conservative on economic issues but surprisingly progressive on multiculturalism. Votes with his gut.
_Lean:_ Centre-right | _Concerns:_ Agriculture, exports, water, small business | _Reasoning:_ Emotional | _Susceptible to:_ National pride, economic confidence, regional respect

---

**22. Bec Thornton, 27, Launceston TAS**
Disability support worker who has seen firsthand how stretched NDIS funding has become. Lives with her partner in a rented flat they can barely afford. Feels the system is broken but hasn't given up on it yet. Thoughtful and empathetic, but not naive.
_Lean:_ Progressive | _Concerns:_ NDIS, disability services, housing, wages | _Reasoning:_ Rational | _Susceptible to:_ Compassionate policy detail, funding commitments

---

**23. Phil Huang, 47, Box Hill VIC**
Chinese-Australian pharmacist who owns two pharmacies in Melbourne's eastern suburbs. Pays close attention to healthcare policy and PBS changes. Cautious, methodical, and unimpressed by theatrical debates. Votes for stability and competence above all else.
_Lean:_ Centre | _Concerns:_ Healthcare policy, small business, Medicare | _Reasoning:_ Rational | _Susceptible to:_ Policy precision, calm authority

---

**24. Lorraine Cattanach, 55, Mackay QLD**
Works admin at a coal mine and has done so for 20 years. Knows the industry is under pressure and worries deeply about what happens to her town when the jobs go. Not anti-environment but anti-disruption. Tired of being made to feel guilty for her livelihood.
_Lean:_ Conservative | _Concerns:_ Mining jobs, energy transition, regional employment | _Reasoning:_ Emotional | _Susceptible to:_ Job security messaging, anti-greenie sentiment

---

**25. Abdul Rahman Siddiqui, 44, Auburn NSW**
Pakistani-Australian taxi driver who has been driving cabs and then rideshare for 18 years. Works 60-hour weeks to send money home and pay off his mortgage. Deeply religious, very family-focused, and concerned about social values and the cost of living. Politically disengaged but will vote if something feels personal.
_Lean:_ Conservative-leaning | _Concerns:_ Cost of living, family values, religious freedom | _Reasoning:_ Emotional | _Susceptible to:_ Personal cost-of-living framing, family-first rhetoric

---

**26. Natasha Brennan, 33, Fremantle WA**
Marine biologist at a WA research institute. Passionate about ocean conservation and frustrated that she has to keep justifying the science to policymakers. Articulate, confident, and unimpressed by candidates who dodge questions. Probably the most informed voter in any room.
_Lean:_ Progressive | _Concerns:_ Climate, environment, science funding | _Reasoning:_ Rational | _Susceptible to:_ Evidence-based policy, intellectual rigour

---

**27. Terry Scullin, 59, Geelong VIC**
Former Ford auto worker who was retrained after the factory closed. Works in logistics now. Feels like he did everything right and still got left behind by globalisation. Not racist but drawn to anti-immigration arguments when job security comes up. Drinks with the same mates he's had since 1987.
_Lean:_ Swinging | _Concerns:_ Jobs, wages, manufacturing, immigration | _Reasoning:_ Tribal | _Susceptible to:_ Nostalgia, economic protectionism, mate-culture appeals

---

**28. Jasmine Lee, 25, Fortitude Valley QLD**
Graphic designer at a creative agency who freelances on the side. Renting with three housemates and saving nothing. Identifies strongly with her generation's economic disadvantage and has a lot of feelings about boomers owning multiple investment properties. Very vocal on social media.
_Lean:_ Progressive | _Concerns:_ Housing, intergenerational equity, climate | _Reasoning:_ Emotional | _Susceptible to:_ Generational fairness arguments, negative gearing critique

---

**29. Bob Stafford, 77, Ballarat VIC**
Retired bank manager who lives alone since his wife passed. Reads the paper every morning. Considers himself a moderate but has drifted right as the world changed around him. Responds to dignity, courtesy, and candidates who don't seem to be performing.
_Lean:_ Centre-right | _Concerns:_ Pension, aged care, social stability | _Reasoning:_ Rational | _Susceptible to:_ Respectful tone, personal composure, reassurance

---

**30. Amelia Watson, 30, Alice Springs NT**
Paramedic in Alice Springs who deals with the consequences of inadequate social services every shift. Burned out but deeply committed. Sees the gap between policy and reality in the sharpest possible terms. Will call out any candidate who romanticises outback Australia.
_Lean:_ Progressive | _Concerns:_ Remote healthcare, housing, Indigenous services | _Reasoning:_ Rational | _Susceptible to:_ Specific funding commitments, practical on-the-ground policy

---

**31. Reg Hollingsworth, 68, Bathurst NSW**
Retired NSW public servant. Spent 30 years processing paperwork and believes in bureaucratic process. Fiscally conservative, socially moderate. Deeply unimpressed by candidates who make promises without costings. Wants to see the fine print.
_Lean:_ Centre | _Concerns:_ Fiscal responsibility, public services, government accountability | _Reasoning:_ Rational | _Susceptible to:_ Detailed policy, budget responsibility framing

---

**32. Mei-Ling Zhang, 38, Chatswood NSW**
Chinese-born Australian accountant who migrated 12 years ago. Works for a mid-sized firm in North Sydney. Focused on education for her two kids and saving for their future. Feels politically invisible — neither party speaks directly to her community. Pays close attention to tax policy.
_Lean:_ Centre | _Concerns:_ Education, taxes, property, immigration | _Reasoning:_ Rational | _Susceptible to:_ Economic competence, multicultural acknowledgment

---

**33. Shaun Daly, 22, Cairns QLD**
Backpacker hostel worker who grew up in Cairns and has no plans to leave. Loves the reef, loves the lifestyle, hates the idea of corporate development ruining it. Laid-back but gets intense about environmental issues. Probably won't vote unless someone makes it feel urgent.
_Lean:_ Progressive (apathetic) | _Concerns:_ Environment, reef, tourism | _Reasoning:_ Emotional | _Susceptible to:_ Passion, environmental urgency, anti-corporate messaging

---

**34. Helen Trujillo, 49, Dandenong VIC**
Colombian-Australian social worker who has worked in Melbourne's southeast for 20 years. Sees poverty and family breakdown up close. Believes Australia is fundamentally decent but that the safety net has been underfunded for too long. Patient, measured, and hard to fool.
_Lean:_ Progressive | _Concerns:_ Social services, family violence, housing, immigration | _Reasoning:_ Rational | _Susceptible to:_ Genuine compassion, specific funding policy

---

**35. Greg Papadopoulos, 57, Oakleigh VIC**
Greek-Australian building contractor. Has done well in the construction boom and is worried it won't last. Employs 12 people and spends a lot of time worrying about award wages and material costs. Votes for whoever will keep the economy growing. Socially conservative.
_Lean:_ Conservative | _Concerns:_ Construction industry, wages, business costs, immigration | _Reasoning:_ Rational | _Susceptible to:_ Economic confidence, business-friendly framing

---

**36. Tanya Gorman, 45, Darwin NT**
Territory government administrator who has navigated the strange political landscape of the NT her whole career. Pragmatic, culturally aware, and deeply frustrated by federal governments who parachute in with solutions for problems they don't understand. Votes for competence.
_Lean:_ Centre | _Concerns:_ Remote services, Indigenous policy, territory funding | _Reasoning:_ Rational | _Susceptible to:_ Demonstrated knowledge of NT-specific issues, practical solutions

---

**37. Oliver Nguyen, 17 turning 18, Doncaster VIC**
About to cast his very first vote. Son of Vietnamese immigrants, studying VCE and stressed about his future. Has formed strong opinions through school debates and social media. Idealistic but can be swayed by whoever sounds most certain. Peer influenced.
_Lean:_ Progressive-leaning | _Concerns:_ Climate, education, housing for his generation | _Reasoning:_ Emotional | _Susceptible to:_ Youth-focused policy, charisma, optimism

---

**38. Ruth Andersen, 62, Mornington Peninsula VIC**
Semi-retired school principal who moved to the Peninsula after 35 years in the system. Progressive on education, more conservative on fiscal matters. Reads widely and thinks for herself. Resents being pandered to and will switch off if a candidate is too slick.
_Lean:_ Centre | _Concerns:_ Education, aged care, environment | _Reasoning:_ Rational | _Susceptible to:_ Substance over style, respectful delivery

---

**39. Steve Nakamura, 35, Sunshine Coast QLD**
Japanese-Australian surf instructor and part-time tradesman. Completely disengaged from politics until the floods hit his street last year. Now paying close attention to climate policy. Easygoing but newly radicalised on one issue. Doesn't trust either side fully yet.
_Lean:_ Swinging | _Concerns:_ Climate, disaster preparedness, cost of living | _Reasoning:_ Emotional | _Susceptible to:_ Climate urgency, personal impact stories

---

**40. Patricia O'Brien, 71, Wagga Wagga NSW**
Retired Catholic primary school teacher. Lives by her faith and her routine. Deeply loyal to the conservative side of politics but will frown at candidates who seem cruel or disrespectful. Cares about community, decency, and children's welfare. Does not respond well to profanity or personal attacks.
_Lean:_ Conservative | _Concerns:_ Religious freedom, education, family values, aged care | _Reasoning:_ Tribal | _Susceptible to:_ Values language, decency framing

---

**41. Isaac Mwangi, 32, Footscray VIC**
Kenyan-Australian electrician who migrated eight years ago and recently got his citizenship. Active in his local Kenyan-Australian community. Proud of the life he has built and wants a government that rewards hard work. Still learning how Australian politics works.
_Lean:_ Swinging | _Concerns:_ Immigration pathways, cost of living, trades recognition | _Reasoning:_ Rational | _Susceptible to:_ Fairness arguments, personal aspiration messaging

---

**42. Sharon Koloamatangi, 40, Mount Druitt NSW**
Samoan-Australian community nurse who grew up in Mount Druitt. Has watched her suburb get both better and worse at the same time. Deeply rooted in her church and community. Votes for whoever will do right by people who don't have a voice.
_Lean:_ Progressive | _Concerns:_ Community health, housing, Pacific Islander community issues | _Reasoning:_ Emotional | _Susceptible to:_ Community-level framing, empathy and dignity appeals

---

**43. Neil Patterson, 54, Toowoomba QLD**
Agricultural equipment dealer in regional Queensland. Business is tied to the fortunes of farmers across the Darling Downs. Politically conservative, practically focused. Has zero tolerance for urban politicians who don't know the difference between a dryland farm and an irrigated one.
_Lean:_ Conservative | _Concerns:_ Agriculture, fuel costs, regional services, water | _Reasoning:_ Rational | _Susceptible to:_ Rural credibility, economic arguments for regional investment

---

**44. Leila Hosseini, 28, Docklands VIC**
Iranian-Australian architecture graduate who came as a student and stayed. Works for a Melbourne firm designing public housing. Passionate about affordable housing design. Grateful to be here but frustrated at how hard it is to build a life without property wealth behind her.
_Lean:_ Progressive | _Concerns:_ Housing, immigration policy, urban planning | _Reasoning:_ Rational | _Susceptible to:_ Housing policy depth, multicultural acknowledgment

---

**45. Murray Blackwood, 60, Kalgoorlie WA**
Gold miner and FIFO veteran who has been doing two weeks on, one week off for 25 years. Earns well but is tired. Thinks the city runs on resources and gets no respect for it. His town has boom-and-bust anxiety baked in and he votes accordingly.
_Lean:_ Conservative | _Concerns:_ Mining industry, FIFO conditions, resources policy | _Reasoning:_ Tribal | _Susceptible to:_ Resources industry respect, anti-green energy sentiment

---

**46. Fiona Castle, 37, Newcastle NSW**
Former coal industry worker who retrained as a solar panel installer after her plant closed. Has lived the energy transition in her own career. Neither angry at coal nor starry-eyed about renewables — just wants it done properly and fairly. Measured and credible.
_Lean:_ Swinging | _Concerns:_ Energy transition, retraining, job security | _Reasoning:_ Rational | _Susceptible to:_ Just transition policy, practical economic detail

---

**47. Tom Delacroix, 26, Newtown NSW**
Queer, French-Australian graphic novelist who has lived in Newtown since he was 18. Very progressive on social issues. Energised by politics but cynical about major parties. Likely to vote Greens but could be swayed by a genuinely progressive independent.
_Lean:_ Progressive / Greens-leaning | _Concerns:_ LGBTQ+ rights, climate, housing, arts funding | _Reasoning:_ Ideological | _Susceptible to:_ Social justice framing, anti-establishment positioning

---

**48. Deborah Yuen, 52, Canberra ACT**
Senior public servant in a federal department. Professionally required to be apolitical, personally quite engaged. Believes in institutional integrity and has deep concerns about politicians who undermine the public service. Votes carefully and privately.
_Lean:_ Centre | _Concerns:_ Governance, accountability, public service integrity | _Reasoning:_ Rational | _Susceptible to:_ Institutional respect, policy coherence

---

**49. Aaron Bullock, 41, Logan QLD**
Correctional officer at a Queensland prison. Sees the cycle of poverty and crime up close every day. Has developed views that don't fit neatly into either camp — tough on crime but sympathetic to why people end up there. Frustrated by politicians who treat crime as a culture war.
_Lean:_ Swinging | _Concerns:_ Law and order, rehabilitation, cost of living | _Reasoning:_ Rational | _Susceptible to:_ Nuanced crime policy, respecting frontline workers

---

**50. Wendy Broadhurst, 67, Victor Harbor SA**
Retired librarian and lifelong reader. Thoughtful, civic-minded, and deeply worried about the quality of public discourse. Cares about democracy itself as much as any single policy. Will penalise candidates who lie, dodge questions, or are rude to each other.
_Lean:_ Centre-progressive | _Concerns:_ Education, democracy, media literacy, aged care | _Reasoning:_ Rational | _Susceptible to:_ Intellectual honesty, respectful debate conduct

---

**51. Danny Ruiz, 24, Bankstown NSW**
Chilean-Australian apprentice plumber in his second year. Earning decent money for the first time in his life and is starting to care about tax. His family are Labor loyalists but he's not so sure anymore. Easy to impress with confidence and direct talk.
_Lean:_ Swinging | _Concerns:_ Wages, trades, cost of living, taxes | _Reasoning:_ Populist | _Susceptible to:_ Charisma, confident delivery, anti-tax rhetoric

---

**52. Heather Moss, 48, Bendigo VIC**
Community pharmacist who has owned her shop for 15 years and is fighting against the big chains. Involved in local council. Pragmatic centrist who decides each election on the policy mix. Has no party loyalty — just wants workable solutions.
_Lean:_ Centre | _Concerns:_ Small business, healthcare, local community | _Reasoning:_ Rational | _Susceptible to:_ Practical policy, local community investment

---

**53. Doug Mercer, 73, Port Augusta SA**
Former steelworker, union man his whole life. Grew up in a Labor household and has never once wavered. Distrustful of corporations and the wealthy. Still sharp, still angry about what happened to Australian manufacturing. Hard to move — but responds to genuine working-class solidarity.
_Lean:_ Progressive (tribal Labor) | _Concerns:_ Manufacturing, unions, cost of living, aged care | _Reasoning:_ Tribal | _Susceptible to:_ Working-class solidarity language, anti-corporate rhetoric

---

**54. Anita Sharma, 31, Parramatta NSW**
Indian-Australian secondary school teacher who migrated from Mumbai five years ago. Still navigating the visa-to-citizenship process. Focused on education, fair wages for teachers, and a pathway to permanency. Politically engaged but feels like an outsider to Australian political culture.
_Lean:_ Progressive | _Concerns:_ Teacher pay, immigration pathways, housing | _Reasoning:_ Rational | _Susceptible to:_ Education policy depth, immigration fairness

---

**55. Carl Briggs, 50, Tamworth NSW**
Country music venue owner and local personality. Gregarious and opinionated. Lives and dies by tourism and events funding. Feels the regions get tokenised every election cycle but never delivered for. Will vote for whoever seems less full of it.
_Lean:_ Swinging | _Concerns:_ Arts and entertainment, regional tourism, small business | _Reasoning:_ Populist | _Susceptible to:_ Regional acknowledgment, blunt authenticity

---

**56. Susan Fitzgibbon, 43, Hobart TAS**
Marine ecologist at UTAS. Spends half her time in the field and half fighting for research funding. Clear-eyed about environmental decline and angry about the pace of policy response. Calm in argument but deeply committed. Will fact-check candidates in her head in real time.
_Lean:_ Progressive | _Concerns:_ Climate, marine environment, science funding | _Reasoning:_ Rational | _Susceptible to:_ Evidence-based argument, policy specificity

---

**57. Robyn Deng, 56, Coffs Harbour NSW**
Second-generation Chinese-Australian who has run a real estate agency in Coffs Harbour for 20 years. Owns three investment properties and is not embarrassed about it. Believes in hard work and property as wealth creation. Doesn't see herself as selfish — sees herself as responsible.
_Lean:_ Conservative | _Concerns:_ Property rights, negative gearing, business confidence | _Reasoning:_ Rational | _Susceptible to:_ Economic confidence, property protection framing

---

**58. James Okafor, 36, Blacktown NSW**
Nigerian-Australian IT support worker who moonlights as a Pentecostal church music director. Family-focused and faith-driven. Concerned about moral decline and the cost of raising children. Doesn't follow political parties but responds to strong values language.
_Lean:_ Conservative-leaning | _Concerns:_ Family values, cost of living, religious expression | _Reasoning:_ Emotional | _Susceptible to:_ Faith and family framing, community values appeals

---

**59. Penny Albrecht, 29, Margaret River WA**
German-Australian winemaker who moved to Margaret River for a vintage job five years ago and stayed. Progressive on climate because she's watched drought affect her region. Socially liberal. Will engage seriously with policy but also values authenticity and warmth.
_Lean:_ Progressive | _Concerns:_ Climate, agriculture, environment | _Reasoning:_ Rational / emotional | _Susceptible to:_ Genuine warmth, climate policy, regional acknowledgment

---

**60. Frank Delosa, 70, Leichhardt NSW**
Retired Italian-Australian postman and lifelong Labor voter. Has watched his old suburb gentrify beyond recognition. Feels left behind by a party he no longer recognises. Genuinely torn for the first time in his life. Still responds to old Labor language.
_Lean:_ Swinging (drifting from Labor) | _Concerns:_ Cost of living, community character, aged care | _Reasoning:_ Emotional / tribal | _Susceptible to:_ Working-class language, community identity appeals

---

**61. Grace Muir, 5, Perth WA**
Nursing student in her second year at Curtin University. Working two casual jobs to pay rent. Voted for the first time last election and felt like it mattered. Tired, stressed, and wants a candidate who will make her life less hard. Not ideological — just practical.
_Lean:_ Swinging | _Concerns:_ Cost of living, healthcare, student support | _Reasoning:_ Emotional | _Susceptible to:_ Practical cost-of-living relief, healthcare investment

---

**62. Kev Thompson, 58, Bundaberg QLD**
Sugarcane farmer who has survived two cyclones and a drought. Deeply conservative but holds nuanced views on climate because he's lived it. Mistrustful of government intervention but not ideologically opposed to help when times are genuinely bad. Laconic and direct.
_Lean:_ Conservative | _Concerns:_ Agriculture, disaster relief, water, climate adaptation | _Reasoning:_ Rational | _Susceptible to:_ Practical climate adaptation (not mitigation), respect for farmers

---

**63. Miriam Gold, 66, St Kilda VIC**
Jewish-Australian retired social worker and lifelong progressive voter. Grew up in a politically engaged household and has been at protests since the 1970s. Cares intensely about inequality, human rights, and the welfare state. Impatient with centrism.
_Lean:_ Progressive | _Concerns:_ Welfare, inequality, human rights, aged care | _Reasoning:_ Ideological | _Susceptible to:_ Inequality framing, progressive values language

---

**64. Ben Sato, 27, Adelaide SA**
Japanese-Australian café owner who opened his first place at 24 with a bank loan and his parents' help. Obsessively focused on his business surviving. Doesn't have time for ideology. Votes for whoever will keep costs down and customers coming in.
_Lean:_ Centre | _Concerns:_ Small business costs, interest rates, consumer spending | _Reasoning:_ Rational | _Susceptible to:_ Economic stability, small business concessions

---

**65. Colleen Nguyen, 55, Inala QLD**
Vietnamese-Australian aged care worker who has been in the sector for 25 years. Has watched the system deteriorate and her colleagues leave in despair. Deeply compassionate and deeply tired. Wants the candidates to acknowledge what's actually happening in aged care.
_Lean:_ Progressive | _Concerns:_ Aged care, worker wages, immigration, cost of living | _Reasoning:_ Emotional | _Susceptible to:_ Aged care policy specifics, acknowledgment of frontline workers

---

**66. Andrew Payne, 62, Manly NSW**
Retired investment banker, still sharp and wealthy. Reads the AFR cover to cover. Votes conservative by default but is increasingly concerned about climate and intergenerational fairness for his grandchildren. Has the discipline to follow a complex policy argument.
_Lean:_ Centre-right | _Concerns:_ Fiscal policy, climate (long-term), superannuation | _Reasoning:_ Rational | _Susceptible to:_ Economic rigour, long-term thinking, data

---

**67. Destiny Williams, 23, Redfern NSW**
Aboriginal Australian university student studying social work at UTS. Politically active, angry about injustice, and deeply sceptical of mainstream political promises to Indigenous communities. Will listen carefully for whether candidates actually understand history or are just performing.
_Lean:_ Progressive | _Concerns:_ Indigenous rights, housing, social work funding, treaty | _Reasoning:_ Rational / emotional | _Susceptible to:_ Specificity on Indigenous policy, genuine acknowledgment over tokenism

---

Voter profiles are shown to both players during the Character Reveal phase. The 5 randomly selected for a given game are displayed in full; the remaining 46 are not shown.

---

## 8. Debate Topics

Topics are randomly selected from a predefined pool at the start of each game. Each of the 2 rounds draws a different topic from the pool (no repeats within a session).

### Topic Design Rules

- Topics must be understandable and debatable by ordinary Australians with no specialist knowledge.
- Topics should be contentious enough that both sides have legitimate arguments.
- Topics should be relevant to Australia.

### Predefined Topic Pool (minimum 20)

1. Should Australia raise the minimum wage to $28/hour?
2. Should public transport in Australian cities be made free?
3. Should Australia ban new coal and gas projects?
4. Should the school leaving age be raised to 18?
5. Should Australia become a republic and remove the King as head of state?
6. Should negative gearing on investment properties be abolished?
7. Should Australia introduce a sugar tax on soft drinks?
8. Should all Australians be required to vote (compulsory voting) — or should it become optional?
9. Should Australia increase its annual refugee and humanitarian intake?
10. Should the retirement age be raised to 70?
11. Should mobile phones be banned in Australian high schools?
12. Should Australia legalise recreational cannabis?
13. Should private school funding from the government be reduced?
14. Should Australia introduce a four-day working week?
15. Should speed cameras be placed on every major road in Australia?
16. Should the ABC (Australian Broadcasting Corporation) be privatised?
17. Should Australia introduce a universal basic income?
18. Should first home buyers receive a $50,000 government grant?
19. Should Australia increase defence spending significantly?
20. Should Australia extend its social media age ban from under-16s to under-18s?
5. Should water usage rights be restructured to prioritise environmental flows?
22. Should Australia fast-track nuclear energy?
23. Should religious exemptions in anti-discrimination law be removed?
24. Should Australia introduce a wealth tax on billionaires?

---

## 9. AI Voter Simulation

### 9.1 Engine

- **Primary:** Gemini 3.1 Flash API
- **Fallback:** Perplexity API (triggered automatically if Gemini returns an error or times out)

### 9.2 When the LLM is Called

The Gemini API is called **at the end of every round**, with the cumulative transcript up to that point. This means:

- **After Round 1:** transcript from Round 1 only is sent → returns interim voter standings
- **After Round 2:** transcript from both rounds is sent → returns the **final, definitive** vote result

The last call's result is what determines the winner. The interim result after Round 1 is used only to show a "current standings" teaser to players between rounds.

### 9.3 Single API Call Per Round

Each call is a single prompt containing:

- All transcripts so far (labelled by round, speaker, with objection markers and timestamps)
- Both candidate bios
- All 5 voter profiles in full
- The debate topics covered so far
- An instruction to return a single JSON object with an entry for each voter

### 9.4 Prompt Instruction

> "Below are the profiles of 5 Australian voters and the transcript(s) of a political debate between two candidates so far. For each voter, imagine you are that specific person — with their background, biases, values, and reasoning style. Decide which candidate they would currently vote for based on everything debated so far.
>
> **Important:** Not every voter will make a rational, policy-based decision. Many real people vote on gut feel, emotion, personal impressions, or tribal loyalty rather than logical argument. A retiree might vote for whoever seems kinder even if their policy is weaker. A young voter might be swayed by a candidate's confidence or energy rather than what they actually said. Someone who feels talked down to might vote against a candidate purely out of spite. A voter with strong tribal loyalty may not be moveable at all regardless of argument quality. For each voter, stay true to their specific background, personality, and susceptibility as described — do not default to rational policy analysis for everyone. Some voters should absolutely be swayed by emotional appeals, populist rhetoric, personal attacks, or charisma over substance, if that fits who they are.
>
> Return ONLY a valid JSON object in this exact format, with no additional text:
> `{ "voter_1": { "name": "...", "vote": "Candidate A" | "Candidate B", "reason": "1–2 sentences in that voter's own voice" }, "voter_2": { ... }, ... "voter_5": { ... } }`"

### 9.5 Vote Tallying

- The JSON response is parsed on the backend and the results are broadcast to both clients via Socket.io.
- After Round 1, interim standings are surfaced to players as a brief "where things stand" screen before Round 2 begins.
- After Round 2, the final JSON is the authoritative result. All 5 voters must cast a vote — with an odd number of voters a tie is impossible, so there is always a definitive winner.

### 9.5 Debate Moderator

- The moderator is a **game character only** — not an AI agent.
- At the start of each round, the moderator character "reads out" the pre-selected topic from the pool (see Section 8). This is purely a UI presentation: the topic text is displayed on screen with the moderator's name/avatar attached.
- The moderator has no ability to generate contextual follow-ups or interject mid-debate. Their only role is delivering the round topic.

---

## 10. Technical Architecture

### 10.1 Frontend — Next.js

**Pages / Routes**

| Route             | Description                               |
| ----------------- | ----------------------------------------- |
| `/`               | Landing — Create Game / Join Game         |
| `/lobby/[code]`   | Waiting room, shows players connected     |
| `/reveal/[code]`  | Character + voter reveal (30 s read time) |
| `/debate/[code]`  | Live debate arena                         |
| `/results/[code]` | Vote reveal + winner announcement         |

**Key Frontend Components**

- `GameCodeInput` — Enter/display 6-char alphanumeric game code
- `CandidateCard` — Displays full candidate bio
- `VoterGrid` — 5 voter profile cards (scrollable)
- `TopicBanner` — Animates in the round topic + 10 s countdown
- `DebateArena` — Live floor indicator, objection button, timers, live transcript feed
- `TimerBar` — Per-player countdown bar with colour states
- `VoteReveal` — Animated vote tally reveal (Jackbox-style, one vote at a time)

### 10.2 Backend — Express.js

**REST Endpoints**

| Method | Path                    | Description                                              |
| ------ | ----------------------- | -------------------------------------------------------- |
| POST   | `/api/game/create`      | Creates a new game session, returns code                 |
| POST   | `/api/game/join`        | Validates code, assigns Player 2 slot                    |
| GET    | `/api/game/:code`       | Returns full game state                                  |
| POST   | `/api/game/:code/start` | Host triggers game start, generates profiles             |
| POST   | `/api/transcribe`       | Receives audio chunk, returns Whisper transcript segment |
| POST   | `/api/vote`             | Triggers AI voter simulation, returns all 5 votes       |

**Socket.io Events**

| Event               | Direction | Payload                          | Description                    |
| ------------------- | --------- | -------------------------------- | ------------------------------ |
| `player:joined`     | S→C       | `{ playerId, name }`             | Notifies lobby of new player   |
| `game:start`        | S→C       | `{ candidates, voters, topics }` | Pushes generated game data     |
| `round:start`       | S→C       | `{ roundNumber, topic }`         | Begins the topic reveal phase  |
| `round:prep`        | S→C       | `{ countdown: 10 }`              | Starts 10 s prep timer         |
| `round:debate`      | S→C       | `{ activePlayer }`               | Floor opens                    |
| `floor:change`      | S→C       | `{ activePlayer, reason }`       | Floor passed/yielded/objection |
| `objection:raised`  | C→S       | `{ byPlayer }`                   | Player fires objection         |
| `timer:update`      | S→C       | `{ p1remaining, p2remaining }`   | Tick (every 500 ms)            |
| `transcript:update` | S→C       | `{ speaker, text, timestamp }`   | Live transcript segment        |
| `round:end`         | S→C       | `{ roundNumber }`                | Round finishes                 |
| `voting:start`      | S→C       | `{}`                             | AI voting begins               |
| `vote:cast`         | S→C       | `{ voterName, vote, reason }`    | Stream individual vote results |
| `game:result`       | S→C       | `{ winner, tally, breakdown }`   | Final result                   |

### 10.3 Database — Supabase

**Tables**

```
games
  id            uuid PK
  code          text UNIQUE
  status        enum (lobby, reveal, debate, voting, complete)
  host_id       uuid
  created_at    timestamptz

players
  id            uuid PK
  game_id       uuid FK → games.id
  slot          int (1 or 2)
  candidate     jsonb   -- full candidate profile
  socket_id     text

voters
  id            uuid PK
  game_id       uuid FK → games.id
  profile       jsonb   -- full voter profile
  vote          text    -- null until voting phase
  vote_reason   text

rounds
  id            uuid PK
  game_id       uuid FK → games.id
  round_number  int
  topic         text
  transcript    jsonb   -- array of { speaker, text, timestamp }
```

### 10.4 Audio & Transcription — Groq Whisper

- **Model:** `whisper-large-v3-turbo` via Groq API
- While a player holds the floor, the browser records their microphone audio continuously using the Web Audio API / MediaRecorder and **saves it in memory as a single audio blob**.
- A **turn** is one uninterrupted period of a player speaking — beginning when they take the floor and ending the moment they are objected to, their time runs out, or the round ends. Each turn produces exactly one audio blob.
- The blob is POSTed to `/api/transcribe` on the Express backend only when the turn ends, which forwards it to Groq `whisper-large-v3-turbo` and returns the full transcript for that turn.
- The returned segment is labelled with speaker identity and appended to the round's running transcript held in server-side game state in memory.
- The transcript updates between turns as each segment resolves — there is no live mid-speech transcription.
- The complete transcript across both rounds lives in in-memory game state and is passed to Gemini at the end of each round.

---

## 11. Visual Design Language — Jackbox-Themed

This game is explicitly Jackbox-themed in its visual identity. The aesthetic, pacing, and presentation should feel like a Jackbox Party Pack title: loud, colourful, personality-driven, and immediately fun without any tutorial needed. Every screen should feel like it belongs in a party game, not a civics lesson.

### Aesthetic Principles

- **Bold and punchy.** Large fonts, high contrast, lots of colour.
- **Energetic but legible.** Animations should feel snappy, not distracting.
- **Playful formality.** The game is about politics, so borrow visual language from news and debate shows — but exaggerate and caricature it.

---

## 12. Error Handling & Edge Cases

| Scenario                                 | Handling                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Gemini API error                         | Automatically retry once, then fall back to Perplexity API                    |
| Player disconnects mid-debate            | Socket reconnect window of 15 s; after that, the other player wins by default |
| Microphone permission denied             | Warn on lobby screen; player cannot start debate without mic                  |
| Whisper transcription failure            | Retry chunk; if persistent, log "inaudible" segment and continue              |
| Both players exhaust time simultaneously | Round ends, next round begins                                                 |
| Objection with ≤ 15 s remaining          | Button disabled; frontend enforces this, backend validates                    |
| Gemini API error                         | Automatically retry once, then fall back to Perplexity API                    |
| Game code collision                      | Regenerate until unique                                                       |

---

## 13. Accessibility & Performance

- Microphone access is permission-gated and explained clearly.
- Game state is server-authoritative; clients are thin (no client-side timer drift).
- All timers run server-side; the server broadcasts ticks to both clients every 500 ms to keep parity.
- Audio is recorded client-side and sent to Groq Whisper only when a speaking turn ends (objection or time exhausted), keeping network usage minimal and avoiding any mid-speech API overhead.
- The single Gemini voter call is made at the end of the debate with the full assembled transcript; target resolution time is < 15 seconds.

---

## 14. Out of Scope (v1)

- Account system / authentication (games are anonymous / session-based)
- Persistent player history or stats
- Spectator mode
- Custom candidate creation by players
- Mobile app (responsive web only)
- Moderation or content filtering beyond basic prompt-level instructions
- Localisation outside Australian English

---

## 15. Open Questions

| #   | Question                                                                                                                        | Owner       |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Should the "where things stand" interim standings screen between rounds show individual voter reasons, or just the tally count? | Product     |
| 2   | Should the objection gavel/buzzer sound be different depending on which player objects?                                         | Design      |
| 3   | Should the random 5 voter selection be seeded per game code (reproducible) or fully random each session?                       | Engineering |

---

## 16. Milestones

| Milestone          | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| M1 — Skeleton      | Lobby, game code, Socket.io connection, Supabase schema    |
| M2 — Profiles      | Candidate + voter generation, character reveal screen      |
| M3 — Debate Engine | Live floor management, objection logic, server-side timers |
| M4 — Transcription | Groq Whisper integration, live transcript feed             |
| M5 — AI Voting     | Gemini/Perplexity voter simulation, vote reveal screen     |
| M6 — Polish        | Jackbox-style animations, sound design, error handling, QA |
