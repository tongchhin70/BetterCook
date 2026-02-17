import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FavoritesPage from './FavoritesPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FavoritesPage />
  </StrictMode>,
)