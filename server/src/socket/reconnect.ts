const reconnectTimers = new Map<string, NodeJS.Timeout>();

export function startReconnectTimer(
  playerId: string,
  gameCode: string,
  windowMs: number,
  onExpiry: () => void
): void {
  const key = `${gameCode}:${playerId}`;

  const existing = reconnectTimers.get(key);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    reconnectTimers.delete(key);
    onExpiry();
  }, windowMs);

  reconnectTimers.set(key, timer);
  console.log(
    `Reconnect timer started for player ${playerId} in game ${gameCode} (${windowMs}ms)`
  );
}

export function cancelReconnectTimer(playerId: string): boolean {
  for (const [key, timer] of reconnectTimers.entries()) {
    if (key.endsWith(`:${playerId}`)) {
      clearTimeout(timer);
      reconnectTimers.delete(key);
      console.log(`Reconnect timer cancelled for player ${playerId}`);
      return true;
    }
  }
  return false;
}
