'use client'

import { useRef, useState, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  perspective?: number
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.02,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const percentX = (e.clientX - centerX) / (rect.width / 2)
    const percentY = (e.clientY - centerY) / (rect.height / 2)
    rotateX.set(-percentY * maxTilt)
    rotateY.set(percentX * maxTilt)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        animate={{ scale: isHovered ? scale : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(16, 185, 129, 0.4)',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${glowColor}, transparent 40%)`
          ),
        }}
      />
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
  delay?: number
}

export function FloatingElement({
  children,
  className = '',
  duration = 3,
  distance = 10,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function Parallax({
  children,
  className = '',
  speed = 0.5,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  const handleScroll = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const scrollY = window.scrollY
    const elementTop = rect.top + scrollY
    const offset = (scrollY - elementTop) * speed
    y.set(offset)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  width?: 'fit-content' | '100%'
}

export function RevealMask({
  children,
  className = '',
  width = 'fit-content',
}: RevealOnScrollProps) {
  const ref = useRef(null)

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width }}>
      <motion.div
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}