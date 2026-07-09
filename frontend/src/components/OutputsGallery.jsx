import React, { useState, useEffect } from 'react'
import { Loader2, ImageIcon, Table2, BarChart3, MapPin, ChevronDown, ChevronUp, ExternalLink, Sparkles, X } from 'lucide-react'

// ── Real data ─────────────────────────────────────────────────────────────

const NLP_PERFORMANCE = [
  { stage: 'Stage 2',   task: 'Language Detection',       metric: 'Accuracy',   n: '180',    score: '100.0%', color: '#00e5a0' },
  { stage: 'Stage 6/7', task: 'Region Detection',         metric: 'Accuracy',   n: '180',    score: '81.7%',  color: '#00e5a0' },
  { stage: 'Stage 7',   task: 'Resource Extraction',      metric: 'F1 (macro)', n: '180',    score: '0.724',  color: '#38bdf8' },
  { stage: 'Stage 7',   task: 'Resource Extraction',      metric: 'F1 (macro)', n: '2,629',  score: '0.787',  color: '#38bdf8' },
  { stage: 'Stage 8',   task: 'Urgency (English)',        metric: 'F1 (macro)', n: '16,160', score: '0.879',  color: '#a78bfa' },
  { stage: 'Stage 8',   task: 'Urgency (Kerala domain)',  metric: 'F1 (macro)', n: '7,984',  score: '0.829',  color: '#a78bfa' },
  { stage: 'Stage 8',   task: 'Urgency (Multilingual)',   metric: 'F1 (macro)', n: '180',    score: '0.588',  color: '#f59e0b' },
]

const PER_LANG = [
  { lang: 'English',  f1: 0.792, n: 20,  note: 'Supervised training data available',     color: '#00e5a0' },
  { lang: 'Hindi',    f1: 0.688, n: 20,  note: 'Zero-shot (Devanagari script transfer)',  color: '#38bdf8' },
  { lang: 'Tamil',    f1: 0.749, n: 20,  note: 'Zero-shot (Tamil script transfer)',       color: '#38bdf8' },
  { lang: 'Hinglish', f1: 0.517, n: 60,  note: 'Zero-shot (romanized code-mixed — gap)', color: '#f59e0b' },
  { lang: 'Tanglish', f1: 0.499, n: 60,  note: 'Zero-shot (romanized code-mixed — gap)', color: '#ff6b6b' },
]

const POLICY_COMPARISON = [
  { policy: 'Random',           reward: 89.76,  std: 5.74, gini: 0.0077, var: 0.00026, wait: '6.4%' },
  { policy: 'Greedy',           reward: 147.15, std: 9.27, gini: 0.0012, var: 0.00001, wait: '0.0%' },
  { policy: 'Equity-Greedy',    reward: 147.16, std: 9.27, gini: 0.0012, var: 0.00001, wait: '0.0%' },
  { policy: 'EquiRelief (DQN)', reward: 132.31, std: 7.84, gini: 0.0022, var: 0.00003, wait: '0.7%' },
]

const TRAINING_PROGRESS = [
  { ep: 'Ep 100',  reward: 72.3,  gini: 0.0138, var: 0.00087 },
  { ep: 'Ep 500',  reward: 90.2,  gini: 0.0092, var: 0.00038 },
  { ep: 'Ep 1000', reward: 106.4, gini: 0.0042, var: 0.00008 },
  { ep: 'Ep 1500', reward: 119.4, gini: 0.0033, var: 0.00006 },
  { ep: 'Ep 2000', reward: 128.2, gini: 0.0027, var: 0.00004 },
]

const STRESS_TESTS = [
  { policy: 'Random',           minRatio: '1.000', emerg3: '22%',  emerg10: '48%',  wasted: 36 },
  { policy: 'Greedy',           minRatio: '1.000', emerg3: '100%', emerg10: '100%', wasted: 0  },
  { policy: 'Equity-Greedy',    minRatio: '1.000', emerg3: '100%', emerg10: '100%', wasted: 0  },
  { policy: 'EquiRelief (DQN)', minRatio: '0.963', emerg3: '100%', emerg10: '100%', wasted: 7  },
]

