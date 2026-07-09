# EquiRelief Frontend

Dashboard + Demo frontend for the EquiRelief equity-driven disaster resource allocation system.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS** (dark dashboard theme)
- **Recharts** (training curves, bar charts, radar)
- **Axios** (API calls)
- **Lucide React** (icons)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
# → http://localhost:3000

# 3. Build for production
npm run build
```

## Connecting Your Colab Backend

The app ships in **mock mode** — all data is hardcoded. To connect your real Colab backend:

### Step 1 — Install FastAPI + ngrok in Colab

```python
!pip install fastapi uvicorn pyngrok nest-asyncio
```

### Step 2 — Add CORS + expose endpoints in Colab

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pyngrok import ngrok
import nest_asyncio, uvicorn, threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/nlp/process")
async def process_nlp(body: dict):
    text = body["text"]
    # Call your NLP pipeline here
    result = run_nlp_pipeline(text)
    return result

@app.get("/rl/demand")
async def get_demand():
    # Return current demand vector
    return load_json(f"{OUT_DEMAND}/region_demand.json")

@app.post("/rl/allocate")
async def allocate(body: dict):
    # Run RL agent allocation
    return run_allocation(body["demand"])

@app.get("/results/metrics")
async def get_metrics():
    return load_json(f"{OUT_RESULTS}/rl_results.json")

# Start server
nest_asyncio.apply()
public_url = ngrok.connect(8000)
print(f"API URL: {public_url}")

thread = threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8000))
thread.daemon = True
thread.start()
```

### Step 3 — Create `.env` file in this folder

```
VITE_API_BASE_URL=https://xxxx.ngrok-free.app
```

### Step 4 — Switch off mock mode

In `src/api/index.js`, change:
```js
export const USE_MOCK = false   // was true
```

That's it — the frontend will now call your live Colab backend.

## Project Structure

```
src/
├── api/
│   └── index.js          ← All API calls + mock data
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── Architecture.jsx  ← NLP + RL pipeline diagram
│   ├── NlpDemo.jsx       ← Message input → pipeline output
│   ├── RlDashboard.jsx   ← Region map + allocation charts
│   ├── Results.jsx       ← Training curves + policy comparison
│   └── Footer.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Sections

| Section | Description |
|---------|-------------|
| **Hero** | Project intro with typewriter taglines |
| **Architecture** | 10-stage NLP pipeline + RL agent diagram |
| **NLP Demo** | Paste a message, see all 10 pipeline stages run |
| **RL Dashboard** | Region map, need vs allocation charts, radar |
| **Results** | Training curves, policy comparison, NLP metrics, ablation |

## Deploying

```bash
npm run build
# Deploy the `dist/` folder to Vercel / Netlify / GitHub Pages
```

## Team
- Sarnika · 22PD31
- Diravina · 22PD12
- Smrithi · 22PD33

PSG College of Technology · 2025
