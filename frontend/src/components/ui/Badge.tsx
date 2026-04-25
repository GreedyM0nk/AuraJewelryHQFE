import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'danger' | 'neutral'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const variants = {
    gold: 'bg-brand-gold text-brand-black',
    danger: 'bg-red-700 text-white',
    neutral: 'bg-brand-charcoal text-brand-cream border border-brand-gold/30',
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-accent font-semibold uppercase tracking-wider rounded-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