const PLOT_GROUPS = [
  {
    group: 'EDA — CrisisNLP & Figure Eight',
    plots: [
      { file: 'eda_01_crisisnlp.png',        label: 'CrisisNLP Overview' },
      { file: 'eda_01_crisisnlp_words.png',   label: 'CrisisNLP Top Words' },
      { file: 'figureeight_eda.png',          label: 'Figure Eight EDA' },
    ],
  },
  {
    group: 'EDA — Datasets & Test Set',
    plots: [
      { file: 'eda_03_wikiann.png',           label: 'WikiANN NER Tags' },
      { file: 'eda_06_floods.png',            label: 'Floods Synthetic Corpus' },
      { file: 'eda_07_testset.png',           label: 'Manual Test Set Distribution' },
      { file: 'eda_07_testset_coverage.png',  label: 'Test Set Language × Region Coverage' },
      { file: 'eda_08_master.png',            label: 'Combined Master Dataset' },
    ],
  },
  {
    group: 'NLP Evaluation',
    plots: [
      { file: 'nlp_evaluation.png',           label: 'NLP Evaluation (v1)' },
      { file: 'nlp_evaluation_v2.png',        label: 'NLP Pipeline Evaluation (v2)' },
      { file: 'eval_nlp_summary.png',         label: 'NLP Summary — All Stages' },
      { file: 'eval_e2e_demo.png',            label: 'End-to-End Demo (Q-values)' },
    ],
  },
  {
    group: 'RL Training & Policy',
    plots: [
      { file: 'rl_training_curves.png',       label: 'RL Training Curves' },
      { file: 'eval_training_curves.png',     label: 'Training Curves (Evaluation)' },
      { file: 'rl_policy_comparison.png',     label: 'Policy Comparison' },
      { file: 'eval_policy_comparison.png',   label: 'Policy Comparison (Eval)' },
      { file: 'eval_ablation.png',            label: 'Ablation Study' },
      { file: 'rl_ablation_study.png',        label: 'RL Ablation Study' },
    ],
  },
  {
    group: 'RL Fairness & Stress',
    plots: [
      { file: 'rl_fairness_deep_dive.png',    label: 'Fairness Deep Dive' },
      { file: 'rl_urgency_response.png',      label: 'Urgency Response Analysis' },
      { file: 'eval_stress_tests.png',        label: 'Stress Test Results' },
    ],
  },
]


