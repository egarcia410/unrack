let _audioCtx: AudioContext | null = null;

export function getAudioCtx(): AudioContext {
  if (!_audioCtx)
    _audioCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

export function playTimerDone(): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const play = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.5, now + start);
      g.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now + start);
      o.stop(now + start + dur);
    };
    play(880, 0, 0.18);
    play(1175, 0.15, 0.25);
    play(1760, 0.35, 0.3);
  } catch (e) {
    console.log("audio err", e);
  }
}
