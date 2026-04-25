import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'

const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper>
      <SEO
        title="404 — Page Not Found"
        description="The page you're looking for doesn't exist. Explore our jewellery collection instead."
      />
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-12"
        >
          <span
            className="font-display text-[12rem] md:text-[18rem] font-bold leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E8C97A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.15,
            }}
            aria-hidden="true"
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-brand-charcoal border-2 border-brand-gold flex items-center justify-center shadow-xl shadow-brand-gold/20">
              <motion.span
                className="font-accent text-brand-gold text-3xl font-bold"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                AJ
              </motion.span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="font-display text-4xl md:text-5xl font-light text-brand-cream">
            Page Not Found
          </h1>
          <p className="font-body text-brand-cream/50 text-base max-w-sm mx-auto">
            The page you're looking for has been moved, removed, or perhaps it never existed.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button variant="primary" size="lg" as={Link} to="/">
            Return Home
          </Button>
          <Button variant="ghost" size="lg" as={Link} to="/shop">
            Browse Collection
          </Button>
        </motion.div>
      </main>
    </PageWrapper>
  )
}

export default NotFoundPage
