'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateLeadScore, LeadAnswers } from '@/lib/utils/leadScoring'

interface RegistrationWizardProps {
    onSuccess: () => void
    onLoginClick: () => void
}

export function RegistrationWizard({ onSuccess, onLoginClick }: RegistrationWizardProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Account Data
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')

    // Scoring Data
    const [answers, setAnswers] = useState<LeadAnswers>({
        timeline: '3_PLUS_MONTHS',
        has_portfolio: false,
        capital_type: 'CASH',
        risk_appetite: 3,
        has_experience: false
    })

    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const updateAnswer = (key: keyof LeadAnswers, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            // 1. Calculate Score
            const result = calculateLeadScore(answers)

            // 2. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        // We can try to set these here, but usually Profile trigger handles creation.
                        // We might need to UPDATE the profile immediately after signup.
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 3. Update Profile with Score
                // Wait a moment for trigger to create profile (optional, or use upsert)
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        lead_score: result.score,
                        lead_priority: result.priority,
                        onboarding_answers: answers,
                        tier: 'REGISTERED' // Explicitly set
                    })
                    .eq('id', authData.user.id)

                if (profileError) {
                    console.error('Profile update failed:', profileError)
                    // Don't block registration success, but log it.
                }
            }

            onSuccess()

        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    // --- RENDER STEPS ---

    if (step === 1) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="••••••••"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleNext}
                    disabled={!email || !password || !fullName}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    Next: Investor Profile <ChevronRight size={18} />
                </button>
                <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button onClick={onLoginClick} className="text-emerald-600 font-medium hover:underline">Log in</button>
                </div>
            </div>
        )
    }

    if (step === 2) { // Timeline & Experience
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold text-gray-800">Investment Goals</h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">When do you plan to start investing?</label>
                    <div className="space-y-2">
                        {[
                            { val: 'IMMEDIATE', label: 'Immediately' },
                            { val: '1-2_MONTHS', label: 'In 1-2 months' },
                            { val: '3_PLUS_MONTHS', label: 'In 3+ months / Just exploring' }
                        ].map((opt) => (
                            <label key={opt.val} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${answers.timeline === opt.val ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="timeline"
                                    checked={answers.timeline === opt.val}
                                    onChange={() => updateAnswer('timeline', opt.val)}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="ml-3 text-sm text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you have prior real estate experience?</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer ${answers.has_experience ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                            <input type="radio" checked={answers.has_experience} onChange={() => updateAnswer('has_experience', true)} className="sr-only" />
                            <span className="text-sm font-medium">Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer ${!answers.has_experience ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                            <input type="radio" checked={!answers.has_experience} onChange={() => updateAnswer('has_experience', false)} className="sr-only" />
                            <span className="text-sm font-medium">No</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleBack} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Back</button>
                    <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700">Next</button>
                </div>
            </div>
        )
    }

    if (step === 3) { // Capital
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold text-gray-800">Financial Capacity</h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">How will you fund your investments?</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['CASH', 'BOND', 'BOTH'].map(t => (
                            <label key={t} className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer text-sm font-medium ${answers.capital_type === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
                                <input type="radio" name="cap_type" checked={answers.capital_type === t} onChange={() => updateAnswer('capital_type', t)} className="sr-only" />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>

                {(answers.capital_type === 'CASH' || answers.capital_type === 'BOTH') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Cash Capital</label>
                        <select
                            className="w-full p-2 border rounded-lg text-sm"
                            value={answers.cash_amount || ''}
                            onChange={e => updateAnswer('cash_amount', e.target.value)}
                        >
                            <option value="">Select amount...</option>
                            <option value="R5M+">R5,000,000+</option>
                            <option value="R2.5M-R4.9M">R2.5m - R4.9m</option>
                            <option value="R1M-R2.49M">R1m - R2.49m</option>
                            <option value="R500K-R999K">R500k - R999k</option>
                            <option value="R100K-R499K">R100k - R499k</option>
                            <option value="<R100K">Less than R100k</option>
                        </select>
                    </div>
                )}

                {(answers.capital_type === 'BOND' || answers.capital_type === 'BOTH') && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Bond Qualification</label>
                            <select
                                className="w-full p-2 border rounded-lg text-sm"
                                value={answers.bond_amount || ''}
                                onChange={e => updateAnswer('bond_amount', e.target.value)}
                            >
                                <option value="">Select amount...</option>
                                <option value="R5M+">R5,000,000+</option>
                                <option value="R3M-R4.9M">R3m - R4.9m</option>
                                <option value="R1.5M-R2.99M">R1.5m - R2.99m</option>
                                <option value="R750K-R1.49M">R750k - R1.49m</option>
                                <option value="R350K-R749K">R350k - R749k</option>
                                <option value="<R350K">Less than R350k</option>
                            </select>
                        </div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={!!answers.bond_preapproved}
                                onChange={e => updateAnswer('bond_preapproved', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">I am already pre-approved for a bond</span>
                        </label>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={handleBack} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Back</button>
                    <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700">Next</button>
                </div>
            </div>
        )
    }

    if (step === 4) { // Risk & Submit
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold text-gray-800">Risk Profile</h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate your risk appetite (1-5)</label>
                    <p className="text-xs text-gray-500 mb-3">1 = Conservative, 5 = Aggressive</p>
                    <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button
                                key={val}
                                onClick={() => updateAnswer('risk_appetite', val)}
                                className={`w-12 h-12 rounded-full font-bold transition-all ${answers.risk_appetite === val ? 'bg-emerald-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Do you have an existing portfolio?</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer ${answers.has_portfolio ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                            <input type="radio" checked={answers.has_portfolio} onChange={() => updateAnswer('has_portfolio', true)} className="sr-only" />
                            <span className="text-sm font-medium">Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer ${!answers.has_portfolio ? 'border-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                            <input type="radio" checked={!answers.has_portfolio} onChange={() => updateAnswer('has_portfolio', false)} className="sr-only" />
                            <span className="text-sm font-medium">No</span>
                        </label>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button onClick={handleBack} disabled={loading} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </div>
            </div>
        )
    }

    return null
}
