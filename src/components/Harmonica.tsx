import { useState, useEffect, useCallback } from 'react'
import { cn } from '../lib/utils'

interface HarmonicaHole {
  id: number
  blowNote: string
  drawNote: string
  blowFreq: number
  drawFreq: number
  key: string
}

const harmonicaData: HarmonicaHole[] = [
  { id: 1, blowNote: 'C4', drawNote: 'D4', blowFreq: 261.63, drawFreq: 293.66, key: 'q' },
  { id: 2, blowNote: 'E4', drawNote: 'G4', blowFreq: 329.63, drawFreq: 392.00, key: 'w' },
  { id: 3, blowNote: 'G4', drawNote: 'B4', blowFreq: 392.00, drawFreq: 493.88, key: 'e' },
  { id: 4, blowNote: 'C5', drawNote: 'D5', blowFreq: 523.25, drawFreq: 587.33, key: 'r' },
  { id: 5, blowNote: 'E5', drawNote: 'F5', blowFreq: 659.25, drawFreq: 698.46, key: 't' },
  { id: 6, blowNote: 'G5', drawNote: 'A5', blowFreq: 783.99, drawFreq: 880.00, key: 'y' },
  { id: 7, blowNote: 'C6', drawNote: 'B5', blowFreq: 1046.50, drawFreq: 987.77, key: 'u' },
  { id: 8, blowNote: 'E6', drawNote: 'D6', blowFreq: 1318.51, drawFreq: 1174.66, key: 'i' },
  { id: 9, blowNote: 'G6', drawNote: 'F6', blowFreq: 1567.98, drawFreq: 1396.91, key: 'o' },
  { id: 10, blowNote: 'C7', drawNote: 'A6', blowFreq: 2093.00, drawFreq: 1760.00, key: 'p' },
]

interface HarmonicaProps {
  className?: string
}

export function Harmonica({ className }: HarmonicaProps) {
  const [activeHoles, setActiveHoles] = useState<Set<number>>(new Set())
  const [isDraw, setIsDraw] = useState<boolean>(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [oscillators, setOscillators] = useState<Map<number, OscillatorNode>>(new Map())

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
      }
    }

    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('keydown', initAudio, { once: true })

    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }
  }, [audioContext])

  const playNote = useCallback((hole: HarmonicaHole, isDraw: boolean) => {
    if (!audioContext) return

    const frequency = isDraw ? hole.drawFreq : hole.blowFreq

    // Stop existing oscillator for this hole
    const existingOsc = oscillators.get(hole.id)
    if (existingOsc) {
      existingOsc.stop()
      oscillators.delete(hole.id)
    }

    // Create new oscillator
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(audioContext.currentTime)

    setOscillators(prev => new Map(prev).set(hole.id, oscillator))
    setActiveHoles(prev => new Set(prev).add(hole.id))
  }, [audioContext, oscillators])

  const stopNote = useCallback((holeId: number) => {
    const oscillator = oscillators.get(holeId)
    if (oscillator && audioContext) {
      const gainNode = audioContext.createGain()
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

      oscillator.stop(audioContext.currentTime + 0.1)
      setOscillators(prev => {
        const newMap = new Map(prev)
        newMap.delete(holeId)
        return newMap
      })
    }
    setActiveHoles(prev => {
      const newSet = new Set(prev)
      newSet.delete(holeId)
      return newSet
    })
  }, [audioContext, oscillators])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      const key = e.key.toLowerCase()
      const isShiftPressed = e.shiftKey
      const hole = harmonicaData.find(h => h.key === key)

      if (hole && !activeHoles.has(hole.id)) {
        setIsDraw(isShiftPressed)
        playNote(hole, isShiftPressed)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const hole = harmonicaData.find(h => h.key === key)

      if (hole) {
        stopNote(hole.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [activeHoles, playNote, stopNote])

  return (
    <div className={cn("flex flex-col items-center gap-8", className)}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Virtual C Harmonica</h1>
        <p className="text-slate-600">
          Use keys Q-W-E-R-T-Y-U-I-O-P to play • Hold Shift to draw (inhale)
        </p>
        <p className="text-sm text-slate-600 mt-2">
          {isDraw ? "Drawing (Inhaling)" : "Blowing (Exhaling)"}
        </p>
      </div>

      <div className="relative">
        {/* Harmonica body */}
        <div className="bg-gradient-to-b from-slate-300 to-slate-500 rounded-lg px-6 py-8 shadow-lg">
          <div className="flex gap-1">
            {harmonicaData.map((hole) => (
              <div
                key={hole.id}
                className="flex flex-col items-center"
              >
                {/* Hole number and key */}
                <div className="text-xs text-slate-700 font-semibold mb-1">
                  {hole.id}
                </div>
                <div className="text-xs text-slate-600 mb-2">
                  {hole.key.toUpperCase()}
                </div>

                {/* Hole */}
                <div
                  className={cn(
                    "w-6 h-16 bg-black rounded-full shadow-inner transition-all duration-150",
                    activeHoles.has(hole.id) && "bg-red-500 shadow-red-500/50 shadow-lg"
                  )}
                />

                {/* Notes */}
                <div className="flex flex-col items-center mt-2 text-xs">
                  <div className={cn(
                    "text-blue-700 font-medium",
                    activeHoles.has(hole.id) && !isDraw && "text-blue-900 font-bold"
                  )}>
                    {hole.blowNote}
                  </div>
                  <div className="text-slate-500 text-[10px]">blow</div>
                  <div className={cn(
                    "text-red-700 font-medium mt-1",
                    activeHoles.has(hole.id) && isDraw && "text-red-900 font-bold"
                  )}>
                    {hole.drawNote}
                  </div>
                  <div className="text-slate-500 text-[10px]">draw</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand name */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-slate-700 font-bold text-sm">
          HARMONICA
        </div>
      </div>

      <div className="text-center text-sm text-slate-600 max-w-md">
        <p>Press and hold the keys to play notes. The harmonica will light up red when notes are active.</p>
      </div>
    </div>
  )
}