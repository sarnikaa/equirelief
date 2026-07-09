import React, { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Architecture', href: '#architecture' },
  { label: 'NLP Demo',     href: '#nlp-demo' },
  { label: 'RL Dashboard', href: '#rl-dashboard' },
  { label: 'Results',      href: '#results' },
  { label: 'Outputs',      href: '#outputs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-900/95 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-signal/10 border border-signal/30 flex items-center justify-center">
            <Activity size={12} className="text-signal" />
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-white">
            EQUI<span className="text-signal">RELIEF</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setActive(href)}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all duration-200 ${
                active === href
                  ? 'text-signal bg-signal/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-slow" />
          <span className="text-slate-500">PSG TECH — 2025</span>
        </div>
      </div>
    </nav>
  )
}