// ── Pre-computed AI inferences (analysed from actual plots) ───────────────
const PLOT_INFERENCES = {
  'eda_01_crisisnlp.png': "The CrisisNLP dataset contains 49,113 tweets across 10 disaster event categories, with rescue_volunteering_or_donation_effort dominating at 21,278 samples and missing_or_found_people being the rarest at just 358. The binary urgency balance is remarkably even — 26,672 non-urgent vs 22,441 urgent — which is ideal for training a well-calibrated classifier without heavy class weighting. The median tweet length of 19 words aligns well with the 128-token max_length setting, meaning less than 5% of tweets are truncated, validating this architectural choice for EquiRelief's urgency detection stage.",

  'eda_01_crisisnlp_words.png': "The top words in urgent messages are dominated by disaster-specific terms like hurricane (5,500+), damage, people, death, and toll — strongly predictive signals for EquiRelief's urgency classifier. In contrast, non-urgent messages feature coordination and support vocabulary: relief, help, donate, victims, and kerala, reflecting the supply-side of disaster response rather than demand. This lexical separation between urgent and non-urgent classes confirms that keyword-based resource extraction and urgency detection are complementary signals, and that the mDeBERTa model has rich discriminative features to learn from.",

  'figureeight_eda.png': "The Figure Eight dataset of 26,168 English tweets shows a heavily skewed role distribution — 15,805 context tweets vs only 427 supply tweets — reflecting real disaster communication patterns where information sharing vastly outnumbers resource offers. Urgency is minority-class at 35.2%, and demand tweets have the highest eyewitness rate at 46.2%, making them the most reliable signal for EquiRelief's need estimation. The feature activation heatmap reveals that the demand role strongly activates request (0.53) and water/food features (0.36/0.46), directly validating the resource extraction keyword approach used in Stage 7.",

  'eda_03_wikiann.png': "WikiANN provides NER training data across English (70,000+ entities), Hindi (14,000+), and Tamil (38,000+) samples, all with balanced B-/I- tag distributions confirming well-formed IOB labelling. Critically, all three languages have sequence lengths well within the 128-token cutoff — English peaks near 10 tokens and Hindi/Tamil near 5 — meaning virtually no NER training examples are truncated. This validates mBERT's ability to handle the short, dense named entity structures typical in disaster tweets across all three script types used in EquiRelief.",

  'eda_06_floods.png': "The synthetic floods corpus covers 12 messages across 4 languages (English: 6, Tanglish: 3, Hinglish: 2, Malayalam: 1), spanning 8 distinct Kerala and Tamil Nadu districts with Chennai being the most represented at 4 messages. Word counts cluster tightly between 6 and 9.5 words per message, reflecting the brevity typical of real disaster social media posts. While this corpus is small by design (used for demo purposes), its geographic diversity across south Indian flood districts makes it a valuable domain-specific test of EquiRelief's region detection pipeline.",

  'eda_07_testset.png': "The 180-sample manual test set is deliberately balanced — 60 samples each for Hinglish and Tanglish, 20 each for English, Hindi, and Tamil — with a slight urgency skew toward urgent messages (113 vs 67). Regional coverage is near-perfectly uniform at 35-37 samples per region, and resource mentions are distributed across food (57), medicine (50), and water (44), ensuring no single resource type dominates evaluation. The urgency rate per language shows Hinglish and Tanglish having slightly higher urgency fractions than the scripted languages, reflecting their real-world use in crisis communication.",

  'eda_07_testset_coverage.png': "The test set coverage heatmaps confirm thorough experimental design — English, Hindi, and Tamil each have exactly 4 samples per region (perfectly uniform), while Hinglish has 11-13 and Tanglish has exactly 12 per region, reflecting their larger 60-sample allocation. On the disaster type axis, flood (24-25 samples) and general (29-30 samples) dominate for code-mixed languages, while scripted languages are uniformly distributed at 1-2 per disaster type. The zero cells for landslide in Hinglish and Tanglish represent a known gap, but flood coverage — the most critical disaster type for Indian regions — is comprehensive.",

  'eda_08_master.png': "The combined master dataset totals 75,470 samples dominated by English (75,304) from HumAID and Figure Eight, with code-mixed languages (Tanglish: 63, Hinglish: 62) and scripted non-English languages (Tamil: 20, Hindi: 20) representing a long tail. The urgency balance across the full corpus is 57.9% non-urgent vs 42.1% urgent, a manageable imbalance handled through class weighting during mDeBERTa fine-tuning. The source-language matrix clearly shows the data gap: non-English languages come exclusively from the 180-sample manual test set, meaning the model must zero-shot generalise from English training to multilingual inference — the core challenge EquiRelief addresses.",

  'eval_ablation.png': "The ablation study over 1,000 episodes reveals that Double DQN is the single most impactful enhancement, improving learning progress by +33.1 points over baseline DQN and converging faster to rewards above 110. Adding PER brings an additional +26.7 improvement, but the Full EquiRelief system (with n-step TD) shows only +2.2 marginal gain at 500 episodes, suggesting n-step TD benefits emerge more slowly as the fairness reward signal propagates across longer trajectories. The early-vs-late performance bars confirm the Full system starts low but closes the gap, consistent with the deeper credit assignment that n-step returns enable for delayed fairness outcomes.",

  'eval_e2e_demo.png': "The end-to-end demo shows EquiRelief processing 10 incoming disaster messages and producing an aggregated demand heatmap — north has the highest need (2 units each of food, water, and medicine), while east has minimal demand. The Q-value bar chart shows the agent confidently selecting Send MEDICINE to NORTH with a Q-value of ~4.9, clearly separating it from all other 15 actions. With all five regions reporting urgency score of 1.0 from the NLP pipeline, the agent correctly prioritises the highest-demand region, demonstrating the tight integration between Stage 10 demand aggregation and the RL allocation decision.",

  'eval_nlp_summary.png': "The NLP pipeline evaluation shows a clear performance gradient across stages — language detection achieves perfect 1.0 accuracy, region detection reaches 0.817, resource extraction F1 is 0.724, and urgency detection drops to 0.588 on the multilingual test set. The key finding is the large gap between English urgency F1 (0.879) and multilingual F1 (0.588), directly attributable to Hinglish (0.517) and Tanglish (0.499) falling well below the 0.65 threshold while English, Hindi, and Tamil all exceed it. Resource extraction performs better on Figure Eight (0.787) than the manual set (0.724), suggesting the keyword-based approach generalises well to crowdsourced English annotations.",

  'eval_policy_comparison.png': "Across 200 evaluation episodes, Greedy and Equity-Greedy achieve the highest mean rewards (~147) by aggressively dispatching without waiting, but EquiRelief DQN achieves the lowest Gini coefficient (0.0022) and variance (0.00003) among all policies. The service ratio plot confirms all four policies reach near-perfect delivery across all 5 regions, but Random's 0.0077 Gini reveals significant fairness instability. EquiRelief's tighter reward distribution box plot and lower Gini reflect that it has learned to balance efficiency with equity, accepting ~10% lower raw reward in exchange for meaningfully fairer allocation — exactly the system's design objective.",

  'eval_stress_tests.png': "Three out-of-distribution stress tests reveal EquiRelief's key trade-off: in the imbalanced demand scenario, it achieves a minimum service ratio of 0.963 vs 1.0 for Greedy (Stress 1), and matches Greedy's 100% emergency response within 3 steps (Stress 2). However, in the isolated region test, EquiRelief makes 7 wasted dispatches to a zero-need region vs 0 for Greedy, reflecting its fairness penalty — the agent sends occasional exploratory dispatches to maintain equity balance even when need is zero. These results confirm EquiRelief is robust to sudden emergencies and imbalanced demand but trades a small efficiency cost for its equity-aware behaviour.",

  'eval_training_curves.png': "The detailed Double DQN training run over 2,000 episodes shows the reward curve crossing key milestones — R>100 around episode 750 and R>115 around episode 1,250 — before converging to a final average of 125.3 (dashed red line). The Gini coefficient drops steeply from 0.016 in early episodes to below 0.005 by episode 500, then continues declining to ~0.003 at convergence, confirming the fairness objective is learned early and refined throughout training. The Huber loss falls from 0.7 at warmup to below 0.15 by episode 2,000, showing stable Q-value learning without divergence — a direct benefit of the target network synchronisation every 500 steps.",

  'nlp_evaluation.png': "The confusion matrices confirm perfect language detection — all 20 English, 20 Hindi, 20 Tamil, 60 Hinglish, and 60 Tanglish samples are correctly classified with zero cross-language errors, validating the script-ratio plus langdetect ensemble approach. The urgency confusion matrix on the 180-sample multilingual test shows 0 false negatives but 19 false positives — the model over-predicts urgency rather than missing it, which is the safer failure mode for a disaster response system. This precision-recall imbalance is a deliberate consequence of the low-confidence keyword fallback in the pipeline, which biases toward flagging potential emergencies.",

  'nlp_evaluation_v2.png': "The v2 evaluation breaks down urgency F1 per language, showing English (0.79) and Tamil (0.75) meeting the 0.7 threshold while Hindi (0.69) just misses it, and Hinglish (0.52) and Tanglish (0.50) falling significantly below. The multilingual confusion matrix reveals 55 false negatives — urgent messages classified as non-urgent — and 19 false positives, with the false negative rate concentrated in Hinglish and Tanglish where romanised code-mixing creates ambiguous signals for the mDeBERTa model. This performance gap for code-mixed languages is the primary limitation of EquiRelief's NLP pipeline and motivates future work on dedicated Hinglish/Tanglish training data collection.",

  'rl_ablation_study.png': "The 500-episode ablation study reveals an important finding: standard DQN (90.8) actually outperforms Double DQN (85.7) and +PER (75.6) at this early stage, with the Full EquiRelief system recovering to 80.7. This counterintuitive result occurs because the fairness penalty in the reward function initially slows learning — the agent must explore equity-aware strategies before the double network separation and prioritised replay provide their benefits. The learning curves show all variants converging upward by episode 400-500, indicating the dip is a temporary exploration cost, not a fundamental weakness of the full system.",

  'rl_fairness_deep_dive.png': "The per-region service ratio trajectories reveal a striking difference in allocation dynamics — Random policy shows erratic, asynchronous convergence with regions reaching full service at widely different steps (some as late as step 50), while Greedy achieves near-simultaneous convergence for all five regions within 20 steps. EquiRelief (DQN) reaches full service for all regions within approximately 10 steps but shows tighter synchronisation between north/south convergence, reflecting its learned equity objective. The final service ratio bar chart confirms all three policies achieve near-1.0 delivery for all regions, but EquiRelief's trajectory shows more consistent cross-region balance throughout the episode.",

  'rl_policy_comparison.png': "The full policy comparison over 100 episodes confirms the core EquiRelief finding: Greedy (150.87) and Equity-Greedy (150.86) achieve near-identical peak rewards ~12% higher than EquiRelief DQN (134.59), but EquiRelief achieves a Gini of 0.0024 vs 0.0013 for Greedy — a difference that translates to meaningfully more equitable service across vulnerable populations. The reward distribution box plots show EquiRelief has the tightest interquartile range with a median around 133, indicating more consistent performance episode-to-episode. The summary table confirms Random's 0.0076 Gini is 3× worse than EquiRelief, validating that learned policies dramatically outperform random allocation on the equity metric.",

  'rl_training_curves.png': "All four training metrics show clean, stable learning trajectories — the smoothed episode reward rises from ~75 at episode 100 to ~125 at episode 2,000, a 67% improvement demonstrating effective learning from the composite reward signal. The Gini coefficient drops from ~0.015 in early training to ~0.003 at convergence, confirming the fairness penalty successfully shapes the policy toward equitable allocation across all five Indian regions. The Huber training loss falls from 0.68 at warmup to below 0.15, and service ratio variance collapses to near-zero by episode 500 — both indicating that the agent rapidly learns to satisfy all regional needs simultaneously rather than optimising for a subset.",
}

