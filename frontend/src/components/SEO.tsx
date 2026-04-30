import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  image?: string
  noIndex?: boolean
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = '/og-image.jpg',
  noIndex = false,
}) => {
  const suffix = ' | Aura Jewellery HQ'
  const fullTitle = title.endsWith('Aura Jewellery HQ') ? title : `${title}${suffix}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta name="description" content={description} />
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
