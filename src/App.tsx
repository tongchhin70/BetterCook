import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <header>
      <h1>Better Cook</h1>
      <ul>
        <li><a href='#'>Home</a></li>
        <li><a href='#'>Fridge</a></li>
        <li><a href='#'>Recipes</a></li>
        <li><a href='#'>Drinks</a></li>
      </ul>
    </header>

  )
}

export default App
