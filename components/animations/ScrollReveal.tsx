'use client'

import { useRef, ReactNode } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  once?: boolean
  scale?: number
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 50,
  once = true,
  scale = 1,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance, x: 0 }
      case 'down': return { y: -distance, x: 0 }
      case 'left': return { x: distance, y: 0 }
      case 'right': return { x: -distance, y: 0 }
      case 'none': return { x: 0, y: 0 }
    }
  }

  const initial = getInitialPosition()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0, 
        ...initial,
        scale: scale < 1 ? scale : 1
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1
      } : {}}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}