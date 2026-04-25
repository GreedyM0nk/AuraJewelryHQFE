import React from 'react'

interface GoldDividerProps {
  className?: string
}

export const GoldDivider: React.FC<GoldDividerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-4 my-6 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-brand-gold/50" />
      <div className="w-1.5 h-1.5 rotate-45 bg-brand-gold flex-shrink-0" />
      <div className="w-1 h-1 rotate-45 border border-brand-gold/60 flex-shrink-0" />
      <div className="w-1.5 h-1.5 rotate-45 bg-brand-gold flex-shrink-0" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-brand-gold/50" />
    </div>
  )
}
