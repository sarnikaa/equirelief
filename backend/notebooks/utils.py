# EquiRelief — shared utilities
import json, re, os, random
import numpy as np
from pathlib import Path


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    try:
        import torch
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
    except ImportError:
        pass


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(obj, path: str, indent: int = 2):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    print(f"Saved -> {path}")


def load_jsonl(path: str) -> list:
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def save_jsonl(records: list, path: str):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"Saved {len(records)} records -> {path}")


def normalise_text(text: str) -> str:
    import unicodedata
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"http\S+|www\.\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalise_hindi(text: str) -> str:
    try:
        from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
        normalizer = IndicNormalizerFactory().get_normalizer("hi")
        return normalizer.normalize(text)
    except Exception:
        return text


def normalise_tamil(text: str) -> str:
    try:
        from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
        normalizer = IndicNormalizerFactory().get_normalizer("ta")
        return normalizer.normalize(text)
    except Exception:
        return text


def dispatch_normalise(text: str, lang: str) -> str:
    if lang == "hi":
        return normalise_hindi(normalise_text(text))
    elif lang == "ta":
        return normalise_tamil(normalise_text(text))
    else:
        return normalise_text(text)


def empty_demand_vector(regions: list) -> dict:
    return {
        region: {
            "need": {"food": 0, "water": 0, "medicine": 0},
            "urgency": 0.0,
            "message_count": 0,
            "location_mentions": [],
            "disaster_types": [],
        }
        for region in regions
    }


def merge_demand(base: dict, new_entry: dict) -> dict:
    r = new_entry.get("region", "central")
    if r not in base:
        r = "central"
    rt = new_entry.get("resource_type", "food")
    if rt in base[r]["need"]:
        base[r]["need"][rt] += 1
    base[r]["urgency"] = max(base[r]["urgency"], new_entry.get("urgency", 0.0))
    base[r]["message_count"] += 1
    if new_entry.get("location"):
        base[r]["location_mentions"].append(new_entry["location"])
    if new_entry.get("disaster_type"):
        base[r]["disaster_types"].append(new_entry["disaster_type"])
    return base


def gini(arr) -> float:
    arr = np.array(arr, dtype=float)
    if arr.sum() == 0:
        return 0.0
    arr = np.sort(arr)
    n = len(arr)
    index = np.arange(1, n + 1)
    return (2 * (index * arr).sum()) / (n * arr.sum()) - (n + 1) / n


def service_ratio_variance(delivered: dict, need: dict) -> float:
    ratios = []
    for region in need:
        n = need[region]
        d = delivered.get(region, 0)
        ratios.append(d / n if n > 0 else 0.0)
    return float(np.var(ratios))


def print_section(title: str):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)
