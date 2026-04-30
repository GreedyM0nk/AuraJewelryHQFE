import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { Spinner } from '@/components/ui/Spinner'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { useCustomerStore } from '@/store/customerStore'
import axiosClient from '@/api/axiosClient'
import type { Country } from '@/data/countries'

interface FormData {
  name: string
  email: string
  phone: string
  country: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  country?: string
  general?: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const setCustomer = useCustomerStore((state) => state.setCustomer)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    country: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      nextErrors.name = 'Full name must be at least 2 characters'
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address'
    }
    if (!formData.country) {
      nextErrors.country = 'Please select your country'
    }
    if (formData.phone && !/^[+\d\s\-().]{7,20}$/.test(formData.phone)) {
      nextErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await axiosClient.post('/customers', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        country: formData.country,
        signup_date: new Date().toISOString().split('T')[0],
      })

      setCustomer(response.data)
      navigate('/account', { state: { justRegistered: true } })
    } catch (unknownError) {
      const err = unknownError as {
        data?: { detail?: { message?: string } | Array<{ msg?: string }> }
      }
      const detail = err.data?.detail

      if (typeof detail === 'object' && !Array.isArray(detail) && detail?.message === 'Email already exists') {
        setErrors({ email: 'This email is already registered. Try logging in instead.' })
      } else if (Array.isArray(detail)) {
        const message = detail[0]?.msg ?? 'Validation error'
        setErrors({ general: message.replace('value is not a valid email address: ', '') })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <SEO
        title="Create Account | Aura Jewellery HQ"
        description="Join the Aura Jewellery community. Create your account to track orders and save your favourites."
      />

      <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-3">Welcome</p>
            <h1 className="font-display text-5xl text-brand-cream italic mb-2">Create Account</h1>
            <p className="font-body text-brand-cream/50 text-sm">
              Join the Aura community. Already a member?{' '}
              <Link to="/login" className="text-brand-gold hover:underline">Sign in</Link>
            </p>
          </div>

          <GoldDivider className="mb-10" />

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errors.general && (
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-sm">
                <p className="font-body text-red-300 text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block font-body text-brand-cream/60 text-xs tracking-widest uppercase mb-2">
                Full Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                placeholder="Your full name"
                className={`w-full bg-transparent border ${errors.name ? 'border-red-400/60' : 'border-brand-cream/20 focus:border-brand-gold'} px-4 py-3 font-body text-sm text-brand-cream placeholder-brand-cream/30 outline-none transition-colors duration-200`}
              />
              {errors.name && <p className="text-red-400 text-xs font-body mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block font-body text-brand-cream/60 text-xs tracking-widest uppercase mb-2">
                Email Address <span className="text-brand-gold">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                  setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="your@email.com"
                className={`w-full bg-transparent border ${errors.email ? 'border-red-400/60' : 'border-brand-cream/20 focus:border-brand-gold'} px-4 py-3 font-body text-sm text-brand-cream placeholder-brand-cream/30 outline-none transition-colors duration-200`}
              />
              {errors.email && <p className="text-red-400 text-xs font-body mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="block font-body text-brand-cream/60 text-xs tracking-widest uppercase mb-2">
                Phone Number <span className="text-brand-cream/30 text-xs normal-case">(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phone: event.target.value }))
                  setErrors((prev) => ({ ...prev, phone: undefined }))
                }}
                placeholder="+91 98765 43210"
                className={`w-full bg-transparent border ${errors.phone ? 'border-red-400/60' : 'border-brand-cream/20 focus:border-brand-gold'} px-4 py-3 font-body text-sm text-brand-cream placeholder-brand-cream/30 outline-none transition-colors duration-200`}
              />
              {errors.phone && <p className="text-red-400 text-xs font-body mt-1">{errors.phone}</p>}
            </div>

            <CountrySelect
              value={formData.country}
              onChange={(country: Country) => {
                setFormData((prev) => ({ ...prev, country: country.name }))
                setErrors((prev) => ({ ...prev, country: undefined }))
              }}
              error={errors.country}
              label="Country"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full font-accent text-xs tracking-widest uppercase py-4 bg-brand-gold text-brand-black hover:bg-brand-gold/90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <GoldDivider className="mt-10 mb-6" />

          <p className="font-body text-brand-cream/30 text-xs text-center leading-relaxed">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-brand-gold/60 hover:text-brand-gold">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="text-brand-gold/60 hover:text-brand-gold">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </PageWrapper>
  )
}

export default RegisterPage
