import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RecipesPage from './RecipesPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecipesPage />
  </StrictMode>
)
