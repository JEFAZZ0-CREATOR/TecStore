import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthSelection() {
  const navigate = useNavigate()

  return (
    <section className="auth-selection-page">
      <div className="auth-selection-card">
        <span className="eyebrow">Listo para comenzar</span>
        <h2>Elige cómo quieres ingresar a TechStore</h2>
        <p>Inicia sesión con tu cuenta existente o crea una nueva cuenta para descubrir productos exclusivos y comenzar a comprar.</p>
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')}>Iniciar sesión</button>
          <button className="secondary" onClick={() => navigate('/register')}>Crear cuenta</button>
        </div>
      </div>
    </section>
  )
}
