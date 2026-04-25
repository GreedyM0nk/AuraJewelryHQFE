import React from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type ButtonVariant = 'primary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonBaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button'
  }

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, keyof ButtonBaseProps> & {
    as: typeof Link
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-gold text-brand-black font-semibold hover:bg-brand-gold-light active:bg-brand-gold-dark border border-brand-gold',
  ghost:
    'bg-transparent text-brand-cream hover:text-brand-gold border border-brand-cream/30 hover:border-brand-gold',
  outline:
    'bg-transparent text-brand-gold border border-brand-gold hover:bg-brand-gold hover:text-brand-black',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  as: Component,
  ...props
}) => {
  const cls = `
    inline-flex items-center justify-center gap-2
    font-accent tracking-widest uppercase
    transition-all duration-300 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `

  if (Component && Component !== 'button') {
    return (
      <Component className={cls} {...(props as Omit<LinkProps, 'className'>)}>
        {children}
      </Component>
    )
  }

  return (
    <button
      className={cls}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
