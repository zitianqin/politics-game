# 1v1 Australian Politics Debate Game - Implementation Tickets

This document tracks all implementation tickets, details, specs, and parallelisation strategies for the 1v1 Australian Politics Debate Game, as outlined in the PRD v1.0.

## Epic 1: Skeleton & Infrastructure (Milestone 1)

**[TICKET-1.1] Database Schema Setup (Supabase)**
**Dependencies:** None
**Assignee:** Backend
**Details:**
Set up the Supabase database with the following structure:

- **`games` table**:
  - `id` (uuid PK)
  - `code` (text UNIQUE)
  - `status` (enum: lobby, reveal, debate, voting, complete)
  - `host_id` (uuid)
  - `created_at` (timestamptz)
- **`players` table**:
  - `id` (uuid PK)
  - `game_id` (uuid FK → games.id)
  - `slot` (int 1 or 2)
  - `candidate` (jsonb) – Full generated candidate profile
  - `socket_id` (text)
- **`voters` table**:
  - `id` (uuid PK)
  - `game_id` (uuid FK → games.id)
  - `profile` (jsonb) – Full generated voter profile
  - `vote` (text) – null until voting phase
  - `vote_reason` (text)
- **`rounds` table**:
  - `id` (uuid PK)
  - `game_id` (uuid FK → games.id)
  - `round_number` (int)
  - `topic` (text)
  - `transcript` (jsonb) – Array of { speaker, text, timestamp }

**[TICKET-1.2] Core Server & REST Endpoints Setup**
**Dependencies:** None
**Assignee:** Backend
**Details:**
Set up the Express.js server and primary REST structure.

- **POST `/api/game/create`**: Creates a new game session. Generates a unique 6-character alphanumeric game code. Handles collisions by regenerating until unique. Sets game status to `lobby` and assigns Host slot. Returns game code.
- **POST `/api/game/join`**: Validates the 6-character code. Assigns Player 2 slot.
- **GET `/api/game/:code`**: Returns the full game state.
- **Server State**: Initialize an in-memory game state object to store running game states before syncing out to Supabase. This will handle active socket connections, timer variables, active speaking floor flags, accumulated arrays of transcript blobs, and candidate/voter in-memory structures.

**[TICKET-1.3] Core WebSocket & Lobby Architecture**
**Dependencies:** TICKET-1.2
**Assignee:** Fullstack
**Details:**
Setup Socket.io for bidirectional events between Next.js and Express.js.

- **Frontend**: Pages `/`, `/lobby/[code]`. Component `GameCodeInput` (receives and displays the 6-char alphanumeric code).
- **Socket Event Handling**: Implement `player:joined` (S→C) to broadcast `{ playerId, name }`.
- **Client Side Validation**: Add Lobby waiting room visual. Warn users on the lobby screen if microphone permission is denied; block debate start without mic.
- **Disconnect Edge Case**: Support a socket reconnect window of 15s. If a player fails to reconnect mid-debate within 15s, forfeit the game to the opponent.

---

## Epic 2: Character & Match Generation (Milestone 2)

**[TICKET-2.1] Procedural Candidate Generation Engine**
**Dependencies:** None
**Assignee:** Backend
**Details:**
Build a procedural generation service for candidate profiles at session start, held in in-memory state. Ensure candidates are balanced with no objectively dominant background.

- **Fields required**:
  - Procedural Australian name
  - Age (35-70)
  - Party name (e.g. The Common Ground Party)
  - Real Australian electorate
  - Background (2-3 sentences)
  - Profession
  - Key actions (2 positive, 1 negative/controversial)
  - Policy positions (3 positions drawn from debate topics pool)
  - Personal values
  - Flaws (e.g. tax scandal, gaffe)

**[TICKET-2.2] Voter Profile Selection System**
**Dependencies:** None
**Assignee:** Backend
**Details:**
Implement the 67-profile static voter pool defined in the PRD as immutable data.

- During game start, randomly draw 5 distinct voter profiles (or seed it per game code if decided).
- Output structure per voter: Name, Age, Location, Occupation, Background blurb, Political lean, Key concerns, Reasoning style, Susceptibility.
- This creates an automatic ~50/50 starting split in an un-persuaded state.

**[TICKET-2.3] Pre-Debate Topic Pool Engine**
**Dependencies:** None
**Assignee:** Backend
**Details:**
Store the 24 pre-defined debate topics. Implement a topic selector that randomly picks two non-repeating topics from the pool for Round 1 and Round 2 upon game start.

**[TICKET-2.4] The Reveal Phase UI (Frontend)**
**Dependencies:** TICKET-2.1, TICKET-2.2, TICKET-2.3, TICKET-1.3
**Assignee:** Frontend
**Details:**

