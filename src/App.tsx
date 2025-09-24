import { Analytics } from '@vercel/analytics/react'
import { Harmonica } from './components/Harmonica'

function App() {
  return (
    <div>
      <Harmonica />
      <Analytics />
    </div>
  )
}

export default App
