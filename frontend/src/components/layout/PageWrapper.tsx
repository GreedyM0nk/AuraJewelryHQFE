import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

interface PageWrapperProps {
  children: React.ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? reducedVariants : pageVariants

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