- Implement `/api/game/:code/start` (Host triggers game start, initiates generation of 2 candidates, 5 voters, 2 topics). Push `game:start` socket event `{ candidates, voters, topics }`.
- Route: `/reveal/[code]`
- Build `CandidateCard` component to show the player's own and the opponent's full candidate bio.
- Build `VoterGrid` component to display the 5 randomly selected active voters out of 67. The remaining 46 are strictly excluded.
- Transition timer: Give players exactly 30 seconds reading time.

---

## Epic 3: Debate Engine & Timers (Milestone 3)

**[TICKET-3.1] Round Coordination flow (Backend)**
**Dependencies:** Epic 2
**Assignee:** Backend
**Details:**
Manage round transitions sequentially. Note speaking order: P1 starts Round 1. P2 starts Round 2.

- Broadcast `round:start` `{ roundNumber, topic }`.
- Broadcast `round:prep` `{ countdown: 10 }`.
- Broadcast `round:debate` `{ activePlayer }` opening the floor.

**[TICKET-3.2] Debate Arena & Topic Banner UI**
**Dependencies:** Epic 2
**Assignee:** Frontend
**Details:**

- Route: `/debate/[code]`
- Build `TopicBanner` to animate the moderator character displaying the round's topic. Include the 10-second read/prep countdown timer element.
- The moderator only reads the topic; no interruptions or LLM features.

**[TICKET-3.3] Server-Side Live Timers & Floor State**
**Dependencies:** TICKET-3.1
**Assignee:** Backend
**Details:**
Build server-authoritative timer manager.

- Time pool: Each player gets exactly 60 seconds of speaking time per round.
- Timer state ticks down for the active floor holder only.
- Broadcast `timer:update` `{ p1remaining, p2remaining }` every 500 ms via Socket.io to sync clients.
- If a timer hits 0, trigger automatic floor pass to opponent. If both hit 0, trigger round end (`round:end` `{ roundNumber }`).
- Allow voluntary floor yielding logic.

**[TICKET-3.4] "Objection" Mechanic Backend & Validation**
**Dependencies:** TICKET-3.3
**Assignee:** Backend
**Details:**

- Listen for `objection:raised` `{ byPlayer }` event.
- **Rules evaluation**:
  - Was the opponent speaking?
  - Does the objector have > 15s remaining? If ≤ 15s, reject the objection.
- **Effect**: Deduct exactly 15s from objector immediately. Halt opponent timer. Start objector timer.
- Broadcast `floor:change` `{ activePlayer, reason: 'objection' }`.

**[TICKET-3.5] "Objection" Mechanic UI & Arena Elements**
**Dependencies:** TICKET-3.2
**Assignee:** Frontend
**Details:**

- Build `TimerBar`: per-player visual countdown that changes colour (Green -> Amber < 20s -> Red < 10s).
- Disable Objection button automatically if player has ≤ 15 seconds.
- Objection Visuals: Display an aggressive "OBJECTION!" slam graphic, play gavel/buzzer SFX, flash the objector's podium panel red, dim the opponent's panel, execute screen shake animation.

---

## Epic 4: Audio Capture & Transcription (Milestone 4)

**[TICKET-4.1] Client-Side Audio Recording**
**Dependencies:** TICKET-3.3
**Assignee:** Frontend
**Details:**

- Use Web Audio API & MediaRecorder.
- Begin capturing microphone when player takes the floor. Stop capturing instantly when floor is lost (time expiry, round end, opponent objection, or voluntary yield).
- Audio must be stored in memory as a single audio blob corresponding precisely to the speaking turn.
- Immediately after turn stops, upload blob to `/api/transcribe`.

**[TICKET-4.2] Groq Whisper Integration**
**Dependencies:** TICKET-4.1
**Assignee:** Backend
**Details:**

- POST endpoint `/api/transcribe` taking the audio blob.
- Connect to Groq API using the `whisper-large-v3-turbo` model.
- Parse text response. Label the transcript block with the speaker, accurate timestamps, and any objection markers representing the end of a turn.
- Catch Whisper errors (inaudible/failure) -> Output fallback logging and retry chunk. If persistent, log as "inaudible segment" and proceed.
- Push the resolved segment event `transcript:update` `{ speaker, text, timestamp }` to clients. Accumulate transcripts chronologically in round state.

**[TICKET-4.3] Live Transcript UI**
**Dependencies:** TICKET-4.2
**Assignee:** Frontend
**Details:**

- Display the running transcript stream on the Debate Arena. Populate as `transcript:update` chunks return from the API.

---

## Epic 5: LLM Voter Simulation (Milestone 5)

**[TICKET-5.1] AI Agent Execution System**
**Dependencies:** Epic 4
**Assignee:** Backend
**Details:**

- Implement the LLM engine calls after rounds manually exhaust.
- Core logic: Trigger `voting:start` `{}`. Wait for transcript API calls to settle.
- Construct the system prompt using the strict string provided in PRD Sec 9.4. Ensure instructions include simulating irrationality, emotional leaning, logic vs gut, etc.
- Payload inclusions: Total accumulated transcript (all rounds so far), all 5 active voters, both candidates, topics discussed.
- JSON enforcement string. Only parse the JSON map of 5 voter key-values returning: `{ vote, reason }`.

