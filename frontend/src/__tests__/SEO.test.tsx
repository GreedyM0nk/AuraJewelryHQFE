import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO } from '@/components/SEO'

const renderSEO = (component: React.ReactElement) => {
  return render(component, {
    wrapper: ({ children }) => <HelmetProvider>{children}</HelmetProvider>,
  })
}

describe('SEO Component', () => {
  it('should render without errors with required props', () => {
    const { container } = renderSEO(
      <SEO title="Test Page" description="Test description" />
    )
    expect(container).toBeTruthy()
  })

  it('should render without errors with all props', () => {
    const { container } = renderSEO(
      <SEO
        title="Complete Test"
        description="Complete description"
        canonical="https://example.com"
        ogImage="https://example.com/og.jpg"
        ogType="website"
        noIndex={true}
      />
    )
    expect(container).toBeTruthy()
  })

  it('should accept noIndex={true} without errors', () => {
    const { container } = renderSEO(
      <SEO title="Secure Page" description="Sensitive content" noIndex={true} />
    )
    expect(container).toBeTruthy()
  })

  it('should accept noIndex={false} without errors', () => {
    const { container } = renderSEO(
      <SEO title="Public Page" description="Public content" noIndex={false} />
    )
    expect(container).toBeTruthy()
  })

  it('should not require noIndex prop', () => {
    const { container } = renderSEO(
      <SEO title="Regular Page" description="Regular content" />
    )
    expect(container).toBeTruthy()
  })

  it('should handle special characters in title', () => {
    const { container } = renderSEO(
      <SEO title="Product & Services | Aura" description="Test" />
    )
    expect(container).toBeTruthy()
  })

  it('should handle empty title gracefully', () => {
    const { container } = renderSEO(
      <SEO title="" description="Test" />
    )
    expect(container).toBeTruthy()
  })

  it('should handle canonical URL', () => {
    const { container } = renderSEO(
      <SEO
        title="Test"
        description="Test"
        canonical="https://example.com/test"
      />
    )
    expect(container).toBeTruthy()
  })

  it('should handle OG tags', () => {
    const { container } = renderSEO(
      <SEO
        title="Test"
        description="Test"
        ogImage="https://example.com/image.jpg"
        ogType="product"
      />
    )
    expect(container).toBeTruthy()
  })

  it('should work for checkout page with noindex', () => {
    const { container } = renderSEO(
      <SEO title="Checkout" description="Secure checkout" noIndex={true} />
    )
    expect(container).toBeTruthy()
  })

  it('should work for account page with noindex', () => {
    const { container } = renderSEO(
      <SEO title="My Account" description="Account page" noIndex={true} />
    )
    expect(container).toBeTruthy()
  })

  it('should work for order confirmation page with noindex', () => {
    const { container } = renderSEO(
      <SEO
        title="Order Confirmation"
        description="Confirmation page"
        noIndex={true}
      />
    )
    expect(container).toBeTruthy()
  })

  it('should work for public product page without noindex', () => {
    const { container } = renderSEO(
      <SEO
        title="Beautiful Ring"
        description="Handcrafted ring"
        ogImage="https://example.com/ring.jpg"
      />
    )
    expect(container).toBeTruthy()
  })

  it('should not throw with missing optional props', () => {
    expect(() => {
      renderSEO(<SEO title="Test" description="Test" />)
    }).not.toThrow()
  })

  it('should handle very long titles', () => {
    const longTitle = 'A'.repeat(200)
    const { container } = renderSEO(
      <SEO title={longTitle} description="Test" />
    )
    expect(container).toBeTruthy()
  })

  it('should handle long descriptions', () => {
    const longDesc = 'B'.repeat(500)
    const { container } = renderSEO(
      <SEO title="Test" description={longDesc} />
    )
    expect(container).toBeTruthy()
  })
})
