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

export function Harmonica() {
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

  // Check if holes are adjacent (no gaps allowed)
  const areHolesAdjacent = useCallback((holeIds: number[]) => {
    if (holeIds.length <= 1) return true

    const sortedIds = [...holeIds].sort((a, b) => a - b)
    for (let i = 1; i < sortedIds.length; i++) {
      if (sortedIds[i] - sortedIds[i - 1] > 1) {
        return false // Gap found
      }
    }
    return true
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      const key = e.key.toLowerCase()
      const isShiftPressed = e.shiftKey
      const hole = harmonicaData.find(h => h.key === key)

      if (hole && !activeHoles.has(hole.id)) {
        // Check if adding this hole would maintain adjacency
        const newActiveHoles = [...activeHoles, hole.id]
        if (areHolesAdjacent(newActiveHoles)) {
          setIsDraw(isShiftPressed)
          playNote(hole, isShiftPressed)
        }
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
  }, [activeHoles, playNote, stopNote, areHolesAdjacent])

  // Canvas drawing function
  const drawHarmonica = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Draw harmonica body (smaller)
    ctx.fillStyle = '#e5e7eb'
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    ctx.fillRect(70, 90, width - 140, 100)
    ctx.strokeRect(70, 90, width - 140, 100)

    // Calculate hole positioning - closer together
    const totalHolesWidth = width - 160
    const holeSpacing = totalHolesWidth / 10
    const startX = 80

    harmonicaData.forEach((hole, index) => {
      const x = startX + index * holeSpacing + holeSpacing / 2
      const y = 140

      // Draw hole (wider and more square-like)
      ctx.fillStyle = activeHoles.has(hole.id)
        ? isDraw ? '#ef4444' : '#3b82f6'
        : '#374151'

      const holeWidth = 28
      const holeHeight = 45
      ctx.beginPath()
      ctx.roundRect(x - holeWidth/2, y - holeHeight/2, holeWidth, holeHeight, 3)
      ctx.fill()

      // Draw hole number above the harmonica
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(hole.id.toString(), x, y - 70)

      // Draw key binding below the harmonica
      ctx.fillStyle = activeHoles.has(hole.id) ? '#dc2626' : '#4b5563'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(hole.key.toUpperCase(), x, y + 70)

      // Draw blow note inside harmonica (top)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '9px sans-serif'
      ctx.fillText(hole.blowNote, x, y - 15)

      // Draw draw note inside harmonica (bottom)
      ctx.fillStyle = '#a3a3a3'
      ctx.font = '9px sans-serif'
      ctx.fillText(hole.drawNote, x, y + 20)

      // Visual feedback for active holes
      if (activeHoles.has(hole.id)) {
        ctx.strokeStyle = isDraw ? '#dc2626' : '#2563eb'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.roundRect(x - holeWidth/2 - 2, y - holeHeight/2 - 2, holeWidth + 4, holeHeight + 4, 5)
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
          <h1>E-Harmonica</h1>
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
              <div className="instruction-item">
                <div className="instruction-dot gray"></div>
                <span><strong>Note:</strong> Only adjacent holes can be played together</span>
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

        {/* Song Example */}
        <div className="card song-example">
          <h3 className="song-title">🎵 Try "Twinkle Twinkle Little Star"</h3>
          <div className="song-sequence">
            <span className="song-note blow">R</span>
            <span className="song-note blow">R</span>
            <span className="song-note blow">Y</span>
            <span className="song-note blow">Y</span>
            <span className="song-note draw">Y</span>
            <span className="song-note draw">Y</span>
            <span className="song-note blow">Y-</span>
            <span className="song-spacer">|</span>
            <span className="song-note draw">T</span>
            <span className="song-note draw">T</span>
            <span className="song-note blow">T</span>
            <span className="song-note blow">T</span>
            <span className="song-note draw">R</span>
            <span className="song-note draw">R</span>
            <span className="song-note blow">R-</span>
          </div>
          <p className="song-description">Blue notes = blow, Red notes = draw (use Shift)</p>
        </div>

        {/* GitHub Link */}
        <div className="github-footer">
          <a href="https://github.com/error-magnet/eharmonica" target="_blank" rel="noopener noreferrer" className="github-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}