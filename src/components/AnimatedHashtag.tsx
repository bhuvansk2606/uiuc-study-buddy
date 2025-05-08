'use client'

import { motion } from 'framer-motion'

export default function AnimatedHashtag() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
      className="text-2xl font-bold text-[#E84A27]"
    >
      #GrindILLINI
    </motion.div>
  )
} 