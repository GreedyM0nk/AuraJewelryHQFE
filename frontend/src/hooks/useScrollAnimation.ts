import { useReducedMotion } from 'framer-motion'

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

export const useScrollAnimation = () => {
  const reduce = useReducedMotion()
  return reduce
    ? { hidden: {} as Record<string, unknown>, visible: {} as Record<string, unknown> }
    : fadeUpVariants
}