**[TICKET-5.2] Provider Redundancy & Tally Calculation**
**Dependencies:** TICKET-5.1
**Assignee:** Backend
**Details:**

- Primary LLM: Gemini 3.1 Flash. Wrap in a try-catch timeout of 15 seconds. Ensure auto-retry (limit 1 retry).
- Fallback LLM: Perplexity API. Execute strictly only if Gemini fails twice or breaks JSON scheme fatally.
- Calculate tallies. Check if all 5 voters returned a value. Reconstruct final breakdown.
- Send results out via `vote:cast` for singular stream effects, and `game:result` `{ winner, tally, breakdown }` for whole.

**[TICKET-5.3] Voting Phases: Round 1 Interim vs Round 2 Final**
**Dependencies:** TICKET-5.1
**Assignee:** Backend
**Details:**

- If Round 1 completes: Fire the call using only Round 1 transcripts. Emit result to clients as an "interim standing" holding screen before Round 2 Prep begins. Do NOT store this to Supabase.
- If Round 2 completes: Fire the call using Round 1 + Round 2 transcripts. Emit the final `.game:result` call, declare a winner definitively (with odd numbers meaning no ties), and sync the full state/output to Supabase tables.

**[TICKET-5.4] Results UI & Tally Animation**
**Dependencies:** TICKET-5.3
**Assignee:** Frontend
**Details:**

- Route: `/results/[code]`.
- Build the `VoteReveal` component to slowly animate the vote tally one-by-one, mimicking a Jackbox-style drama sequence.
- Include voter's 1-2 sentence rationales on screen where space allows (maybe cycle through a few key responses).
- Show "Where Things Stand" simplified screen after Round 1.

---

## Epic 6: Visuals, QA, and Polish (Milestone 6)

**[TICKET-6.1] The "Jackbox Mode" Styling System**
**Dependencies:** None (Parallelizable UX task)
**Assignee:** Frontend / Design
**Details:**

- Follow PRD Sec 11 styling rules.
- High saturation colors, large bold fonts, distinct caricature or high-impact aesthetics. Newsroom debate presentation logic but exaggerated.
- Implement CSS animations for screen transitions, text pop-ins. Must NOT look like standard SaaS.
- Responsive design purely for desktop/landscape formats (No mobile support needed for v1 per non-goals).

**[TICKET-6.2] End-to-End Game Simulation / Testing**
**Dependencies:** All Epics
**Assignee:** Fullstack QA
**Details:**

- Trigger dual client windows. Generate code.
- Simulate microphone cutoff limits, 60s hard expirations, multiple rapid objections. Follow full pipeline to see if Gemini parses multiple disjointed transcript chunks effectively.
- Verify socket ID cleanup and lobby stability.

---

---

## Work Order & Concurrent Execution Strategy

To ensure rapid delivery, tasks have been split to allow concurrent execution by a Fullstack or Frontend/Backend pair.

**Concurrent Group A (Database & Frontend Skeletons)**
**Can be worked on from Day 1**

- Backend: **TICKET-1.1** (Supabase) -> **TICKET-2.1** (Candidate Gen) -> **TICKET-2.2** (Voter Pool)
- Frontend: **TICKET-6.1** (UX System Setup & CSS Tooling) -> **TICKET-1.3** / **TICKET-2.4** (Lobby Page & Reveal UIs)

**Concurrent Group B (The Debate API)**
**Depends on Skeletons. Backend builds state; Frontend builds mics.**

- Backend: **TICKET-1.2** & **TICKET-3.3** (Socket Timer loops and State Machines). **TICKET-3.1** & **TICKET-3.4** (Objection logic).
- Frontend: **TICKET-4.1** (MediaRecorder capturing turns) -> **TICKET-3.2** & **TICKET-3.5** (Debate Arena layouts and objection styling).

**Concurrent Group C (The Deep Integrations)**
**Depends on Debate API. Both sides wrap up external LLMs.**

- Backend: **TICKET-4.2** (Groq Whisper hookup). **TICKET-5.1** & **TICKET-5.2** (Gemini/Perplexity Logic). **TICKET-5.3** (Voting states).
- Frontend: **TICKET-4.3** (Live Transcript mapping) -> **TICKET-5.4** (Results sequence).

### Top-to-Bottom Critical Path:

1. DB & Socket Skeleton (1.1, 1.2, 1.3)
2. Character/Voter Core generation (2.1 to 2.4)
3. The Timer Loop & Socket State syncs (3.1 to 3.5)
4. Audio chunking to Whisper (4.1 to 4.3)
5. Gemini payload construction & API resilience (5.1 to 5.4)
6. Jackbox UI polish & E2E Testing (6.1, 6.2)
