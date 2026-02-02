'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import { RegistrationWizard } from './RegistrationWizard'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  // Reset mode when opened
  useEffect(() => {
    if (isOpen) setMode('login')
  }, [isOpen])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Event listener for opening modal
  useEffect(() => {
    const handleOpen = () => {
      // In a real app we might use a global state (Context/Zustand)
      // For now we rely on the parent passing isOpen=true
    }
    window.addEventListener('openAuthModal', handleOpen)
    return () => window.removeEventListener('openAuthModal', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-auto overflow-hidden transition-all duration-300 ${mode === 'register' ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Investor Registration'}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'register' ? (
            <RegistrationWizard
              onSuccess={() => {
                onSuccess?.()
                onClose()
              }}
              onLoginClick={() => setMode('login')}
            />
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Log in to view your dashboard and investment details.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : 'Log In'}
                </button>
              </form>

              <p className="text-center mt-4 text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Create one
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}