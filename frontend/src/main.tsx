import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import { ApplicationsListPage } from './pages/ApplicationsListPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/applications" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/applications" element={<ApplicationsListPage />} />
        </Route>
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