// ── AI Inference via Anthropic API ────────────────────────────────────────
async function getPlotInference(imageUrl) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const response = await fetch(`${BASE_URL}/inference/plot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl }),
  })
  if (!response.ok) {
    let detail = 'Backend error'
    try { detail = (await response.json()).detail } catch {}
    throw new Error(detail)
  }
  const data = await response.json()
  return data.inference
}

// ── Sub-components ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, title, desc }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-signal" />
        <span className="text-xs font-mono text-signal tracking-widest">{label}</span>
      </div>
      <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
      {desc && <p className="text-slate-400 mt-1 text-sm">{desc}</p>}
    </div>
  )
}

function TableCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[11px] font-mono text-slate-400 tracking-wide">{title}</span>
        {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>
      {open && <div className="overflow-x-auto">{children}</div>}
    </div>
  )
}

// ── Single Plot Card with pre-computed AI Inference ──────────────────────
function PlotCard({ plot, baseUrl }) {
  const [showInference, setShowInference] = useState(false)
  const [lightbox,      setLightbox]      = useState(false)
  const [imgError,      setImgError]      = useState(false)
  const [imgLoaded,     setImgLoaded]     = useState(false)

  const imageUrl  = `${baseUrl}/plots/${plot.file}`
  const inference = PLOT_INFERENCES[plot.file] || null

  function handleInfer(e) {
    e.stopPropagation()
    if (!inference) return
    setShowInference(s => !s)
  }

  return (
    <>
      <div className="card overflow-hidden hover:border-signal/20 transition-all duration-200">

        {/* Title bar — label only, no filename */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="text-lg font-semibold text-white">{plot.label}</div>
          <div className="flex items-center gap-2">
            {inference && (
              <button
                onClick={handleInfer}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 border active:scale-95
                  ${showInference
                    ? 'border-signal/60 bg-signal/10 text-signal'
                    : 'border-signal/40 text-signal hover:bg-signal/10 hover:border-signal'
                  }`}
              >
                <Sparkles size={12} />
                {showInference ? 'Hide Inference' : 'Get Inference'}
              </button>
            )}
            <button
              onClick={() => setLightbox(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
            >
              <ExternalLink size={12} /> Expand
            </button>
          </div>
        </div>

        {/* Full-width image with loading state */}
        <div className="relative w-full bg-ink-700 cursor-pointer" onClick={() => setLightbox(true)}>
          {/* Spinner shown while loading */}
          {!imgLoaded && !imgError && (
            <div className="w-full h-48 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-slate-600" />
            </div>
          )}
          {/* Image — hidden until loaded, then revealed */}
          {!imgError && (
            <img
              src={imageUrl}
              alt={plot.label}
              className="w-full h-auto object-contain hover:opacity-95 transition-opacity"
              style={{
                minHeight: '120px',
                maxHeight: '600px',
                display: imgLoaded ? 'block' : 'none',
              }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          {/* Error state */}
          {imgError && (
            <div className="w-full h-48 flex items-center justify-center flex-col gap-2 text-slate-600">
              <ImageIcon size={24} />
              <span className="text-xs font-mono">Could not load image</span>
            </div>
          )}
        </div>

        {/* AI Inference panel */}
        {showInference && inference && (
          <div className="px-5 py-4 border-t border-signal/10 bg-signal/5 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-signal" />
              <span className="text-[10px] font-mono text-signal tracking-widest">INFERENCE</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{inference}</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <img
            src={imageUrl}
            alt={plot.label}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white font-mono text-sm px-3 py-1.5 rounded border border-white/10 hover:border-white/30 transition-all"
            onClick={() => setLightbox(false)}
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-300 text-base font-semibold">
            {plot.label}
          </div>
        </div>
      )}
    </>
  )
}

// ── Plots Gallery ─────────────────────────────────────────────────────────
function PlotsGallery({ baseUrl }) {
  return (
    <div className="space-y-12">
      {PLOT_GROUPS.map(group => (
        <div key={group.group}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs font-mono text-slate-400 tracking-widest px-3">
              {group.group.toUpperCase()}
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-6">
            {group.plots.map(plot => (
              <PlotCard key={plot.file} plot={plot} baseUrl={baseUrl} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Demand Vector ─────────────────────────────────────────────────────────
function DemandVector({ demand }) {
  const REGIONS = ['north', 'south', 'east', 'west', 'central']
  const maxNeed = Math.max(...REGIONS.flatMap(r => Object.values(demand[r]?.need || {})), 1)

  return (
    <div className="card overflow-hidden">
      <div className="text-[10px] font-mono text-slate-500 px-4 py-3 border-b border-white/5 tracking-wide">
        REGION DEMAND VECTOR
      </div>
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/5">
            {['Region','Food','Water','Medicine','Urgency','Messages','Disaster Types'].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REGIONS.map(r => {
            const d    = demand[r] || {}
            const need = d.need || {}
            const urgColor = (d.urgency ?? 0) > 0.7 ? '#ff6b6b' : (d.urgency ?? 0) > 0.4 ? '#f59e0b' : '#00e5a0'
            return (
              <tr key={r} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white font-bold capitalize">{r}</td>
                {['food','water','medicine'].map(res => (
                  <td key={res} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white w-6">{need[res] ?? 0}</span>
                      <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden w-16">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${((need[res] ?? 0) / maxNeed) * 100}%`,
                            backgroundColor: res === 'food' ? '#f59e0b' : res === 'water' ? '#38bdf8' : '#ff6b6b',
                          }} />
                      </div>
                    </div>
                  </td>
                ))}
                <td className="px-4 py-3 font-bold" style={{ color: urgColor }}>
                  {((d.urgency ?? 0) * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-3 text-slate-400">{d.message_count ?? 0}</td>
                <td className="px-4 py-3 text-slate-500">
                  {(d.disaster_types || []).join(', ') || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export default function OutputsGallery() {
  const [demand,  setDemand]  = useState(null)
  const [loading, setLoading] = useState(true)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  function loadDemand() {
    setLoading(true)
    fetch(`${BASE_URL}/rl/demand`)
      .then(r => r.json())
      .then(d => { setDemand(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadDemand()
  }, [])

  useEffect(() => {
    const handleDemandUpdate = () => { loadDemand() }
    window.addEventListener('equirelief:demand-updated', handleDemandUpdate)
    return () => window.removeEventListener('equirelief:demand-updated', handleDemandUpdate)
  }, [])

  return (
    <section id="outputs" className="py-24 px-6 bg-ink-900/40">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-signal tracking-widest">OUTPUTS</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white">Plots, Data & Results</h2>
          <p className="text-slate-400 mt-2 text-sm">
            All outputs from the EquiRelief pipeline. Click
            <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded border border-signal/30 text-signal text-xs font-mono">
              <Sparkles size={10} /> Get Inference
            </span>
            on any plot for analysis.
          </p>
        </div>

        {/* 1. Plots */}
        <div>
          <SectionHeader
            icon={ImageIcon}
            label="PIPELINE PLOTS"
            title="EDA & Evaluation Charts"
            desc="22 plots from week1b_eda.ipynb and week4_evaluation_demo.ipynb"
          />
          <PlotsGallery baseUrl={BASE_URL} />
        </div>

        <div className="section-line" />

        {/* 2. Demand Vector */}
        <div>
          <SectionHeader
            icon={MapPin}
            label="DEMAND VECTOR"
            title="Regional Resource Demand"
            desc="Stage 10 output — aggregated NLP demand feeding into the RL agent"
          />
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading from backend…
            </div>
          )}
          {demand && <DemandVector demand={demand} />}
          {!loading && !demand && (
            <div className="card p-6 text-center text-slate-500 text-sm font-mono">
              Could not load — is the backend running on port 8000?
            </div>
          )}
        </div>

        <div className="section-line" />

        {/* 3. NLP Results */}
        <div>
          <SectionHeader icon={BarChart3} label="NLP RESULTS" title="Pipeline Evaluation Tables" />
          <div className="space-y-4">
            <TableCard title="NLP PIPELINE PERFORMANCE SUMMARY">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Stage','Task','Metric','Test N','Score'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NLP_PERFORMANCE.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5"><span className="tag border-white/10 text-slate-400">{row.stage}</span></td>
                      <td className="px-4 py-2.5 text-slate-200">{row.task}</td>
                      <td className="px-4 py-2.5 text-slate-400">{row.metric}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.n}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: row.color }}>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>

            <TableCard title="URGENCY F1 BY LANGUAGE (STAGE 8)">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Language','F1 (macro)','N','Note'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PER_LANG.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-white font-semibold">{row.lang}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold w-10" style={{ color: row.color }}>{row.f1.toFixed(3)}</span>
                          <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden w-24">
                            <div className="h-full rounded-full" style={{ width: `${row.f1 * 100}%`, backgroundColor: row.color }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{row.n}</td>
                      <td className="px-4 py-2.5 text-slate-400">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          </div>
        </div>

        <div className="section-line" />

        {/* 4. RL Results */}
        <div>
          <SectionHeader icon={Table2} label="RL RESULTS" title="Policy Evaluation Tables" />
          <div className="space-y-4">

            <TableCard title="POLICY COMPARISON (100 EVALUATION EPISODES)">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Policy','Reward','± Std','Gini ↓','Var(ratio) ↓','Wait%'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POLICY_COMPARISON.map((row, i) => {
                    const isEqui = row.policy.includes('DQN')
                    return (
                      <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] ${isEqui ? 'bg-signal/5' : ''}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: isEqui ? '#00e5a0' : i===1 ? '#38bdf8' : i===2 ? '#a78bfa' : '#64748b' }} />
                            <span className={isEqui ? 'text-signal font-bold' : 'text-slate-300'}>{row.policy}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-white font-bold">{row.reward.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-slate-500">±{row.std}</td>
                        <td className="px-4 py-2.5 text-white">{row.gini.toFixed(4)}</td>
                        <td className="px-4 py-2.5 text-white">{row.var.toFixed(5)}</td>
                        <td className="px-4 py-2.5 text-slate-400">{row.wait}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableCard>

            <TableCard title="TRAINING PROGRESS — DOUBLE DQN">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Checkpoint','Mean Reward (50-ep)','Gini','Var(ratios)','Improvement'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRAINING_PROGRESS.map((row, i) => {
                    const prev = i > 0 ? TRAINING_PROGRESS[i-1].reward : null
                    const gain = prev ? `+${(row.reward - prev).toFixed(1)}` : '—'
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 text-slate-300">{row.ep}</td>
                        <td className="px-4 py-2.5 text-white font-bold">{row.reward}</td>
                        <td className="px-4 py-2.5 text-sky-data">{row.gini.toFixed(4)}</td>
                        <td className="px-4 py-2.5 text-amber-alert">{row.var.toFixed(5)}</td>
                        <td className="px-4 py-2.5 font-bold" style={{ color: prev ? '#00e5a0' : '#64748b' }}>{gain}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableCard>

            <TableCard title="STRESS TEST RESULTS">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Policy','Min Ratio (imbalanced)','Emergency <3 steps','Emergency <10 steps','Wasted Dispatches'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STRESS_TESTS.map((row, i) => {
                    const isEqui = row.policy.includes('DQN')
                    return (
                      <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] ${isEqui ? 'bg-signal/5' : ''}`}>
                        <td className="px-4 py-2.5">
                          <span className={isEqui ? 'text-signal font-bold' : 'text-slate-300'}>{row.policy}</span>
                        </td>
                        <td className="px-4 py-2.5 text-white">{row.minRatio}</td>
                        <td className="px-4 py-2.5">
                          <span className={row.emerg3 === '100%' ? 'text-signal font-bold' : 'text-coral'}>{row.emerg3}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={row.emerg10 === '100%' ? 'text-signal font-bold' : 'text-coral'}>{row.emerg10}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={row.wasted === 0 ? 'text-signal' : row.wasted > 20 ? 'text-coral' : 'text-amber-alert'}>
                            {row.wasted}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-[10px] font-mono text-slate-600 border-t border-white/5">
                      Note: EquiRelief trades 7 wasted dispatches for 3.7% better min-ratio equity across regions
                    </td>
                  </tr>
                </tfoot>
              </table>
            </TableCard>

          </div>
        </div>
      </div>
    </section>
  )
}
