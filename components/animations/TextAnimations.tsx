'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useAnimation, Variants } from 'framer-motion'

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export function TextReveal({
  text,
  className = '',
  delay = 0,
  duration = 0.05,
  once = true,
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const words = text.split(' ')

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: duration,
        delayChildren: delay,
      },
    },
  }

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  once?: boolean
  type?: 'chars' | 'words'
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  once = true,
  type = 'chars',
}: SplitTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const items = type === 'chars' ? text.split('') : text.split(' ')

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: type === 'chars' ? 0.03 : 0.08,
        delayChildren: delay,
      },
    },
  }

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: type === 'chars' ? 40 : 20,
      rotateX: type === 'chars' ? -90 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      style={{ perspective: 1000 }}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={child}
          className={type === 'words' ? 'mr-[0.25em]' : ''}
          style={{ display: 'inline-block', transformOrigin: 'bottom' }}
        >
          {item === ' ' ? '\u00A0' : item}
        </motion.span>
      ))}
    </motion.span>
  )
}

interface TypewriterProps {
  text: string
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
}

export function Typewriter({
  text,
  className = '',
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || started) return
    
    const timeout = setTimeout(() => {
      setStarted(true)
      let i = 0
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [isInView, text, speed, delay, started])

  return (
    <span ref={ref} className={className}>
      {displayText}
      {cursor && started && displayText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </span>
  )
}

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

export function CountUp({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easeOut

      setCount(current)

      if (now < endTime) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, start, end, duration])

  const formatted = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toLocaleString()

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

interface GradientTextProps {
  text: string
  className?: string
  from?: string
  via?: string
  to?: string
  animate?: boolean
}

export function GradientText({
  text,
  className = '',
  from = '#10b981',
  via = '#3b82f6',
  to = '#8b5cf6',
  animate = true,
}: GradientTextProps) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`,
        backgroundSize: animate ? '200% 100%' : '100% 100%',
      }}
      animate={animate ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      } : {}}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  )
}