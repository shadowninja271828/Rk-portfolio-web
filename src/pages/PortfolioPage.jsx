import { usePortfolio } from '../hooks/usePortfolio.js'
import { useSiteSettings } from '../hooks/useSiteSettings.js'
import ContactLinks from '../components/ContactLinks.jsx'
import Gallery from '../components/Gallery.jsx'
import Hero from '../components/Hero.jsx'

export default function PortfolioPage() {
  const portfolio = usePortfolio()
  const contact = useSiteSettings()

  return (
    <>
      <Hero settings={contact.settings} />
      <Gallery {...portfolio} onRetry={portfolio.refresh} />
      <ContactLinks settings={contact.settings} error={contact.error} />
    </>
  )
}
