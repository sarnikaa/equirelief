import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { getMetrics } from '../api/index.js'

const POLICY_COLORS = {
  'Random':           '#64748b',
  'Greedy':           '#38bdf8',
  'Equity-Greedy':    '#a78bfa',
  'EquiRelief (DQN)': '#00e5a0',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs font-mono border-white/10">
      <div className="text-slate-400 mb-1">Ep {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.value?.toFixed ? p.value.toFixed(4) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

function sampleCurves(data, n = 100) {
  if (!Array.isArray(data) || data.length === 0) return []
  const step = Math.max(1, Math.floor(data.length / n))
  return data.filter((_, i) => i % step === 0)
}

export default function Results() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('training')

  useEffect(() => {
    getMetrics()
      .then(m => {
        setMetrics({
          training_curves:   Array.isArray(m.training_curves)   ? m.training_curves   : [],
          policy_comparison: Array.isArray(m.policy_comparison) ? m.policy_comparison : [],
          nlp_metrics:       m.nlp_metrics    || {},
          ablation:          Array.isArray(m.ablation) ? m.ablation : [],
          training_summary:  m.training_summary || {},
        })
        setLoading(false)
      })
      .catch(e => {
        console.error('Metrics load error:', e)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <section id="results" className="py-24 px-6 bg-ink-900/40">
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-signal" />
      </div>
    </section>
  )

  if (!metrics) return null

  const sampledCurves = sampleCurves(metrics.training_curves, 120)
  const policyData    = metrics.policy_comparison
  const nlp           = metrics.nlp_metrics
  const ablation      = metrics.ablation
  const ts            = metrics.training_summary

  // ── NLP: extract values from real nlp_results.json structure ────────────
  // { stage2_lang_detection: { overall, per_lang }, stage6_7_region: { accuracy }, ... }
  const langAcc      = nlp?.stage2_lang_detection?.overall
  const regionAcc    = nlp?.stage6_7_region?.accuracy
  const resF1Manual  = nlp?.stage7_resource?.f1_manual
  const resF1Fig8    = nlp?.stage7_resource?.f1_figureeight
  const urgF1En      = nlp?.stage8_urgency?.f1_english_test
  const urgF1Multi   = nlp?.stage8_urgency?.f1_multilingual
  const perLangObj   = nlp?.stage8_urgency?.per_lang || {}
  const perLangArr   = Object.entries(perLangObj).map(([lang, f1]) => ({ lang, f1: Number(f1) }))

  const TABS = [
    { id: 'training', label: 'Training Curves' },
    { id: 'policy',   label: 'Policy Comparison' },
    { id: 'nlp',      label: 'NLP Metrics' },
    { id: 'ablation', label: 'Ablation Study' },
  ]

  return (
    <section id="results" className="py-24 px-6 bg-ink-900/40">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-signal tracking-widest">RESULTS & METRICS</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white">Evaluation Results</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Full evaluation across NLP pipeline accuracy and RL policy performance.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-ink-800 rounded-lg w-fit">
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-150 ${
                tab === t.id ? 'bg-signal text-ink-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Training Curves ── */}
        {tab === 'training' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">

            {/* Episode Reward */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-1">EPISODE REWARD</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="stat-num text-2xl text-signal">
                  {ts?.final_mean_reward != null ? ts.final_mean_reward.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-slate-500 font-mono">final avg · best: {ts?.best_reward?.toFixed(1) ?? '—'}</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={sampledCurves}>
                  <XAxis dataKey="episode" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line dataKey="reward" stroke="#00e5a0" dot={false} strokeWidth={1.5} />
                  <ReferenceLine y={72} stroke="#475569" strokeDasharray="3 3" label={{ value: 'start', fill: '#475569', fontSize: 9 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gini */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-1">GINI COEFFICIENT ↓ (lower = fairer)</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="stat-num text-2xl text-sky-data">
                  {ts?.final_mean_gini != null ? ts.final_mean_gini.toFixed(4) : '—'}
                </span>
                <span className="text-xs text-slate-500 font-mono">from 0.0138 (ep 100)</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={sampledCurves}>
                  <XAxis dataKey="episode" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line dataKey="gini" stroke="#38bdf8" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ratio Variance */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-1">SERVICE RATIO VARIANCE ↓</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="stat-num text-2xl text-amber-alert">
                  {ts?.final_mean_var != null ? ts.final_mean_var.toFixed(6) : '—'}
                </span>
                <span className="text-xs text-slate-500 font-mono">from 0.00087 (ep 100)</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={sampledCurves}>
                  <XAxis dataKey="episode" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 9, tickFormatter: v => v.toFixed(5) }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line dataKey="ratio_var" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Training Summary — real config values */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-4">TRAINING SUMMARY</div>
              <div className="space-y-3">
                {[
                  { label: 'Episodes',          val: ts?.n_episodes?.toLocaleString()          ?? '2,000', color: '#e2e8f0' },
                  { label: 'Best reward',        val: ts?.best_reward?.toFixed(2)               ?? '—',    color: '#00e5a0' },
                  { label: 'Final mean reward',  val: ts?.final_mean_reward?.toFixed(2)         ?? '—',    color: '#00e5a0' },
                  { label: 'Final Gini',         val: ts?.final_mean_gini?.toFixed(4)           ?? '—',    color: '#38bdf8' },
                  { label: 'Final Var',          val: ts?.final_mean_var?.toFixed(6)            ?? '—',    color: '#f59e0b' },
                  { label: 'Learning rate',      val: ts?.lr != null ? ts.lr.toString() : '1e-4',          color: '#e2e8f0' },
                  { label: 'Discount (γ)',        val: ts?.gamma?.toString()                    ?? '0.99', color: '#e2e8f0' },
                  { label: 'Target sync',        val: ts?.target_update ? `every ${ts.target_update} steps` : 'every 500 steps', color: '#e2e8f0' },
                  { label: 'Replay buffer',      val: ts?.buffer_size?.toLocaleString()         ?? '50,000', color: '#e2e8f0' },
                  { label: 'n-Step TD',          val: ts?.n_step ? `n = ${ts.n_step}` : 'n = 3', color: '#e2e8f0' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Policy Comparison ── */}
        {tab === 'policy' && (
          <div className="space-y-4 animate-slide-up">
            {policyData.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 font-mono text-sm">
                No policy comparison data found in rl_results.json
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Reward bar */}
                  <div className="card p-4">
                    <div className="text-[10px] font-mono text-slate-500 mb-4">CUMULATIVE REWARD ↑</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={policyData} layout="vertical">
                        <XAxis type="number" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="policy" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="reward" radius={[0,3,3,0]} fill="#00e5a0"
                          label={{ position: 'right', fill: '#94a3b8', fontSize: 9, formatter: v => v?.toFixed(1) }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gini bar */}
                  <div className="card p-4">
                    <div className="text-[10px] font-mono text-slate-500 mb-4">GINI COEFFICIENT ↓</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={policyData} layout="vertical">
                        <XAxis type="number" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="policy" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="gini" radius={[0,3,3,0]} fill="#38bdf8"
                          label={{ position: 'right', fill: '#94a3b8', fontSize: 9, formatter: v => v?.toFixed(4) }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Full table */}
                <div className="card overflow-hidden">
                  <div className="text-[10px] font-mono text-slate-500 px-4 py-3 border-b border-white/5">
                    FULL POLICY COMPARISON (100 evaluation episodes)
                  </div>
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Policy','Reward ↑','Gini ↓','Ratio Var ↓','Urgency (within 5 steps) ↑'].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {policyData.map((p, i) => (
                        <tr key={p.policy}
                          className={`border-b border-white/5 ${i === policyData.length - 1 ? 'bg-signal/5' : ''}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: POLICY_COLORS[p.policy] || '#94a3b8' }} />
                              <span className={i === policyData.length - 1 ? 'text-signal font-bold' : 'text-slate-300'}>
                                {p.policy}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-white">{p.reward?.toFixed(2) ?? '—'}</td>
                          <td className="px-4 py-2.5 text-white">{p.gini?.toFixed(4) ?? '—'}</td>
                          <td className="px-4 py-2.5 text-white">{p.ratio_var?.toFixed(6) ?? '—'}</td>
                          <td className="px-4 py-2.5 text-white">
                            {p.urgency != null ? `${(p.urgency * 100).toFixed(0)}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── NLP Metrics ── */}
        {tab === 'nlp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">

            {/* Summary */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-4">PIPELINE ACCURACY SUMMARY</div>
              <div className="space-y-3">
                {[
                  { label: 'Language Detection (Stage 2)',      val: langAcc,     pct: true,  color: '#00e5a0' },
                  { label: 'Region Detection (Stage 6/7)',      val: regionAcc,   pct: true,  color: '#38bdf8' },
                  { label: 'Resource F1 — Manual (Stage 7)',    val: resF1Manual, pct: false, color: '#f59e0b' },
                  { label: 'Resource F1 — Figure Eight (Stage 7)', val: resF1Fig8, pct: false, color: '#f59e0b' },
                  { label: 'Urgency F1 — English (Stage 8)',    val: urgF1En,     pct: false, color: '#a78bfa' },
                  { label: 'Urgency F1 — Multilingual (Stage 8)', val: urgF1Multi, pct: false, color: '#ff6b6b', note: 'Hinglish/Tanglish harder — known gap' },
                ].filter(m => m.val != null).map(m => {
                  const display  = m.pct ? `${(m.val * 100).toFixed(1)}%` : m.val.toFixed(3)
                  const barWidth = m.pct ? m.val * 100 : m.val * 100
                  return (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-slate-400">{m.label}</span>
                        <span className="text-[11px] font-bold font-mono" style={{ color: m.color }}>{display}</span>
                      </div>
                      <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.min(barWidth, 100)}%`, backgroundColor: m.color }} />
                      </div>
                      {m.note && <div className="text-[9px] font-mono text-slate-600 mt-0.5">{m.note}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Per-language F1 */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-4">URGENCY F1 BY LANGUAGE (STAGE 8)</div>
              {perLangArr.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={perLangArr}>
                      <XAxis dataKey="lang" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,1]} tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="f1" radius={[3,3,0,0]} fill="#00e5a0"
                        label={{ position: 'top', fill: '#64748b', fontSize: 9, formatter: v => v?.toFixed(2) }} />
                      <ReferenceLine y={0.5} stroke="#374151" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-[9px] font-mono text-slate-600 mt-1">
                    Code-mixed languages (Hinglish, Tanglish) show lower F1 — key research gap identified
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-xs font-mono">No per-language data found.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Ablation Study ── */}
        {tab === 'ablation' && (
          <div className="space-y-4 animate-slide-up">
            {ablation.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 font-mono text-sm">
                No ablation data found in rl_results.json
              </div>
            ) : (
              <>
                <div className="card p-4">
                  <div className="text-[10px] font-mono text-slate-500 mb-4">
                    ABLATION — CONTRIBUTION OF EACH ENHANCEMENT
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ablation}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="reward" radius={[3,3,0,0]} fill="#00e5a0"
                        label={{ position: 'top', fill: '#64748b', fontSize: 10, formatter: v => v?.toFixed(1) }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ablation.map((a, i) => {
                    const prev = i > 0 ? ablation[i-1].reward : null
                    const gain = prev ? ((a.reward - prev) / Math.abs(prev) * 100).toFixed(1) : null
                    const gainColor = gain ? (parseFloat(gain) >= 0 ? '#00e5a0' : '#ff6b6b') : '#64748b'
                    return (
                      <div key={a.name} className="card p-3">
                        <div className="text-[10px] font-mono text-slate-500 mb-1">{a.name}</div>
                        <div className="stat-num text-xl text-signal">{a.reward?.toFixed(1) ?? '—'}</div>
                        {gain && (
                          <div className="text-[10px] font-mono mt-1" style={{ color: gainColor }}>
                            {parseFloat(gain) >= 0 ? '+' : ''}{gain}% over prev
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="card p-4">
                  <div className="text-[10px] font-mono text-slate-500 mb-3">ENHANCEMENT EXPLANATIONS</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Double DQN', why: 'Separate select/evaluate networks removes Q-value overestimation bias' },
                      { name: 'PER',        why: 'Prioritised sampling of high-TD-error transitions — rare emergencies replayed more often' },
                      { name: 'n-Step TD',  why: 'Propagates fairness consequences n=3 steps back, accelerating equity learning' },
                    ].map(e => (
                      <div key={e.name} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-ink-700/50">
                        <span className="text-xs font-mono font-bold text-signal w-24 flex-shrink-0">{e.name}</span>
                        <span className="text-xs text-slate-400">{e.why}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </section>
  )
}