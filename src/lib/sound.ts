/**
 * Plays a short two-note chime with the Web Audio API (no audio files).
 * Only called when the user has enabled session sounds in Settings.
 */
export function playChime(): void {
  try {
    const context = new AudioContext()
    const notes = [880, 1318.5]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const start = context.currentTime + index * 0.18
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.65)
    })
    setTimeout(() => void context.close(), 1200)
  } catch {
    // Audio is optional; ignore environments where it is unavailable.
  }
}
