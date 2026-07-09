import React, { useState, useEffect } from 'react'
import { RefreshCw, Loader2, TrendingUp, Minus } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { getDemand, getAllocation } from '../api/index.js'

const REGIONS = ['north', 'south', 'east', 'west', 'central']
const RESOURCE_COLORS = { food: '#f59e0b', water: '#38bdf8', medicine: '#ff6b6b' }

// Region positions on a conceptual India map grid (col, row)
const REGION_POS = {
  north:   { x: '50%',  y: '12%' },
  south:   { x: '50%',  y: '78%' },
  east:    { x: '78%',  y: '45%' },
  west:    { x: '22%',  y: '45%' },
  central: { x: '50%',  y: '45%' },
}

function UrgencyBadge({ urgency }) {
  const color = urgency > 0.7 ? '#ff6b6b' : urgency > 0.4 ? '#f59e0b' : '#00e5a0'
  const label = urgency > 0.7 ? 'CRITICAL' : urgency > 0.4 ? 'HIGH' : 'MODERATE'
  return (
    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}35` }}>
      {label}
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs font-mono">
      <div className="text-white font-bold mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function RlDashboard() {
  const [demand,     setDemand]     = useState(null)
  const [allocation, setAllocation] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [selected,   setSelected]   = useState(null)

  async function fetchData() {
    setLoading(true)
    try {
      const d = await getDemand()
      setDemand(d)
      const a = await getAllocation(d)
      setAllocation(a)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const handleDemandUpdate = () => { fetchData() }
    window.addEventListener('equirelief:demand-updated', handleDemandUpdate)
    return () => window.removeEventListener('equirelief:demand-updated', handleDemandUpdate)
  }, [])

  // Prepare bar chart data
  const barData = REGIONS.map(r => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    'Food Need':   demand?.[r]?.need?.food     ?? 0,
    'Water Need':  demand?.[r]?.need?.water    ?? 0,
    'Med Need':    demand?.[r]?.need?.medicine ?? 0,
    'Food Alloc':  allocation?.allocation?.[r]?.food     ?? 0,
    'Water Alloc': allocation?.allocation?.[r]?.water    ?? 0,
    'Med Alloc':   allocation?.allocation?.[r]?.medicine ?? 0,
  }))

  // Radar chart
  const radarData = REGIONS.map(r => ({
    region: r.charAt(0).toUpperCase() + r.slice(1),
    urgency:  ((demand?.[r]?.urgency ?? 0) * 100).toFixed(0),
    messages: demand?.[r]?.message_count ?? 0,
    totalNeed: Object.values(demand?.[r]?.need ?? {}).reduce((a, b) => a + b, 0),
  }))

  const metrics = allocation?.metrics

  return (
    <section id="rl-dashboard" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-signal tracking-widest">RL ALLOCATION DASHBOARD</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white">
              Resource Allocation
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Double DQN agent allocates food, water, and medicine across 5 regions
              using NLP-derived demand vectors.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-ink-800 hover:border-signal/20 text-xs font-mono text-slate-400 hover:text-white transition-all duration-150 disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading && !demand && (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-signal" />
          </div>
        )}

        {demand && allocation && (
          <div className="space-y-6">

            {/* Summary metrics */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Reward',   val: metrics.total_reward.toFixed(1),  unit: '',      color: '#00e5a0' },
                  { label: 'Gini Coeff.',    val: metrics.gini.toFixed(3),          unit: '',      color: '#38bdf8', note: 'lower = fairer' },
                  { label: 'Ratio Variance', val: metrics.ratio_variance.toFixed(5),unit: '',      color: '#f59e0b', note: 'lower = fairer' },
                  { label: 'Urgency Resp.',  val: (metrics.urgency_response * 100).toFixed(0), unit: '%', color: '#ff6b6b' },
                ].map(m => (
                  <div key={m.label} className="card p-4">
                    <div className="text-[10px] font-mono text-slate-500 mb-1">{m.label}</div>
                    <div className="stat-num text-xl" style={{ color: m.color }}>
                      {m.val}{m.unit}
                    </div>
                    {m.note && <div className="text-[9px] font-mono text-slate-600 mt-1">{m.note}</div>}
                    <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                      Policy: {allocation.policy}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Map + region cards */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

              {/* Schematic India map */}
              <div className="card p-4">
                <div className="text-[10px] font-mono text-slate-500 mb-3">REGION MAP</div>
                <div className="relative w-full aspect-square max-w-[260px] mx-auto">
                  {/* India silhouette outline */}
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-10">
                    <path d="M100,10 L145,30 L170,55 L165,90 L155,120 L140,150 L120,175 L100,190 L80,175 L60,150 L45,120 L35,90 L30,55 L55,30 Z"
                      fill="none" stroke="#00e5a0" strokeWidth="1" />
                  </svg>

                  {/* Connecting lines */}
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                    {REGIONS.map(r => {
                      const pos = REGION_POS[r]
                      const cx  = REGION_POS.central
                      if (r === 'central') return null
                      const x1 = parseFloat(pos.x) * 2
                      const y1 = parseFloat(pos.y) * 2
                      const x2 = parseFloat(cx.x) * 2
                      const y2 = parseFloat(cx.y) * 2
                      return (
                        <line key={r} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(0,229,160,0.1)" strokeWidth="0.5" />
                      )
                    })}
                  </svg>

                  {/* Region nodes */}
                  {REGIONS.map(r => {
                    const pos    = REGION_POS[r]
                    const d      = demand[r]
                    const alloc  = allocation.allocation[r]
                    const total  = Object.values(d.need).reduce((a, b) => a + b, 0)
                    const isSel  = selected === r
                    const urgColor = d.urgency > 0.7 ? '#ff6b6b' : d.urgency > 0.4 ? '#f59e0b' : '#00e5a0'
                    return (
                      <button key={r}
                        onClick={() => setSelected(isSel ? null : r)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
                        style={{ left: pos.x, top: pos.y }}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                            style={{
                              borderColor: isSel ? urgColor : `${urgColor}60`,
                              backgroundColor: isSel ? `${urgColor}20` : `${urgColor}08`,
                              boxShadow: isSel ? `0 0 12px ${urgColor}40` : 'none',
                            }}>
                            <span className="text-[9px] font-mono font-bold" style={{ color: urgColor }}>
                              {r.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          {/* pulse for urgent */}
                          {d.urgency > 0.7 && (
                            <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                              style={{ backgroundColor: urgColor }} />
                          )}
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 group-hover:text-slate-300">
                          {total}u
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Selected region detail */}
                {selected && demand[selected] && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-white capitalize">{selected}</span>
                      <UrgencyBadge urgency={demand[selected].urgency} />
                    </div>
                    <div className="space-y-1.5">
                      {['food','water','medicine'].map(res => {
                        const need  = demand[selected].need[res]
                        const alloc = allocation.allocation[selected][res]
                        const pct   = need > 0 ? Math.min(alloc / need, 1) : 1
                        return (
                          <div key={res}>
                            <div className="flex justify-between text-[10px] font-mono mb-0.5">
                              <span className="text-slate-400">{res}</span>
                              <span style={{ color: RESOURCE_COLORS[res] }}>{alloc}/{need}</span>
                            </div>
                            <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct * 100}%`, backgroundColor: RESOURCE_COLORS[res] }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-600">
                      {demand[selected].message_count} messages processed
                    </div>
                  </div>
                )}
              </div>

              {/* Bar chart — need vs allocation */}
              <div className="card p-4">
                <div className="text-[10px] font-mono text-slate-500 mb-4">DEMAND vs ALLOCATION BY REGION</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} barGap={2} barCategoryGap="25%">
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#94a3b8' }} />
                    <Bar dataKey="Food Need"   fill="#f59e0b" opacity={0.35} radius={[2,2,0,0]} />
                    <Bar dataKey="Food Alloc"  fill="#f59e0b" opacity={0.9}  radius={[2,2,0,0]} />
                    <Bar dataKey="Water Need"  fill="#38bdf8" opacity={0.35} radius={[2,2,0,0]} />
                    <Bar dataKey="Water Alloc" fill="#38bdf8" opacity={0.9}  radius={[2,2,0,0]} />
                    <Bar dataKey="Med Need"    fill="#ff6b6b" opacity={0.35} radius={[2,2,0,0]} />
                    <Bar dataKey="Med Alloc"   fill="#ff6b6b" opacity={0.9}  radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-[9px] font-mono text-slate-600 mt-1">
                  Faded bars = need · Solid bars = allocated (EquiRelief DQN)
                </div>
              </div>
            </div>

            {/* Radar chart */}
            <div className="card p-4">
              <div className="text-[10px] font-mono text-slate-500 mb-4">REGION URGENCY PROFILE</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="region"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Radar name="Urgency %" dataKey="urgency"
                    stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.15} strokeWidth={1.5} />
                  <Radar name="Total Need" dataKey="totalNeed"
                    stroke="#00e5a0" fill="#00e5a0" fillOpacity={0.1} strokeWidth={1.5} />
                  <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>
    </section>
  )
}
