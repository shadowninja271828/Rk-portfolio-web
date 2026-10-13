import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="ambient-glow" aria-hidden="true" />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
