import React from 'react'
import { Activity, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-signal/10 border border-signal/30 flex items-center justify-center">
            <Activity size={10} className="text-signal" />
          </div>
          <span className="font-display text-xs font-bold text-slate-500">
            EQUI<span className="text-signal/60">RELIEF</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono text-slate-600">
          <span>Sarnika · 22PD31</span>
          <span className="text-slate-700">·</span>
          <span>Diravina · 22PD12</span>
          <span className="text-slate-700">·</span>
          <span>Smrithi · 22PD33</span>
        </div>

        <div className="text-[10px] font-mono text-slate-700">
          PSG College of Technology · 2025
        </div>
      </div>
    </footer>
  )
}
