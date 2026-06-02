import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/api'

export default function Register(){
  const [form, setForm] = useState({name:'', email:'', password:''})
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      const res = await register(form)
      console.log(res)
      alert('Registrado: ' + res.data.user.email)
      navigate('/login')
    }catch(err){
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handle}>
        <input placeholder="Nombre" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <button type="submit">Registrar</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
