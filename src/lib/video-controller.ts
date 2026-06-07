// Simple module-level registry so only one video plays at a time across the page
const players = new Map<string, () => void>();
let activeId: string | null = null;

export function registerVideoPlayer(id: string, pauseFn: () => void) {
  players.set(id, pauseFn);
}

export function unregisterVideoPlayer(id: string) {
  players.delete(id);
  if (activeId === id) activeId = null;
}

export function requestVideoPlay(id: string) {
  if (activeId && activeId !== id) {
    const pause = players.get(activeId);
    if (pause) pause();
  }
  activeId = id;
}

export function notifyVideoStopped(id: string) {
  if (activeId === id) activeId = null;
}
