import React from 'react'
import Navbar          from './components/Navbar.jsx'
import Hero            from './components/Hero.jsx'
import Architecture    from './components/Architecture.jsx'
import NlpDemo         from './components/NlpDemo.jsx'
import RlDashboard     from './components/RlDashboard.jsx'
import Results         from './components/Results.jsx'
import OutputsGallery  from './components/OutputsGallery.jsx'
import Footer          from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-200">
      <Navbar />
      <main>
        <Hero />
        <div className="section-line" />
        <Architecture />
        <div className="section-line" />
        <NlpDemo />
        <div className="section-line" />
        <RlDashboard />
        <div className="section-line" />
        <Results />
        <div className="section-line" />
        <OutputsGallery />
      </main>
      <Footer />
    </div>
  )
}
