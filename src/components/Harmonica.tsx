import { useState, useEffect, useCallback, useRef } from 'react'
import './Harmonica.css'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // Canvas drawing function
  const drawHarmonica = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Draw harmonica body
    ctx.fillStyle = '#e5e7eb'
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    ctx.fillRect(50, 100, width - 100, 80)
    ctx.strokeRect(50, 100, width - 100, 80)

    // Draw holes
    const holeWidth = (width - 120) / 10
    harmonicaData.forEach((hole, index) => {
      const x = 60 + index * holeWidth + holeWidth / 2
      const y = 140

      // Draw hole
      ctx.fillStyle = activeHoles.has(hole.id)
        ? isDraw ? '#ef4444' : '#3b82f6'
        : '#374151'

      ctx.beginPath()
      ctx.ellipse(x, y, 8, 25, 0, 0, 2 * Math.PI)
      ctx.fill()

      // Draw hole number
      ctx.fillStyle = '#1f2937'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(hole.id.toString(), x, y - 35)

      // Draw key binding
      ctx.fillStyle = activeHoles.has(hole.id) ? '#fbbf24' : '#6b7280'
      ctx.font = '10px sans-serif'
      ctx.fillText(hole.key.toUpperCase(), x, y + 45)

      // Visual feedback for active holes
      if (activeHoles.has(hole.id)) {
        ctx.strokeStyle = isDraw ? '#dc2626' : '#2563eb'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(x, y, 12, 30, 0, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
  }, [activeHoles, isDraw])

  // Update canvas when state changes
  useEffect(() => {
    drawHarmonica()
  }, [drawHarmonica])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = Math.min(800, window.innerWidth - 40)
      canvas.height = 250
      drawHarmonica()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [drawHarmonica])

  return (
    <div className="harmonica-container">
      <div className="harmonica-content">
        <div className="header">
          <h1>Virtual Harmonica</h1>
          <p>Play music with your keyboard</p>
        </div>

        {/* Status Card */}
        <div className="card status-card">
          <div className="status-indicator">
            <div className={`status-dot ${isDraw ? 'draw' : 'blow'}`} />
            <span className="status-text">
              {isDraw ? "Drawing (Inhaling)" : "Blowing (Exhaling)"}
            </span>
          </div>
        </div>

        {/* Canvas Harmonica */}
        <div className="card canvas-card">
          <canvas
            ref={canvasRef}
            className="harmonica-canvas"
          />
        </div>

        {/* Instructions Card */}
        <div className="card instructions-card">
          <h3 className="instructions-title">How to Play</h3>
          <div className="instructions-grid">
            <div className="instructions-list">
              <div className="instruction-item">
                <div className="instruction-dot blue"></div>
                <span><strong>Q-P keys:</strong> Blow notes (exhale)</span>
              </div>
              <div className="instruction-item">
                <div className="instruction-dot red"></div>
                <span><strong>Shift + keys:</strong> Draw notes (inhale)</span>
              </div>
              <div className="instruction-item">
                <div className="instruction-dot gray"></div>
                <span><strong>Hold keys:</strong> Sustain notes</span>
              </div>
            </div>
            <div className="note-reference">
              <h4 className="note-reference-title">Note Reference:</h4>
              <div className="note-grid">
                {harmonicaData.slice(0, 5).map(hole => (
                  <div key={hole.id} className="note-cell">
                    <div className="note-blow">
                      {hole.blowNote}
                    </div>
                    <div className="note-draw">
                      {hole.drawNote}
                    </div>
                  </div>
                ))}
              </div>
              <div className="note-grid">
                {harmonicaData.slice(5).map(hole => (
                  <div key={hole.id} className="note-cell">
                    <div className="note-blow">
                      {hole.blowNote}
                    </div>
                    <div className="note-draw">
                      {hole.drawNote}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}