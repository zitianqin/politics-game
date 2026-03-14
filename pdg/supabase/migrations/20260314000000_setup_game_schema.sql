-- Create the game status enum
CREATE TYPE game_status AS ENUM ('lobby', 'reveal', 'debate', 'voting', 'complete');

-- Create the games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    status game_status NOT NULL DEFAULT 'lobby',
    host_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    slot INT CHECK (slot IN (1, 2)),
    candidate JSONB,
    socket_id TEXT,
    UNIQUE(game_id, slot)
);

-- Create the voters table
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    profile JSONB NOT NULL,
    vote TEXT,
    vote_reason TEXT
);

-- Create the rounds table
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    topic TEXT,
    transcript JSONB DEFAULT '[]'::jsonb
);
