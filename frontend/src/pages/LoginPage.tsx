import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { Spinner } from '@/components/ui/Spinner'
import { lookupCustomerByEmail } from '@/api/customers'
import { useCustomerStore } from '@/store/customerStore'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setCustomer = useCustomerStore((state) => state.setCustomer)
  const redirectTo = ((location.state as { from?: string } | null)?.from ?? '/account') as string

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const customer = await lookupCustomerByEmail(email.trim().toLowerCase())
      setCustomer(customer)
      navigate(redirectTo, { replace: true })
    } catch (unknownError) {
      const err = unknownError as { status?: number }
      if (err.status === 404) {
        setError("We couldn't find an account with that email. Would you like to create one?")
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <SEO title="Sign In | Aura Jewellery HQ" description="Sign in to your Aura Jewellery account." />

      <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-3">Welcome Back</p>
            <h1 className="font-display text-5xl text-brand-cream italic mb-2">Sign In</h1>
            <p className="font-body text-brand-cream/50 text-sm">
              New here?{' '}
              <Link to="/register" className="text-brand-gold hover:underline">Create an account</Link>
            </p>
          </div>

          <GoldDivider className="mb-10" />

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block font-body text-brand-cream/60 text-xs tracking-widest uppercase mb-2">
                Email Address <span className="text-brand-gold">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="your@email.com"
                className={`w-full bg-transparent border ${error ? 'border-red-400/60' : 'border-brand-cream/20 focus:border-brand-gold'} px-4 py-3 font-body text-sm text-brand-cream placeholder-brand-cream/30 outline-none transition-colors`}
              />
              {error && (
                <p className="text-red-400 text-xs font-body mt-1">
                  {error}{' '}
                  {error.includes('create one') && (
                    <Link to="/register" className="text-brand-gold hover:underline">Register now {'->'}</Link>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-accent text-xs tracking-widest uppercase py-4 bg-brand-gold text-brand-black hover:bg-brand-gold/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="font-body text-brand-cream/30 text-xs text-center mt-8">
            We use email-based identification. No password required.
          </p>
        </div>
      </main>
    </PageWrapper>
  )
}

export default LoginPage
