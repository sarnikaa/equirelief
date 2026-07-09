import React, { useEffect, useState } from 'react'
import { ArrowDown, Zap, Shield, Globe } from 'lucide-react'

const FEATURES = [
  { icon: Globe,  label: '5 Languages',    sub: 'EN · HI · TA · Hinglish · Tanglish' },
  { icon: Zap,    label: 'Double DQN',     sub: 'PER + n-Step TD + Dueling' },
  { icon: Shield, label: 'Equity-Driven',  sub: 'Var(service ratios) minimised' },
]

const TAGLINES = [
  'Multilingual disaster message processing.',
  'Equity-aware resource allocation.',
  'Reinforcement learning for crisis response.',
]

export default function Hero() {
  const [lineIdx, setLineIdx]   = useState(0)
  const [charIdx, setCharIdx]   = useState(0)
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    const target = TAGLINES[lineIdx]
    if (charIdx < target.length) {
      const t = setTimeout(() => {
        setDisplayed(target.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, 38)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setLineIdx(i => (i + 1) % TAGLINES.length)
        setCharIdx(0)
        setDisplayed('')
      }, 2400)
      return () => clearTimeout(t)
    }
  }, [charIdx, lineIdx])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-overlay">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00e5a0 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-signal/20 bg-signal/5 animate-slide-up opacity-0">
          <span className="w-1.5 h-1.5 rounded-full bg-signal" />
          <span className="text-xs font-mono text-signal tracking-widest">PSG TECH · 22PD · NLP + RL LAB</span>
        </div>

        {/* Title */}
        <h1 className="animate-slide-up opacity-0 delay-100 mb-4">
          <span className="block font-display text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
            EQUI
          </span>
          <span className="block font-display text-5xl md:text-7xl font-bold tracking-tight leading-none"
            style={{ color: '#00e5a0', textShadow: '0 0 40px rgba(0,229,160,0.3)' }}>
            RELIEF
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-slide-up opacity-0 delay-200 text-slate-400 text-sm font-mono mb-2 tracking-wide">
          Equity-Driven Disaster Resource Allocation System
        </p>

        {/* Typewriter */}
        <div className="animate-slide-up opacity-0 delay-300 h-8 flex items-center justify-center mb-10">
          <span className="text-slate-300 font-body text-lg cursor-blink">{displayed}</span>
        </div>

        {/* Feature pills */}
        <div className="animate-slide-up opacity-0 delay-400 flex flex-wrap justify-center gap-3 mb-12">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 card rounded-lg"
            >
              <div className="w-7 h-7 rounded bg-signal/10 border border-signal/20 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-signal" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">{label}</div>
                <div className="text-[10px] text-slate-500 font-mono">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="animate-slide-up opacity-0 delay-500 flex items-center justify-center gap-4 text-xs font-mono text-slate-600">
          {['Sarnika · 22PD31', 'Diravina · 22PD12', 'Smrithi · 22PD33'].map(name => (
            <span key={name}
              className="px-2 py-1 rounded border border-white/5 bg-white/[0.02]">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <a href="#architecture"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 hover:text-signal transition-colors duration-200 group">
        <span className="text-[10px] font-mono tracking-widest">EXPLORE</span>
        <ArrowDown size={14} className="animate-bounce group-hover:text-signal" />
      </a>
    </section>
  )
}
