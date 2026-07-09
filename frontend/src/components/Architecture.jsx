import React, { useState } from 'react'
import { ChevronRight, Database, Brain, BarChart3, GitBranch } from 'lucide-react'

const NLP_STAGES = [
  { id: 1,  label: 'Data Collection',        sub: 'CrisisNLP · HumAID · L3Cube · FIRE',     color: '#38bdf8' },
  { id: 2,  label: 'Language Detection',     sub: 'Script analysis + langdetect',            color: '#38bdf8' },
  { id: 3,  label: 'Text Normalisation',     sub: 'Unicode NFC · URL strip · IndicNLP',      color: '#38bdf8' },
  { id: 4,  label: 'Tokenisation',           sub: 'mBERT WordPiece tokeniser',               color: '#38bdf8' },
  { id: 5,  label: 'Multilingual Embedding', sub: 'mBERT (primary) · IndicBERT (secondary)', color: '#a78bfa' },
  { id: 6,  label: 'NER + Keyword',          sub: 'mBERT-NER-HRL + keyword fallback',        color: '#a78bfa' },
  { id: 7,  label: 'Resource Extraction',    sub: 'food · water · medicine',                 color: '#a78bfa' },
  { id: 8,  label: 'Urgency Detection',      sub: 'Fine-tuned mDeBERTa-v3',                  color: '#a78bfa' },
  { id: 9,  label: 'Cross-lingual Align',    sub: 'LaBSE semantic alignment',                color: '#f59e0b' },
  { id: 10, label: 'DBSCAN Dedup',           sub: 'Cosine dist ε=0.3 · min_samples=2',       color: '#f59e0b' },
]

const RL_COMPONENTS = [
  { label: 'State Vector',   detail: '5 regions × 7 features + 1 global = 36 dims', color: '#00e5a0' },
  { label: 'Action Space',   detail: '3 resources × 5 regions + Wait = 16 actions', color: '#00e5a0' },
  { label: 'Reward Fn',      detail: 'α·Efficiency − λ·Var(ratios) + β·Urgency − δ·Delay', color: '#00e5a0' },
  { label: 'Double DQN',     detail: 'Online (select) + Target (evaluate) networks', color: '#f59e0b' },
  { label: 'Dueling Arch',   detail: 'V(s) + A(s,a) − mean(A) streams', color: '#f59e0b' },
  { label: 'PER Buffer',     detail: 'SumTree O(log n) · α=0.6 · β annealed', color: '#f59e0b' },
  { label: 'n-Step TD',      detail: 'n=3 discounted return · γ=0.99', color: '#f59e0b' },
]

export default function Architecture() {
  const [hoveredNlp, setHoveredNlp] = useState(null)
  const [hoveredRl,  setHoveredRl]  = useState(null)

  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={14} className="text-signal" />
            <span className="text-xs font-mono text-signal tracking-widest">SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white">
            NLP → RL Pipeline
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            10-stage multilingual NLP pipeline feeds demand vectors directly into a Double DQN agent.
            The urgency and need scores from NLP are core inputs to the RL state vector.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">

          {/* NLP Pipeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={13} className="text-sky-data" />
              <span className="text-xs font-mono text-sky-data tracking-wide">NLP PIPELINE (10 stages)</span>
            </div>
            <div className="space-y-1.5">
              {NLP_STAGES.map((stage, i) => (
                <div
                  key={stage.id}
                  onMouseEnter={() => setHoveredNlp(stage.id)}
                  onMouseLeave={() => setHoveredNlp(null)}
                  className="pipeline-node px-3 py-2.5 cursor-default"
                  style={{
                    borderColor: hoveredNlp === stage.id ? `${stage.color}55` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono w-4 text-slate-600 flex-shrink-0">
                      {String(stage.id).padStart(2, '0')}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stage.color, opacity: 0.6 }} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200">{stage.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{stage.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow + handoff */}
          <div className="flex flex-col items-center justify-center lg:pt-20 gap-3">
            <div className="hidden lg:flex flex-col items-center gap-2">
              <div className="w-px h-12 bg-gradient-to-b from-sky-data/30 to-signal/60" />
              <div className="px-3 py-2 rounded-lg border border-signal/30 bg-signal/5 text-center">
                <div className="text-[10px] font-mono text-signal">DEMAND VECTOR</div>
                <div className="text-[9px] text-slate-500 mt-0.5">need · urgency</div>
              </div>
              <ChevronRight size={16} className="text-signal rotate-90" />
            </div>
          </div>

          {/* RL Agent */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={13} className="text-signal" />
              <span className="text-xs font-mono text-signal tracking-wide">RL AGENT (Double DQN)</span>
            </div>

            {/* MDP summary card */}
            <div className="card-highlight p-4 mb-3 rounded-lg">
              <div className="text-[10px] font-mono text-signal mb-2 tracking-wide">REWARD FUNCTION</div>
              <code className="text-xs text-amber-alert font-mono leading-relaxed">
                R = α·EffGain<br />
                {'  '}− λ·Var(service_ratios)<br />
                {'  '}+ β·urgency_bonus<br />
                {'  '}− δ·delay_penalty
              </code>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {[['α','1.0'],['λ','0.5'],['β','0.3'],['δ','0.1']].map(([k,v]) => (
                  <div key={k} className="text-center bg-ink-700 rounded p-1">
                    <div className="text-[9px] text-slate-500 font-mono">{k}</div>
                    <div className="text-[11px] font-mono text-white font-bold">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {RL_COMPONENTS.map((comp) => (
                <div
                  key={comp.label}
                  onMouseEnter={() => setHoveredRl(comp.label)}
                  onMouseLeave={() => setHoveredRl(null)}
                  className="pipeline-node px-3 py-2.5 cursor-default"
                  style={{
                    borderColor: hoveredRl === comp.label ? `${comp.color}55` : undefined,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: comp.color, opacity: 0.7 }} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200">{comp.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{comp.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset badges */}
        <div className="mt-12 flex items-start gap-3">
          <div className="flex items-center gap-2 mt-1">
            <Database size={12} className="text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 tracking-wide">DATASETS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['CrisisNLP','HumAID','TREC-IS','L3Cube-HingCorpus','FIRE 2021 Dravidian','Kerala Floods 2018','Chennai Floods 2015','Samanantar'].map(d => (
              <span key={d} className="tag text-slate-400 border-white/10 bg-white/[0.02]">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
