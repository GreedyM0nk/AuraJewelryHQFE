import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, onHide])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-brand-charcoal border border-brand-gold/30 px-4 py-3 shadow-lg"
        >
          <CheckCircle2 size={14} className="text-brand-gold flex-shrink-0" />
          <span className="font-body text-brand-cream/80 text-xs">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
