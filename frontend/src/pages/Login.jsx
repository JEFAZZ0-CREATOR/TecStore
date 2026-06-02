import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login(){
  const [form, setForm] = useState({email:'', password:''})
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      const res = await login(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      alert('Login exitoso')
      navigate('/store')
    }catch(err){
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handle}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
