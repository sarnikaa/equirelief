import React, { useState } from 'react'
import { Send, Loader2, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import { processNlp, USE_MOCK } from '../api/index.js'

const SAMPLE_MESSAGES = [
  { label: 'Hinglish', text: 'Need food and water urgently in Chennai flood areas. Bahut log phanse hain.' },
  { label: 'English',  text: 'Cyclone survivors in coastal areas need medicine and clean water immediately.' },
  { label: 'Tamil',    text: 'வெள்ளப்பாதிப்பு பகுதிகளில் உணவு மற்றும் மருந்து தேவை.' },
  { label: 'Hinglish', text: 'Flood mein ghar doob gaya. Khana aur paani chahiye north camp mein.' },
]

const LANG_COLORS = {
  en: '#38bdf8', hi: '#a78bfa', ta: '#f59e0b',
  hinglish: '#00e5a0', tanglish: '#ff6b6b',
}

const RESOURCE_COLORS = {
  food: '#f59e0b', water: '#38bdf8', medicine: '#ff6b6b',
}

export default function NlpDemo() {
  const [input,   setInput]   = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [activeStage, setActiveStage] = useState(null)

  async function handleSubmit() {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    setActiveStage(null)
    try {
      const data = await processNlp(input.trim())
      setResult(data)
      window.dispatchEvent(new CustomEvent('equirelief:demand-updated', {
        detail: {
          region: data.region,
          demandContribution: data.demand_contribution,
        },
      }))
    } catch (e) {
      setError(USE_MOCK ? 'Unexpected error in mock mode.' : `Backend error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="nlp-demo" className="py-24 px-6 bg-ink-900/40">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-sky-data tracking-widest">NLP PIPELINE DEMO</span>
            {USE_MOCK && (
              <span className="tag border-amber-alert/30 text-amber-alert bg-amber-alert/5">MOCK MODE</span>
            )}
          </div>
          <h2 className="font-display text-3xl font-bold text-white">
            Message → Demand Vector
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Paste a disaster message in any of the 5 supported languages. Watch the 10-stage pipeline process it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Input */}
          <div className="space-y-4">
            {/* Sample messages */}
            <div>
              <div className="text-[10px] font-mono text-slate-500 mb-2 tracking-wide">SAMPLE MESSAGES</div>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_MESSAGES.map((s, i) => (
                  <button key={i}
                    onClick={() => setInput(s.text)}
                    className="text-left px-3 py-2 rounded-lg border border-white/5 bg-ink-800 hover:border-signal/20 hover:bg-ink-700 transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ color: LANG_COLORS[s.label.toLowerCase()], backgroundColor: `${LANG_COLORS[s.label.toLowerCase()]}15`, border: `1px solid ${LANG_COLORS[s.label.toLowerCase()]}30` }}>
                        {s.label}
                      </span>
                      <span className="text-xs text-slate-400 truncate group-hover:text-slate-200 transition-colors">{s.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <div className="text-[10px] font-mono text-slate-500 mb-2 tracking-wide">INPUT MESSAGE</div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit() }}
                placeholder="Type or paste a disaster message here…"
                rows={5}
                className="w-full bg-ink-800 border border-white/8 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 font-body resize-none focus:outline-none focus:border-signal/30 transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-slate-600">⌘ + Enter to run</span>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-signal text-ink-950 text-xs font-semibold hover:bg-signal-dim transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {loading ? 'Processing…' : 'Run Pipeline'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-coral/5 border border-coral/20 text-coral text-xs">
                <AlertTriangle size={13} />
                {error}
              </div>
            )}
          </div>

          {/* Right — Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="h-full min-h-[300px] flex items-center justify-center rounded-lg border border-white/5 bg-ink-800/50">
                <div className="text-center text-slate-600">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-xs font-mono">Run the pipeline to see results</div>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[300px] flex items-center justify-center rounded-lg border border-signal/10 bg-signal/5">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin text-signal mx-auto mb-3" />
                  <div className="text-xs font-mono text-signal">Running 10-stage pipeline…</div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3 animate-slide-up">
                {/* Top metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="card p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-500 mb-1">LANGUAGE</div>
                    <div className="text-sm font-mono font-bold"
                      style={{ color: LANG_COLORS[result.detected_lang] || '#e2e8f0' }}>
                      {result.detected_lang.toUpperCase()}
                    </div>
                  </div>
                  <div className="card p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-500 mb-1">REGION</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {result.region.toUpperCase()}
                    </div>
                  </div>
                  <div className="card p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-500 mb-1">URGENCY</div>
                    <div className="text-sm font-mono font-bold"
                      style={{ color: result.urgency > 0.7 ? '#ff6b6b' : result.urgency > 0.4 ? '#f59e0b' : '#00e5a0' }}>
                      {(result.urgency * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Resources detected */}
                <div className="card p-3">
                  <div className="text-[10px] font-mono text-slate-500 mb-2">RESOURCES DETECTED</div>
                  <div className="flex gap-2 flex-wrap">
                    {['food','water','medicine'].map(r => (
                      <span key={r}
                        className="text-xs px-2.5 py-1 rounded-md font-mono font-semibold"
                        style={result.resources.includes(r)
                          ? { color: RESOURCE_COLORS[r], backgroundColor: `${RESOURCE_COLORS[r]}18`, border: `1px solid ${RESOURCE_COLORS[r]}40` }
                          : { color: '#374151', backgroundColor: '#111620', border: '1px solid #1a2130' }
                        }>
                        {r}
                        {result.resources.includes(r) ? ' ✓' : ' —'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* NLP Pipeline stages */}
                <div className="card p-3">
                  <div className="text-[10px] font-mono text-slate-500 mb-2">PIPELINE STAGES</div>
                  <div className="space-y-1">
                    {result.pipeline_stages.map((s, i) => (
                      <div key={i}
                        onClick={() => setActiveStage(activeStage === i ? null : i)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <CheckCircle2 size={11} className="text-signal flex-shrink-0" />
                        <span className="text-[11px] font-mono text-slate-400 w-36 flex-shrink-0">{s.stage}</span>
                        <ChevronRight size={10} className="text-slate-600 flex-shrink-0" />
                        <span className="text-[11px] text-slate-300 truncate">{s.output}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demand contribution */}
                <div className="card p-3">
                  <div className="text-[10px] font-mono text-slate-500 mb-2">DEMAND CONTRIBUTION → {result.region.toUpperCase()}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(result.demand_contribution).map(([res, val]) => (
                      <div key={res} className="text-center">
                        <div className="text-lg font-mono font-bold"
                          style={{ color: val > 0 ? RESOURCE_COLORS[res] : '#374151' }}>
                          +{val}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">{res}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
