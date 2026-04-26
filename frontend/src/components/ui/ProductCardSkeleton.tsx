import React from 'react'

export const ProductCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-brand-black p-3">
    <div className="bg-brand-charcoal/60 aspect-square w-full mb-3" />
    <div className="h-4 bg-brand-charcoal/60 w-3/4 mb-2" />
    <div className="h-3 bg-brand-charcoal/60 w-1/2 mb-2" />
    <div className="h-4 bg-brand-charcoal/60 w-1/4" />
  </div>
)
