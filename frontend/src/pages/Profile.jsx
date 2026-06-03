import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiSave, FiX, FiLogOut, FiKey } from 'react-icons/fi'
import { usersAPI } from '../services/api'
import { useAuthStore } from '../store/store'
import { GlassCard, Input, Button, LoadingSpinner } from '../components/common'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const result = await usersAPI.updateProfile(formData)
      // Update store with new user data
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gradient">Mi Perfil</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            logout()
            window.location.href = '/login'
          }}
          className="flex items-center gap-2"
        >
          <FiLogOut /> Cerrar Sesión
        </Button>
      </div>

      {/* Profile Header */}
      <GlassCard className="p-8">
        <div className="flex items-end gap-6 mb-6">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&size=120`}
              alt={user?.name}
              className="w-24 h-24 rounded-lg border-4 border-accent"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-accent rounded-full">
              <FiEdit2 size={16} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <p className="text-sm text-accent mt-2">Miembro desde {new Date(user?.createdAt).getFullYear()}</p>
          </div>
        </div>
      </GlassCard>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Información Personal</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? <FiX size={16} /> : <FiEdit2 size={16} />}
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu nombre"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="tu@email.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu teléfono"
              />
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu dirección"
              />
            </div>

            {isEditing && (
              <Button
                variant="primary"
                loading={loading}
                onClick={handleSave}
                className="mt-4"
              >
                <FiSave size={16} className="mr-2" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Security Section */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiKey /> Seguridad
        </h3>
        <Button variant="secondary" className="flex items-center gap-2">
          <FiKey size={16} />
          Cambiar Contraseña
        </Button>
      </GlassCard>

      {/* Account Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-6 text-center">
          <p className="text-slate-400 mb-2">Total de Órdenes</p>
          <p className="text-3xl font-bold text-gradient">12</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-slate-400 mb-2">Total Gastado</p>
          <p className="text-3xl font-bold text-gradient">$3,450.00</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <p className="text-slate-400 mb-2">Puntos de Lealtad</p>
          <p className="text-3xl font-bold text-gradient">3,450</p>
        </GlassCard>
      </div>
    </div>
  )
}
