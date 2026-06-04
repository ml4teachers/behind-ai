#!/usr/bin/env python3
# ---------------------------------------------------------------------------
# Erzeugt die Daten für die Attention-Seite -> public/attention.json
#
#   python3 scripts/gen-attention.py
#
# Was passiert:
#  1. Ein echtes deutsches Sprachmodell (GerPT2, GPT-2-Architektur, 12 Schichten
#     x 12 Köpfe) wird geladen und über eine kuratierte Liste deutscher Sätze
#     laufen gelassen – mit output_attentions=True.
#  2. Die echten Attention-Gewichte werden von Subwort- auf WORT-Ebene gebündelt
#     (Query = letztes Subwort des Wortes; Keys pro Wort aufsummiert). So wird aus
#     "b/ell/te -> Hund" ein lesbares "bellte -> Hund".
#  3. Für ein paar HANDVERLESENE, gut interpretierbare Köpfe (im Spike gefunden)
#     wird je Satz eine Wort-x-Wort-Matrix gespeichert, dazu die echte Next-Token-
#     Vorhersage an der letzten Position (Brücke zur Next-Token-Seite).
#  4. Ergebnis -> public/attention.json (klein, gerundet).
#
# WICHTIG: Reiner BUILD-Schritt. Nichts davon geht an den Client; die Seite lädt
# zur Laufzeit nur das fertige JSON. Modell + Köpfe wurden im Spike empirisch
# ausgewählt (kein Koreferenz-"Flip" im kleinen Modell -> bewusst NICHT behauptet).
#
# Voraussetzung: torch + transformers (offline einmalig). Erststart lädt das
# Modell (~500 MB) in den HF-Cache.
# ---------------------------------------------------------------------------
import json, os, sys
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL = os.environ.get("ATTN_MODEL", "benjamin/gerpt2")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "attention.json")
PUNCT = set(",.!?;:")

# Im Spike (/tmp) gefundene, robuste und gut interpretierbare Köpfe.
# role = stabiler Schlüssel für die UI; label/desc nur als Referenz (die Seite
# hält ihre eigenen i18n-Texte, Viz-Strings dort inline).
# role = stabiler Schlüssel für die UI. "relation" ist der didaktische Star
# (z. B. es→Kind, satt→Brot); "induction" wird in der UI nur am Wiederhol-Satz
# gezeigt (sonst ruht er wie der Sammel-Kopf am Satzanfang).
HEADS = [
    {"role": "prev",      "layer": 4,  "head": 11, "label": "Vorwort-Kopf"},
    {"role": "relation",  "layer": 1,  "head": 6,  "label": "Bezug-Kopf"},
    {"role": "sink",      "layer": 7,  "head": 8,  "label": "Sammel-Kopf"},
    {"role": "induction", "layer": 5,  "head": 5,  "label": "Wiederhol-Kopf"},
]

# Kuratierte Sätze (jugendfrei, kurz, klares Hauptwort als erstes Substantiv).
# anchor = Wort, auf das der Anker-Kopf zurückschaut (für den geführten Tipp).
# Der letzte Satz enthält eine Wiederholung -> zeigt den Wiederhol-Kopf.
SENTENCES = [
    {"text": "Der Hund bellte laut, weil die Katze weglief",      "anchor": "Hund",     "repeat": False},
    {"text": "Die Lehrerin schrieb die Aufgabe an die Tafel",     "anchor": "Lehrerin", "repeat": False},
    {"text": "Das Kind ass das Brot nicht, weil es satt war",     "anchor": "Kind",     "repeat": False},
    {"text": "Am Morgen trank der Mann seinen Kaffee",            "anchor": "Mann",     "repeat": False},
    {"text": "Im Garten steht ein Baum. Im Garten steht ein Haus","anchor": "Garten",   "repeat": True},
]

print(f"Lade {MODEL} …")
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, attn_implementation="eager").eval()
NL, NH = model.config.n_layer, model.config.n_head
print(f"  Schichten={NL} Köpfe={NH}")


