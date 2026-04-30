import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, type Country } from '@/data/countries'

interface CountrySelectProps {
  value: string
  onChange: (country: Country) => void
  error?: string
  label?: string
  required?: boolean
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  error,
  label = 'Country',
  required = false,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = COUNTRIES.find((country) => country.name === value)
  const filtered = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block font-body text-brand-cream/60 text-xs tracking-widest uppercase mb-2">
          {label}
          {required && <span className="text-brand-gold ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select country"
        className={`w-full flex items-center justify-between px-4 py-3 bg-transparent border ${
          error ? 'border-red-400/60' : 'border-brand-cream/20 focus:border-brand-gold'
        } text-left transition-colors duration-200 font-body text-sm`}
      >
        <span className={selected ? 'text-brand-cream' : error ? 'text-red-400/70' : 'text-brand-cream/30'}>
          {selected
            ? `${selected.flag} ${selected.name}`
            : error
            ? error
            : 'Select your country...'}
        </span>
        <ChevronDown
          size={14}
          className={`text-brand-cream/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-brand-charcoal border border-brand-gold/20 shadow-xl max-h-64 flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-gold/10">
            <Search size={12} className="text-brand-cream/30 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search countries..."
              className="flex-1 bg-transparent font-body text-sm text-brand-cream placeholder-brand-cream/30 outline-none"
            />
          </div>

          <ul className="overflow-y-auto flex-1 scrollbar-hide">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 font-body text-xs text-brand-cream/30 text-center">No countries match</li>
            ) : (
              filtered.map((country) => (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(country)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`w-full text-left px-4 py-2.5 font-body text-sm flex items-center gap-3 hover:bg-brand-gold/10 transition-colors ${
                      country.name === value ? 'text-brand-gold bg-brand-gold/5' : 'text-brand-cream/70'
                    }`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="ml-auto text-brand-cream/30 text-xs">{country.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
