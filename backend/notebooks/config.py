# EquiRelief — shared configuration
# Imported by all four weekly notebooks.

import os

# ── Paths ──────────────────────────────────────────────────────────────────
BASE       = "/content/drive/MyDrive/Equi-Relief"
DATA_RAW   = f"{BASE}/data/raw"
DATA_PROC  = f"{BASE}/data/processed"
TEST_SET   = f"{BASE}/data/test_set"
HF_CACHE   = f"{BASE}/models/hf_cache"
CKPT_DIR   = f"{BASE}/models/checkpoints"
OUT_DEMAND = f"{BASE}/outputs/demand_vectors"
OUT_PLOTS  = f"{BASE}/outputs/plots"
OUT_RESULTS= f"{BASE}/outputs/results"

# ── HuggingFace cache (must be set before any transformers import) ─────────
os.environ["HF_HOME"]                    = HF_CACHE
os.environ["TRANSFORMERS_CACHE"]         = HF_CACHE
os.environ["HF_DATASETS_CACHE"]          = f"{HF_CACHE}/datasets"
os.environ["SENTENCE_TRANSFORMERS_HOME"] = f"{HF_CACHE}/sentence_transformers"

# ── Languages & regions ───────────────────────────────────────────────────
LANGUAGES = ["en", "hi", "ta", "hinglish", "tanglish"]

REGIONS = ["north", "south", "east", "west", "central"]
N_REGIONS = len(REGIONS)

RESOURCE_TYPES = ["food", "water", "medicine"]

# ── Model identifiers ─────────────────────────────────────────────────────
MODELS = {
    "mbert"    : "bert-base-multilingual-cased",
    "indicbert": "ai4bharat/indic-bert",
    "labse"    : "sentence-transformers/LaBSE",
    "ner"      : "Davlan/bert-base-multilingual-cased-ner-hrl",
    "zero_shot": "facebook/bart-large-mnli",
}

# Approximate sizes for reference
MODEL_SIZES_GB = {
    "mbert"    : 0.68,
    "indicbert": 0.47,
    "labse"    : 1.87,
    "ner"      : 0.68,
    "zero_shot": 1.52,
}

# ── RL hyperparameters ────────────────────────────────────────────────────
REWARD = dict(
    alpha = 1.0,   # efficiency weight
    lam   = 0.5,   # fairness penalty weight (lambda)
    beta  = 0.3,   # urgency bonus weight
    delta = 0.1,   # delay penalty weight
)

RL = dict(
    gamma        = 0.99,    # discount factor
    lr           = 1e-4,    # learning rate
    batch_size   = 64,
    buffer_size  = 50_000,  # replay buffer capacity
    target_update= 500,     # steps between target-network sync
    n_step       = 3,       # n-step TD
    epsilon_start= 1.0,
    epsilon_end  = 0.05,
    epsilon_decay= 10_000,  # steps
    n_episodes   = 2_000,
    ckpt_every   = 100,     # save checkpoint every N episodes
)

# ── NLP pipeline settings ─────────────────────────────────────────────────
NLP = dict(
    max_length       = 128,
    urgency_threshold= 0.6,   # probability cutoff for urgent label
    dbscan_eps       = 0.3,   # LaBSE cosine distance for dedup
    dbscan_min_samples = 2,
)

# ── Urgency labels (zero-shot candidate labels) ───────────────────────────
URGENCY_LABELS = ["urgent disaster relief needed", "general disaster update"]

# ── Seed ─────────────────────────────────────────────────────────────────
SEED = 42