def group_words(ids):
    """Subwort-Tokens zu Wörtern bündeln. -> [{text, tok:[idx...]}]"""
    words = []
    prev_punct = False
    for i, tid in enumerate(ids):
        s = tok.decode([int(tid)])
        stripped = s.strip()
        is_punct = stripped in PUNCT
        new_word = (i == 0) or s.startswith(" ") or is_punct or prev_punct
        if new_word or not words:
            words.append({"text": stripped, "tok": [i]})
        else:
            words[-1]["text"] += stripped
            words[-1]["tok"].append(i)
        prev_punct = is_punct
    return words


def run(text):
    enc = tok(text, return_tensors="pt")
    ids = enc["input_ids"][0]
    with torch.no_grad():
        out = model(input_ids=enc["input_ids"], output_attentions=True)
    attn = [a[0] for a in out.attentions]              # [L] -> [H, q, k]
    words = group_words(ids)
    return ids, words, attn, out.logits[0]


def word_matrix(attn, words, layer, head):
    """Wort-x-Wort-Matrix (kausal). Query = letztes Subwort; Keys pro Wort summiert."""
    A = attn[layer][head]
    W = len(words)
    M = [[0.0] * W for _ in range(W)]
    for qi in range(W):
        q = words[qi]["tok"][-1]
        for ki in range(qi + 1):                        # kausal: nur <= qi
            M[qi][ki] = round(sum(A[q, k].item() for k in words[ki]["tok"]), 3)
    return M


def next_token_topk(logits, ids, k=5):
    probs = torch.softmax(logits[-1], dim=-1)
    top = torch.topk(probs, k)
    return [{"token": tok.decode([int(i)]), "p": round(float(p), 4)}
            for p, i in zip(top.values, top.indices)]


data_sentences = []
print("\n=== Diagnose (Argmax-Ziel je Wort, zur Kontrolle der Kopf-Rollen) ===")
for sent in SENTENCES:
    ids, words, attn, logits = run(sent["text"])
    wtexts = [w["text"] for w in words]
    anchor_idx = next((i for i, w in enumerate(wtexts) if w == sent["anchor"]), -1)

    heads_out = []
    print(f"\n„{sent['text']}\"")
    print("  Wörter:", " ".join(f"{i}:{w}" for i, w in enumerate(wtexts)))
    for h in HEADS:
        M = word_matrix(attn, words, h["layer"], h["head"])
        heads_out.append({"role": h["role"], "layer": h["layer"], "head": h["head"], "matrix": M})
        # Diagnose: worauf zeigt jedes Wort (Argmax, ohne sich selbst)
        arg = []
        for qi in range(1, len(words)):
            row = [(M[qi][ki], ki) for ki in range(qi)]
            v, ki = max(row)
            arg.append(f"{wtexts[qi]}→{wtexts[ki]}({v:.2f})")
        print(f"   {h['role']:9s} L{h['layer']}H{h['head']}: " + "  ".join(arg))

    data_sentences.append({
        "text": sent["text"],
        "words": wtexts,
        "anchor": anchor_idx,
        "repeat": sent["repeat"],
        "nextToken": next_token_topk(logits, ids),
        "heads": heads_out,
    })

out = {
    "model": "ein deutsches Sprachmodell (GPT-2-Architektur, 12 Schichten × 12 Köpfe)",
    "modelId": MODEL,
    "heads": [{"role": h["role"], "layer": h["layer"], "head": h["head"], "label": h["label"]} for h in HEADS],
    "sentences": data_sentences,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
size = os.path.getsize(OUT)
print(f"\n→ geschrieben: {os.path.relpath(OUT)}  ({size/1024:.1f} KB)")
print("  nextToken-Beispiele:")
for s in data_sentences:
    print(f"   „…{s['words'][-1]}\" → " + ", ".join(f"{t['token']!r}({t['p']:.0%})" for t in s["nextToken"][:3]))
