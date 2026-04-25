import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} ${className} rounded-full border-2 border-brand-gold/20 border-t-brand-gold animate-spin`}
    />
  )
}
