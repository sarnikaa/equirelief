/**
 * EquiRelief API Layer
 *
 * HOW TO CONNECT YOUR COLAB BACKEND:
 * 1. In Colab, install ngrok:  !pip install pyngrok
 * 2. Expose your FastAPI/Flask app:
 *      from pyngrok import ngrok
 *      url = ngrok.connect(8000)
 *      print(url)  # e.g. https://xxxx.ngrok.io
 * 3. Paste that URL in the VITE_API_BASE_URL env variable:
 *      Create a .env file: VITE_API_BASE_URL=https://xxxx.ngrok.io
 * 4. Set USE_MOCK = false below
 *
 * EXPECTED COLAB ENDPOINTS:
 *   POST /nlp/process      { text: string } → NlpResult
 *   GET  /rl/demand        → DemandVector
 *   POST /rl/allocate      { demand: DemandVector } → AllocationResult
 *   GET  /results/metrics  → MetricsResult
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ── Toggle this to false when your Colab backend is running ──────────────
export const USE_MOCK = false

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Mock data ─────────────────────────────────────────────────────────────

const MOCK_NLP_RESULTS = {
  "Need food and water urgently in Chennai flood areas. Bahut log phanse hain.": {
    detected_lang: 'hinglish',
    normalised: 'Need food and water urgently in Chennai flood areas. Bahut log phanse hain.',
    tokens: ['Need', 'food', 'water', 'urgently', 'Chennai', 'flood', 'areas', 'Bahut', 'log', 'phanse', 'hain'],
    entities: [{ text: 'Chennai', label: 'LOC' }],
    resources: ['food', 'water'],
    urgency: 0.91,
    urgency_label: 'urgent',
    region: 'south',
    demand_contribution: { food: 1, water: 1, medicine: 0 },
    pipeline_stages: [
      { stage: 'Language Detection', output: 'hinglish', status: 'ok' },
      { stage: 'Normalisation', output: 'Unicode NFC + URL strip', status: 'ok' },
      { stage: 'Tokenisation', output: '11 tokens', status: 'ok' },
      { stage: 'mBERT Embedding', output: '768-dim vector', status: 'ok' },
      { stage: 'NER', output: 'Chennai → LOC', status: 'ok' },
      { stage: 'Resource Extraction', output: 'food, water', status: 'ok' },
      { stage: 'Urgency Detection', output: '0.91 — URGENT', status: 'ok' },
      { stage: 'LaBSE Alignment', output: 'Cross-lingual aligned', status: 'ok' },
      { stage: 'DBSCAN Dedup', output: 'Unique message', status: 'ok' },
      { stage: 'Demand Aggregation', output: 'south ← food+water', status: 'ok' },
    ],
  },
}

const MOCK_DEMAND = {
  north:   { need: { food: 12, water: 8,  medicine: 3  }, urgency: 0.72, message_count: 34 },
  south:   { need: { food: 24, water: 19, medicine: 11 }, urgency: 0.91, message_count: 78 },
  east:    { need: { food: 7,  water: 14, medicine: 5  }, urgency: 0.55, message_count: 21 },
  west:    { need: { food: 15, water: 10, medicine: 8  }, urgency: 0.68, message_count: 45 },
  central: { need: { food: 9,  water: 6,  medicine: 2  }, urgency: 0.43, message_count: 18 },
}

const MOCK_ALLOCATION = {
  allocation: {
    north:   { food: 10, water: 7,  medicine: 3  },
    south:   { food: 22, water: 18, medicine: 10 },
    east:    { food: 6,  water: 13, medicine: 4  },
    west:    { food: 13, water: 9,  medicine: 7  },
    central: { food: 8,  water: 5,  medicine: 2  },
  },
  metrics: {
    total_reward: 128.4,
    gini: 0.003,
    ratio_variance: 0.00004,
    urgency_response: 0.94,
  },
  policy: 'EquiRelief (Double DQN)',
}

const MOCK_METRICS = {
  training_curves: Array.from({ length: 2000 }, (_, i) => ({
    episode: i + 1,
    reward: 72 + 56 * (1 - Math.exp(-i / 600)) + (Math.random() - 0.5) * 12,
    gini: Math.max(0.002, 0.014 - 0.011 * (1 - Math.exp(-i / 500)) + Math.random() * 0.002),
    ratio_var: Math.max(0.00003, 0.00087 - 0.00083 * (1 - Math.exp(-i / 450)) + Math.random() * 0.00005),
  })),
  policy_comparison: [
    { policy: 'Random',           reward: 41.2,  gini: 0.142, ratio_var: 0.00312, urgency: 0.38 },
    { policy: 'Greedy',           reward: 89.7,  gini: 0.071, ratio_var: 0.00148, urgency: 0.61 },
    { policy: 'Equity-Greedy',    reward: 112.3, gini: 0.018, ratio_var: 0.00021, urgency: 0.79 },
    { policy: 'EquiRelief (DQN)', reward: 128.4, gini: 0.003, ratio_var: 0.00004, urgency: 0.94 },
  ],
  nlp_metrics: {
    lang_detection: 1.000,
    region_accuracy: 0.817,
    resource_f1_manual: 0.724,
    resource_f1_fig8: 0.787,
    urgency_f1_en: 0.879,
    urgency_f1_multilingual: 0.588,
    per_lang: [
      { lang: 'English',   f1: 0.792 },
      { lang: 'Hindi',     f1: 0.688 },
      { lang: 'Tamil',     f1: 0.651 },
      { lang: 'Hinglish',  f1: 0.573 },
      { lang: 'Tanglish',  f1: 0.541 },
    ],
  },
  ablation: [
    { name: 'Base DQN',              reward: 94.1 },
    { name: '+ Double DQN',          reward: 107.6 },
    { name: '+ PER',                 reward: 118.9 },
    { name: '+ n-Step TD (Full)',     reward: 128.4 },
  ],
}

// ── API functions ─────────────────────────────────────────────────────────

export async function processNlp(text) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200))
    return MOCK_NLP_RESULTS[text] || {
      detected_lang: 'en',
      normalised: text,
      tokens: text.split(' '),
      entities: [],
      resources: ['food'],
      urgency: 0.65,
      urgency_label: 'urgent',
      region: 'central',
      demand_contribution: { food: 1, water: 0, medicine: 0 },
      pipeline_stages: [
        { stage: 'Language Detection', output: 'en', status: 'ok' },
        { stage: 'Normalisation', output: 'Cleaned', status: 'ok' },
        { stage: 'Tokenisation', output: `${text.split(' ').length} tokens`, status: 'ok' },
        { stage: 'mBERT Embedding', output: '768-dim vector', status: 'ok' },
        { stage: 'NER', output: 'No entities', status: 'ok' },
        { stage: 'Resource Extraction', output: 'food', status: 'ok' },
        { stage: 'Urgency Detection', output: '0.65 — URGENT', status: 'ok' },
        { stage: 'LaBSE Alignment', output: 'Aligned', status: 'ok' },
        { stage: 'DBSCAN Dedup', output: 'Unique', status: 'ok' },
        { stage: 'Demand Aggregation', output: 'central ← food', status: 'ok' },
      ],
    }
  }
  const { data } = await api.post('/nlp/process', { text })
  return data
}

export async function getDemand() {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600))
    return MOCK_DEMAND
  }
  const { data } = await api.get('/rl/demand')
  return data
}

export async function getAllocation(demand) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 900))
    return MOCK_ALLOCATION
  }
  const { data } = await api.post('/rl/allocate', { demand })
  return data
}

export async function getMetrics() {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400))
    return MOCK_METRICS
  }
  const { data } = await api.get('/results/metrics')
  return data
}
