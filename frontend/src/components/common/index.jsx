import React from 'react'
import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} text-accent`}
    >
      <FiLoader size="100%" />
    </motion.div>
  )
}

export const GlassCard = ({ children, className = '', ...props }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`card backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </motion.div>
)

export const Badge = ({ children, variant = 'primary' }) => (
  <span className={`badge badge-${variant}`}>
    {children}
  </span>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <div className="text-5xl mb-4 text-accent/50">
      <Icon />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-400 mb-6 max-w-sm">{description}</p>
    {action && action}
  </motion.div>
)

export const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false)

  if (hasError) {
    return fallback || <div className="text-danger text-center py-8">Something went wrong</div>
  }

  return <>{children}</>
}

export const Input = React.forwardRef(({ icon: Icon, error, ...props }, ref) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />}
    <input
      ref={ref}
      className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-danger' : ''} min-h-[48px]`}
      {...props}
    />
    {error && <p className="text-danger text-sm mt-1">{error}</p>}
  </div>
))

export const Button = ({ children, variant = 'primary', size = 'md', loading = false, ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  const sizeClass = size === 'sm' ? 'px-4 py-1 text-sm' : size === 'lg' ? 'px-8 py-3 text-lg' : ''

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClass} ${sizeClass}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </motion.button>
  )
}
