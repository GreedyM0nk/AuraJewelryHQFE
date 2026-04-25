import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCategories } from '@/hooks/useCategories'
import { fadeUpVariants } from '@/hooks/useScrollAnimation'
import type { Category } from '@/types'

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse flex flex-col gap-3">
    <div className="aspect-square bg-brand-charcoal rounded-sm" />
    <div className="h-4 bg-brand-charcoal rounded w-2/3" />
  </div>
)

const CategoryCard: React.FC<{ category: Category; index: number }> = ({ category, index }) => (
  <motion.div
    variants={fadeUpVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    custom={index}
  >
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative block overflow-hidden cursor-pointer aspect-[3/4]"
      aria-label={`Browse ${category.name}`}
    >
      {/* Image */}
      <div className="absolute inset-0 bg-brand-charcoal">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-accent text-brand-gold/30 text-2xl">{category.name[0]}</span>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-brand-black/20 to-transparent group-hover:from-brand-black/50 transition-all duration-500" />

      {/* Gold border on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-gold/60 transition-all duration-300" />

      {/* Category name */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="font-accent text-sm uppercase tracking-[0.3em] text-brand-cream group-hover:text-brand-gold transition-colors duration-300">
          {category.name.toUpperCase()}
          <ArrowRight
            size={14}
            className="inline ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
          />
        </span>
      </div>
    </Link>
  </motion.div>
)

export const CategoryStrip: React.FC = () => {
  const { data: categories, isLoading } = useCategories()

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto" aria-label="Categories">
      <span className="font-accent text-xs tracking-[0.4em] text-brand-gold uppercase mb-3 block text-center">
        Browse by Category
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : (categories ?? []).map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
      </div>
    </section>
  )
}
