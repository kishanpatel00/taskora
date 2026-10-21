import lottie from 'lottie-web/build/player/lottie_light'
import logoAnimation from '@/assets/taskora-logo.lottie.json'

/** How long the finished logo stays visible when motion is reduced (no animation is played). */
const REDUCED_MOTION_HOLD_MS = 700
/** Safety net: the splash never blocks the app longer than this, even if the animation stalls. */
const MAX_SPLASH_MS = 6000
const FADE_MS = 320

type Color = [number, number, number, number]

/** The logo's flat colors, as stored in the Lottie file (0–1 RGBA). */
const WORDMARK_BLUE: Color = [0.118, 0.298, 0.729, 1]
const TAGLINE_GRAY: Color = [0.431, 0.475, 0.541, 1]
/** Lighter equivalents so the wordmark and tagline stay readable on the dark splash. */
const DARK_REPLACEMENTS: [Color, Color][] = [
  [WORDMARK_BLUE, [0.561, 0.69, 0.961, 1]],
  [TAGLINE_GRAY, [0.58, 0.639, 0.722, 1]],
]

const sameColor = (a: unknown, b: Color) =>
  Array.isArray(a) && a.length === 4 && a.every((value, index) => typeof value === 'number' && Math.abs(value - b[index]!) < 0.01)

/** Returns a copy of the animation with the flat wordmark/tagline colors swapped for dark mode. */
function withDarkColors(data: unknown): unknown {
  if (Array.isArray(data)) {
    const replacement = DARK_REPLACEMENTS.find(([from]) => sameColor(data, from))
    return replacement ? [...replacement[1]] : data.map(withDarkColors)
  }
  if (data && typeof data === 'object') {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, withDarkColors(value)]))
  }
  return data
}

/**
 * Plays the Taskora logo animation over the page on every full load (first
 * visit and hard refresh), then fades it out. The app renders underneath at the
 * same time but stays inert until the splash is gone. Never throws: any failure
 * simply removes the splash.
 */
export function runSplash(app: HTMLElement): void {
  const splash = document.getElementById('splash')
  const container = document.getElementById('splash-animation')
  if (!splash || !container) return

  app.inert = true
  let finished = false
  let animation: ReturnType<typeof lottie.loadAnimation> | undefined

  const finish = () => {
    if (finished) return
    finished = true
    window.clearTimeout(safety)
    app.inert = false
    splash.classList.add('is-done')
    window.setTimeout(() => {
      animation?.destroy()
      splash.remove()
    }, FADE_MS)
  }
  const safety = window.setTimeout(finish, MAX_SPLASH_MS)

  try {
    const dark = document.documentElement.classList.contains('dark')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: !reducedMotion,
      animationData: dark ? withDarkColors(logoAnimation) : logoAnimation,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })
    animation.addEventListener('complete', finish)
    animation.addEventListener('data_failed', finish)
    if (reducedMotion) {
      // Show the finished logo without movement, briefly.
      animation.goToAndStop(animation.totalFrames - 1, true)
      window.setTimeout(finish, REDUCED_MOTION_HOLD_MS)
    }
  } catch {
    finish()
  }
}
