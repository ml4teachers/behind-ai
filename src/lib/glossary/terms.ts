import { type Locale } from '@/lib/i18n/config'

/**
 * Glossar-Datenmodul.
 *
 * Zweisprachige Begriffsdaten als eigenes Modul (wie src/lib/rlhf/data.ts) –
 * NICHT in messages.ts, sonst sprengt es die Übersetzungstabelle.
 *
 * Aufbau in zwei Teilen, damit Inhalt und Metadaten getrennt gepflegt werden:
 *   TERM_META    – von Hand kuratiert: Kategorie, Anzeigebegriff, interne
 *                  Erklärseite, geprüfte Wikipedia-Artikel, externe Verweise.
 *   TERM_CONTENT – Kurz-/Langdefinition + Such-/Verlinkungs-Aliasse (DE/EN).
 *
 * `glossaryTerms` führt beide zusammen (nur Begriffe mit Inhalt erscheinen).
 */

export type GlossaryCategory = 'data' | 'training' | 'inference' | 'mlBasics' | 'general'

export interface Bilingual {
  de: string
  en: string
}

export interface GlossaryLink {
  label: string
  href: string
  kind: 'video' | 'article' | 'interactive' | 'wikipedia'
}

export interface GlossaryTerm {
  /** Stabiler Anchor (kebab-case, EN). Deep-Link: /glossary#<id> */
  id: string
  category: GlossaryCategory
  /** Anzeigebegriff (darf einen Klammerzusatz enthalten, z.B. „Attention (Aufmerksamkeit)") */
  term: Bilingual
  /** Zusätzliche Oberflächenformen NUR fürs Auto-Matching (Plural/Flexion/Synonyme). */
  aliases: { de: string[]; en: string[] }
  /** Ein Satz – Tooltip. */
  short: Bilingual
  /** 2–4 Sätze – Glossar-Seite. */
  long: Bilingual
  /** Interne Erklärseite, z.B. '/embeddings'. */
  page?: string
  /** Geprüfte Wikipedia-Artikel-Titel je Sprache (Existenz per API verifiziert). */
  wikipedia?: { de?: string; en?: string }
  /** Kuratierte externe Verweise (Videos/interaktiv/Artikel). */
  links?: GlossaryLink[]
}

// ── Wiederverwendbare externe Verweise (alle URLs verifiziert) ──────────────
const L_3B1B_GPT: GlossaryLink = { label: '3Blue1Brown: But what is a GPT?', href: 'https://www.3blue1brown.com/lessons/gpt', kind: 'video' }
const L_3B1B_ATTN: GlossaryLink = { label: '3Blue1Brown: Attention in transformers', href: 'https://www.3blue1brown.com/lessons/attention', kind: 'video' }
const L_3B1B_BACKPROP: GlossaryLink = { label: '3Blue1Brown: Backpropagation', href: 'https://www.3blue1brown.com/lessons/backpropagation', kind: 'video' }
const L_3B1B_GRADIENT: GlossaryLink = { label: '3Blue1Brown: Gradient descent', href: 'https://www.3blue1brown.com/lessons/gradient-descent', kind: 'video' }
const L_3B1B_NN: GlossaryLink = { label: '3Blue1Brown: Neural networks', href: 'https://www.3blue1brown.com/lessons/neural-networks', kind: 'video' }
const L_BBYCROFT: GlossaryLink = { label: 'LLM Visualization (bbycroft.net)', href: 'https://bbycroft.net/llm', kind: 'interactive' }
const L_FT: GlossaryLink = { label: 'Financial Times: Generative AI', href: 'https://ig.ft.com/generative-ai/', kind: 'article' }
const L_KARPATHY_DEEP: GlossaryLink = { label: 'Karpathy: Deep Dive into LLMs', href: 'https://www.youtube.com/watch?v=7xTGNNLPyMI', kind: 'video' }
const L_KARPATHY_USE: GlossaryLink = { label: 'Karpathy: How I use LLMs', href: 'https://www.youtube.com/watch?v=EWvNQjAaOHw', kind: 'video' }

type TermMeta = Pick<GlossaryTerm, 'id' | 'category' | 'term' | 'page' | 'wikipedia' | 'links'>

// Reihenfolge = Anzeigereihenfolge auf der Glossar-Seite (entlang des Lern-Bogens).
const TERM_META: TermMeta[] = [
  // ── Daten ────────────────────────────────────────────────────────────────
  { id: 'token', category: 'data', term: { de: 'Token', en: 'Token' }, page: '/tokenization', links: [L_3B1B_GPT] },
  { id: 'tokenization', category: 'data', term: { de: 'Tokenisierung', en: 'Tokenization' }, page: '/tokenization', wikipedia: { de: 'Tokenisierung', en: 'Byte-pair_encoding' }, links: [L_3B1B_GPT] },
  { id: 'embedding', category: 'data', term: { de: 'Embedding', en: 'Embedding' }, page: '/embeddings', wikipedia: { de: 'Worteinbettung', en: 'Word_embedding' }, links: [L_3B1B_GPT] },
  { id: 'vector', category: 'data', term: { de: 'Vektor', en: 'Vector' }, page: '/embeddings' },
  { id: 'vocabulary', category: 'data', term: { de: 'Vokabular', en: 'Vocabulary' }, page: '/tokenization' },
  { id: 'training-data', category: 'data', term: { de: 'Trainingsdaten', en: 'Training data' }, page: '/data', links: [L_KARPATHY_DEEP] },
  { id: 'context-window', category: 'data', term: { de: 'Kontextfenster', en: 'Context window' }, page: '/next-token' },
  { id: 'data-bias', category: 'data', term: { de: 'Verzerrung (Bias)', en: 'Bias' }, page: '/bias', wikipedia: { de: 'Algorithmic_Bias', en: 'Algorithmic_bias' } },
  { id: 'multimodal', category: 'data', term: { de: 'Multimodal', en: 'Multimodal' }, page: '/multimodal', wikipedia: { en: 'Multimodal_learning' } },

  // ── Training ───────────────────────────────────────────────────────────────
  { id: 'pretraining', category: 'training', term: { de: 'Vortraining (Pretraining)', en: 'Pretraining' }, page: '/training', links: [L_KARPATHY_DEEP] },
  { id: 'finetuning', category: 'training', term: { de: 'Finetuning', en: 'Fine-tuning' }, page: '/finetuning', wikipedia: { en: 'Fine-tuning_(deep_learning)' }, links: [L_KARPATHY_DEEP] },
  { id: 'rlhf', category: 'training', term: { de: 'RLHF', en: 'RLHF' }, page: '/rlhf', wikipedia: { en: 'Reinforcement_learning_from_human_feedback' }, links: [L_KARPATHY_DEEP] },
  { id: 'reward-model', category: 'training', term: { de: 'Belohnungsmodell', en: 'Reward model' }, page: '/rlhf' },
  { id: 'bradley-terry', category: 'training', term: { de: 'Bradley-Terry-Modell', en: 'Bradley–Terry model' }, page: '/rlhf', wikipedia: { en: 'Bradley–Terry_model' } },
  { id: 'reward-hacking', category: 'training', term: { de: 'Reward Hacking', en: 'Reward hacking' }, page: '/rlhf', wikipedia: { en: 'Reward_hacking' } },
  { id: 'rlvr', category: 'training', term: { de: 'RLVR', en: 'RLVR' }, page: '/rlvr' },
  { id: 'verifier', category: 'training', term: { de: 'Verifier (Prüfer)', en: 'Verifier' }, page: '/rlvr' },
  { id: 'loss', category: 'training', term: { de: 'Verlust (Loss)', en: 'Loss' }, page: '/backpropagation', wikipedia: { de: 'Verlustfunktion', en: 'Loss_function' } },
  { id: 'epoch', category: 'training', term: { de: 'Epoche', en: 'Epoch' }, page: '/training' },
  { id: 'overfitting', category: 'training', term: { de: 'Überanpassung', en: 'Overfitting' }, page: '/mlp', wikipedia: { de: 'Überanpassung', en: 'Overfitting' } },
  { id: 'train-test-split', category: 'training', term: { de: 'Train/Test-Split', en: 'Train/test split' }, page: '/mlp', wikipedia: { en: 'Training,_validation,_and_test_data_sets' } },
  { id: 'parameters', category: 'training', term: { de: 'Parameter (Gewichte)', en: 'Parameters (weights)' }, page: '/backpropagation' },

  // ── Inferenz ────────────────────────────────────────────────────────────────
  { id: 'inference', category: 'inference', term: { de: 'Inferenz', en: 'Inference' }, page: '/next-token', links: [L_KARPATHY_DEEP] },
  { id: 'next-token-prediction', category: 'inference', term: { de: 'Next-Token-Vorhersage', en: 'Next-token prediction' }, page: '/next-token', links: [L_3B1B_GPT, L_BBYCROFT, L_FT] },
  { id: 'logits', category: 'inference', term: { de: 'Logits', en: 'Logits' }, page: '/next-token' },
  { id: 'logprobs', category: 'inference', term: { de: 'Logprobs', en: 'Logprobs' }, page: '/hallucinations' },
  { id: 'softmax', category: 'inference', term: { de: 'Softmax', en: 'Softmax' }, page: '/next-token', wikipedia: { de: 'Softmax-Funktion', en: 'Softmax_function' } },
  { id: 'temperature', category: 'inference', term: { de: 'Temperatur', en: 'Temperature' }, page: '/next-token' },
  { id: 'sampling', category: 'inference', term: { de: 'Sampling', en: 'Sampling' }, page: '/next-token' },
  { id: 'attention', category: 'inference', term: { de: 'Attention (Aufmerksamkeit)', en: 'Attention' }, page: '/attention', wikipedia: { de: 'Transformer_(Maschinelles_Lernen)', en: 'Attention_(machine_learning)' }, links: [L_3B1B_ATTN] },
  { id: 'qkv', category: 'inference', term: { de: 'Query, Key, Value', en: 'Query, Key, Value' }, page: '/attention', links: [L_3B1B_ATTN] },
  { id: 'transformer', category: 'inference', term: { de: 'Transformer', en: 'Transformer' }, page: '/attention', wikipedia: { de: 'Transformer_(Maschinelles_Lernen)', en: 'Transformer_(deep_learning_architecture)' }, links: [L_3B1B_GPT, L_BBYCROFT] },
  { id: 'chain-of-thought', category: 'inference', term: { de: 'Chain-of-Thought (Gedankenkette)', en: 'Chain of thought' }, page: '/chain-of-thought' },
  { id: 'hallucination', category: 'inference', term: { de: 'Halluzination', en: 'Hallucination' }, page: '/hallucinations', wikipedia: { de: 'Halluzination_(Künstliche_Intelligenz)', en: 'Hallucination_(artificial_intelligence)' } },
  { id: 'rag', category: 'inference', term: { de: 'RAG', en: 'RAG' }, page: '/rag', wikipedia: { en: 'Retrieval-augmented_generation' } },
  { id: 'retrieval', category: 'inference', term: { de: 'Retrieval', en: 'Retrieval' }, page: '/rag' },
  { id: 'grounding', category: 'inference', term: { de: 'Grounding', en: 'Grounding' }, page: '/rag' },
  { id: 'vector-search', category: 'inference', term: { de: 'Vektorsuche', en: 'Vector search' }, page: '/rag', wikipedia: { de: 'Vektordatenbank', en: 'Vector_database' } },
  { id: 'agent', category: 'inference', term: { de: 'Agent (KI-Agent)', en: 'Agent' }, page: '/agents', wikipedia: { en: 'Intelligent_agent' } },
  { id: 'function-calling', category: 'inference', term: { de: 'Function Calling', en: 'Function calling' }, page: '/agents' },
  { id: 'prompt', category: 'inference', term: { de: 'Prompt', en: 'Prompt' }, page: '/next-token', wikipedia: { de: 'Prompt-Engineering', en: 'Prompt_engineering' } },
  { id: 'system-prompt', category: 'inference', term: { de: 'System-Prompt', en: 'System prompt' }, page: '/agents' },

  // ── ML-Grundlagen ────────────────────────────────────────────────────────────
  { id: 'perceptron', category: 'mlBasics', term: { de: 'Perzeptron', en: 'Perceptron' }, page: '/perceptron', wikipedia: { de: 'Perzeptron', en: 'Perceptron' }, links: [L_3B1B_NN] },
  { id: 'neuron', category: 'mlBasics', term: { de: 'Neuron', en: 'Neuron' }, page: '/perceptron', wikipedia: { de: 'Künstliches_Neuron' }, links: [L_3B1B_NN] },
  { id: 'bias', category: 'mlBasics', term: { de: 'Bias (Schwellenwert)', en: 'Bias (threshold)' }, page: '/perceptron', links: [L_3B1B_NN] },
  { id: 'mlp', category: 'mlBasics', term: { de: 'MLP (Mehrschichtiges Perzeptron)', en: 'MLP (Multilayer perceptron)' }, page: '/mlp', wikipedia: { de: 'Mehrlagiges_Perzeptron', en: 'Multilayer_perceptron' }, links: [L_3B1B_NN] },
  { id: 'activation-function', category: 'mlBasics', term: { de: 'Aktivierungsfunktion', en: 'Activation function' }, page: '/mlp', wikipedia: { de: 'Aktivierungsfunktion', en: 'Activation_function' }, links: [L_3B1B_NN] },
  { id: 'relu', category: 'mlBasics', term: { de: 'ReLU', en: 'ReLU' }, page: '/mlp', wikipedia: { en: 'Rectifier_(neural_networks)' } },
  { id: 'sigmoid', category: 'mlBasics', term: { de: 'Sigmoid', en: 'Sigmoid' }, page: '/mlp', wikipedia: { de: 'Sigmoidfunktion', en: 'Sigmoid_function' } },
  { id: 'neural-network', category: 'mlBasics', term: { de: 'Neuronales Netz', en: 'Neural network' }, page: '/mlp', wikipedia: { de: 'Künstliches_neuronales_Netz', en: 'Neural_network_(machine_learning)' }, links: [L_3B1B_NN] },
  { id: 'gradient-descent', category: 'mlBasics', term: { de: 'Gradientenabstieg', en: 'Gradient descent' }, page: '/gradient-descent', wikipedia: { de: 'Gradientenverfahren', en: 'Gradient_descent' }, links: [L_3B1B_GRADIENT] },
  { id: 'learning-rate', category: 'mlBasics', term: { de: 'Lernrate', en: 'Learning rate' }, page: '/gradient-descent', wikipedia: { de: 'Lernrate', en: 'Learning_rate' }, links: [L_3B1B_GRADIENT] },
  { id: 'backpropagation', category: 'mlBasics', term: { de: 'Backpropagation', en: 'Backpropagation' }, page: '/backpropagation', wikipedia: { de: 'Backpropagation', en: 'Backpropagation' }, links: [L_3B1B_BACKPROP] },
  { id: 'diffusion', category: 'mlBasics', term: { de: 'Diffusionsmodell', en: 'Diffusion model' }, page: '/diffusion', wikipedia: { en: 'Diffusion_model' } },
  { id: 'ddpm', category: 'mlBasics', term: { de: 'DDPM', en: 'DDPM' }, page: '/diffusion' },
  { id: 'noise', category: 'mlBasics', term: { de: 'Rauschen', en: 'Noise' }, page: '/diffusion' },

  // ── Allgemein ───────────────────────────────────────────────────────────────
  { id: 'llm', category: 'general', term: { de: 'Sprachmodell (LLM)', en: 'Language model (LLM)' }, page: '/next-token', wikipedia: { de: 'Large_Language_Model', en: 'Large_language_model' }, links: [L_KARPATHY_DEEP, L_3B1B_GPT] },
  { id: 'gpt', category: 'general', term: { de: 'GPT', en: 'GPT' }, wikipedia: { en: 'Generative_pre-trained_transformer' }, links: [L_3B1B_GPT] },
  { id: 'model', category: 'general', term: { de: 'Modell', en: 'Model' }, page: '/training' },
  { id: 'gpu', category: 'general', term: { de: 'GPU', en: 'GPU' }, page: '/privacy', wikipedia: { de: 'Grafikprozessor', en: 'Graphics_processing_unit' } },
  { id: 'local-vs-cloud', category: 'general', term: { de: 'Lokal vs. Cloud', en: 'Local vs. cloud' }, page: '/privacy', links: [L_KARPATHY_USE] },
  { id: 'open-weights', category: 'general', term: { de: 'Open Weights', en: 'Open weights' }, page: '/privacy' },
]

interface TermContent {
  aliases: { de: string[]; en: string[] }
  short: Bilingual
  long: Bilingual
}

/**
 * Inhalt je Begriff. Wird vom Glossar-Content-Workflow (kategorieweise,
 * zweisprachig, danach editor-poliert) erzeugt und hier eingetragen.
 */
const TERM_CONTENT: Record<string, TermContent> = {
  "token": {
    "aliases": {
      "de": [
        "Tokens",
        "Token-ID",
        "Token-IDs",
        "Textbaustein",
        "Textbausteine"
      ],
      "en": [
        "tokens",
        "token ID",
        "token IDs",
        "text chunk",
        "text chunks"
      ]
    },
    "short": {
      "de": "Ein Token ist ein kleiner Textbaustein – ein Zeichen, Wortteil oder ganzes Wort –, mit dem ein Sprachmodell rechnet.",
      "en": "A token is a small chunk of text – a character, word part, or whole word – that a language model works with."
    },
    "long": {
      "de": "Ein Token ist die kleinste Einheit, in die ein Sprachmodell Text zerlegt: mal ein ganzes Wort, mal nur ein Wortteil oder ein einzelnes Zeichen. Jedes Token bekommt eine Zahl (die Token-ID), denn das Modell verarbeitet keine Buchstaben, sondern nur Zahlen. „Programmieren“ kann zum Beispiel in „Program“ + „m“ + „ieren“ zerfallen – ein Wort, drei Tokens.",
      "en": "A token is the smallest unit a language model breaks text into: sometimes a whole word, sometimes just a word part or a single character. Each token is mapped to a number (its token ID), because the model processes numbers rather than letters. \"Programming\" might split into \"Program\" + \"m\" + \"ing\" – one word, three tokens."
    }
  },
  "tokenization": {
    "aliases": {
      "de": [
        "tokenisiert",
        "tokenisieren",
        "Zerlegung in Tokens",
        "BPE",
        "Byte Pair Encoding",
        "Tokenizer"
      ],
      "en": [
        "tokenize",
        "tokenizing",
        "tokenized",
        "BPE",
        "Byte Pair Encoding",
        "tokenizer"
      ]
    },
    "short": {
      "de": "Tokenisierung ist das Zerlegen von Text in Tokens, bevor ein Modell ihn verarbeiten kann.",
      "en": "Tokenization is splitting text into tokens before a model can process it."
    },
    "long": {
      "de": "Tokenisierung ist der erste Schritt, bevor ein Modell Text verarbeitet: Der Text wird in Tokens zerschnitten und jedes Token einer Zahl zugeordnet. Üblich ist dafür der BPE-Algorithmus (Byte Pair Encoding), der häufige Zeichenfolgen zu eigenen Tokens zusammenfasst und seltene Wörter in kleinere Stücke aufteilt. Die Tokens müssen nicht mit Wörtern übereinstimmen.",
      "en": "Tokenization is the first step before a model processes text: the text is cut into tokens and each token is mapped to a number. The common method is the BPE algorithm (Byte Pair Encoding), which merges frequent character sequences into their own tokens and splits rare words into smaller pieces. Tokens need not line up with words."
    }
  },
  "embedding": {
    "aliases": {
      "de": [
        "Embeddings",
        "Einbettung",
        "Einbettungen",
        "Bedeutungsvektor",
        "Bedeutungsvektoren",
        "Wortvektor",
        "Wortvektoren",
        "eingebettet"
      ],
      "en": [
        "embeddings",
        "embedded",
        "meaning vector",
        "meaning vectors",
        "word vector",
        "word vectors"
      ]
    },
    "short": {
      "de": "Ein Embedding ist eine lange Zahlenliste, die die Bedeutung eines Tokens erfasst; ähnliche Bedeutungen bekommen ähnliche Zahlen.",
      "en": "An embedding is a long list of numbers that captures a token's meaning; similar meanings get similar numbers."
    },
    "long": {
      "de": "Ein Embedding übersetzt Bedeutung in Zahlen: Jedes Wort wird zu einem langen Zahlenvektor (oft mehrere hundert Zahlen). Das Besondere ist, dass Wörter mit ähnlicher Bedeutung ähnliche Vektoren bekommen – „Hund“ und „Katze“ liegen nah beieinander, „Hund“ und „Mathematik“ weit auseinander. So wird Ähnlichkeit von Bedeutung messbar; das ist die Grundlage von semantischer Suche und RAG.",
      "en": "An embedding translates meaning into numbers: each word becomes a long vector of numbers (often several hundred). The key point is that words with similar meanings get similar vectors – \"dog\" and \"cat\" land close together, \"dog\" and \"mathematics\" far apart. This makes similarity of meaning measurable; it is the basis of semantic search and RAG."
    }
  },
  "vector": {
    "aliases": {
      "de": [
        "Vektoren",
        "Zahlenvektor",
        "Zahlenvektoren",
        "Zahlenliste",
        "Zahlenlisten"
      ],
      "en": [
        "vectors",
        "number vector",
        "number vectors",
        "list of numbers"
      ]
    },
    "short": {
      "de": "Ein Vektor ist eine geordnete Liste von Zahlen; ein Embedding ist genau so ein Vektor.",
      "en": "A vector is an ordered list of numbers; an embedding is exactly such a vector."
    },
    "long": {
      "de": "Ein Vektor ist eine geordnete Liste von Zahlen. Man kann ihn sich als Punkt in einem Raum vorstellen: Bei zwei Zahlen ist es eine Fläche, bei 768 Zahlen ein 768-dimensionaler Raum, den man nicht mehr zeichnen kann. In einem Sprachmodell ist jedes Wort, jedes Bild-Stück und jede Bedeutung ein solcher Vektor – und die Nähe zweier Vektoren misst ihre Ähnlichkeit.",
      "en": "A vector is an ordered list of numbers. You can picture it as a point in a space: two numbers make a plane, 768 numbers a 768-dimensional space that can no longer be drawn. In a language model every word, image patch, and meaning is such a vector – and the closeness of two vectors measures how similar they are."
    }
  },
  "vocabulary": {
    "aliases": {
      "de": [
        "Vokabulars",
        "Token-Vokabular",
        "Token-Liste",
        "Wortschatz des Modells"
      ],
      "en": [
        "vocab",
        "token vocabulary",
        "token list",
        "model's vocabulary"
      ]
    },
    "short": {
      "de": "Das Vokabular ist die feste Liste aller Tokens, die ein Modell kennt – oft über 50 000 Stück.",
      "en": "The vocabulary is the fixed list of all tokens a model knows – often more than 50,000."
    },
    "long": {
      "de": "Das Vokabular ist die feste Sammlung aller Tokens, die ein Modell unterscheiden kann; in modernen Modellen sind das oft über 50 000. Jeder Eintrag hat eine eigene Token-ID, und nur diese Bausteine kann das Modell lesen oder schreiben. Bei jedem Schritt vergibt das Modell jedem Token des Vokabulars eine Wahrscheinlichkeit, das nächste zu sein.",
      "en": "The vocabulary is the fixed set of all tokens a model can distinguish; in modern models often more than 50,000. Each entry has its own token ID, and these building blocks are the only things the model can read or write. At every step the model assigns each token in the vocabulary a probability of being the next one."
    }
  },
  "training-data": {
    "aliases": {
      "de": [
        "Trainingsdaten",
        "Trainingsdatensatz",
        "Trainingstexte",
        "Pretraining-Daten",
        "Trainingsmaterial"
      ],
      "en": [
        "training data",
        "training dataset",
        "training texts",
        "pre-training data",
        "pretraining data"
      ]
    },
    "short": {
      "de": "Trainingsdaten sind die Texte, aus denen ein Modell lernt; es kennt nur, was darin vorkommt.",
      "en": "Training data is the text a model learns from; it only knows what appears in it."
    },
    "long": {
      "de": "Trainingsdaten sind die Texte, aus denen ein Sprachmodell Sprache lernt – meist ein riesiger, ungeordneter Querschnitt des Webs mit Milliarden von Tokens. Aus dem rohen Web wird über 90 Prozent wieder verworfen: Duplikate und Müll fliegen raus, der Rest wird nach Qualität gefiltert. Welche Texte übrig bleiben, prägt das Wissen, die Fähigkeiten und die blinden Flecken des Modells.",
      "en": "Training data is the text a language model learns language from – usually a vast, unordered cross-section of the web with billions of tokens. More than 90 percent of the raw web is thrown away: duplicates and junk are removed, and the rest is filtered for quality. Which texts survive shapes the model's knowledge, abilities, and blind spots."
    }
  },
  "context-window": {
    "aliases": {
      "de": [
        "Kontextfenster",
        "Kontextlänge",
        "Kontext-Grenze",
        "Kontextgröße"
      ],
      "en": [
        "context window",
        "context length",
        "context limit",
        "context size"
      ]
    },
    "short": {
      "de": "Das Kontextfenster ist die maximale Menge an Tokens, die ein Modell auf einmal berücksichtigen kann.",
      "en": "The context window is the maximum amount of tokens a model can take into account at once."
    },
    "long": {
      "de": "Das Kontextfenster ist die Menge an Text – gemessen in Tokens –, die ein Modell bei einer Antwort gleichzeitig im Blick hat: die Eingabe plus das bisher Geschriebene. Alles innerhalb dieses Fensters kann die nächste Vorhersage beeinflussen; was darüber hinausgeht, fällt aus dem Blick. Bei langen Gesprächen oder Dokumenten entscheidet diese Grenze, woran sich das Modell noch „erinnert“.",
      "en": "The context window is the amount of text – measured in tokens – a model can keep in view at once while answering: the input plus what it has written so far. Everything within this window can shape the next prediction; anything beyond it drops out of view. For long conversations or documents, this limit decides what the model still \"remembers\"."
    }
  },
  "data-bias": {
    "aliases": {
      "de": [
        "Verzerrungen",
        "verzerrt",
        "Schlagseite",
        "Vorurteil",
        "Vorurteile",
        "Stereotyp",
        "Stereotype"
      ],
      "en": [
        "biases",
        "biased",
        "stereotype",
        "stereotypes"
      ]
    },
    "short": {
      "de": "Eine systematische Schlagseite in den Ausgaben eines Modells, die aus den Mustern seiner Trainingsdaten stammt.",
      "en": "A systematic slant in a model's output that comes from the patterns in its training data."
    },
    "long": {
      "de": "Verzerrung (englisch Bias) meint hier nicht den Schwellenwert eines Neurons, sondern eine Schieflage im Verhalten eines Modells: Es verbindet zum Beispiel Berufe enger mit einem Geschlecht, als es der Wirklichkeit entspricht. Niemand hat das einprogrammiert – das Muster steckt in den Texten, aus denen das Modell gelernt hat, und wird beim Feinschliff mit menschlichem Feedback eher überdeckt als entfernt. Weil die Verzerrung nicht an einer Stelle sitzt, sondern über den ganzen Vektor verteilt ist, lässt sie sich abmildern, aber nicht per Knopfdruck löschen.",
      "en": "Bias here does not mean a neuron's threshold but a slant in a model's behaviour: it may tie jobs to a gender more tightly than reality does. Nobody programmed that in – the pattern sits in the texts the model learned from, and fine-tuning with human feedback tends to cover it up rather than remove it. Because the bias is spread across the whole vector rather than sitting in one place, it can be softened but not deleted at the push of a button."
    }
  },
  "multimodal": {
    "aliases": {
      "de": [
        "multimodale",
        "multimodaler",
        "multimodales",
        "multimodalen",
        "Multimodalität"
      ],
      "en": [
        "multimodal",
        "multimodality",
        "multi-modal"
      ]
    },
    "short": {
      "de": "Multimodal heißt, dass ein Modell nicht nur Text, sondern auch Bilder, Ton und teils Video verarbeitet.",
      "en": "Multimodal means a model handles not just text but also images, sound, and sometimes video."
    },
    "long": {
      "de": "Multimodal beschreibt ein Modell, das mehr als nur Text verarbeitet – auch Bilder, Ton und teils Video. Der Trick ist, dass alles in dieselbe Zahlensprache übersetzt wird: Ein Bild wird in Kacheln zerlegt und jede zu einem Vektor im selben Bedeutungsraum wie die Text-Tokens; Ton wird zuerst in ein „Bild des Klangs“ verwandelt. So muss das Modell nichts neu lernen – eine Bild-Kachel ist für es bloß ein weiteres Stück in der Reihe.",
      "en": "Multimodal describes a model that handles more than just text – also images, sound, and sometimes video. The trick is that everything is translated into the same number-language: an image is cut into tiles, each turned into a vector in the same meaning space as the text tokens; sound is first turned into a \"picture of the sound\". So the model needn't relearn anything – an image tile is just one more piece in the row."
    }
  },
  "pretraining": {
    "aliases": {
      "de": [
        "Vortraining",
        "Pretraining",
        "vortrainiert",
        "Vortrainings",
        "Pretrainings",
        "Pretraining-Daten"
      ],
      "en": [
        "pre-training",
        "pretrained",
        "pre-trained",
        "pretraining data"
      ]
    },
    "short": {
      "de": "Die erste und längste Trainingsphase, in der ein Modell allein durch Vorhersage des nächsten Textstücks Sprache von Grund auf lernt.",
      "en": "The first and longest training phase, in which a model learns language from scratch by predicting the next piece of text."
    },
    "long": {
      "de": "Pretraining ist die erste und längste Phase im Aufbau eines Sprachmodells. Das Modell bekommt riesige Mengen Text und lernt eine einzige Aufgabe: das jeweils nächste Wortstück vorhersagen. Dabei wird es nach jedem Fehler ein winziges Stück nachjustiert – millionenfach. So entsteht das Sprach- und Weltwissen, auf dem alle späteren Schritte aufbauen; die Daten sind dabei kein Lehrbuch, sondern ein Querschnitt dessen, was online steht.",
      "en": "Pretraining is the first and longest phase of building a language model. The model is fed huge amounts of text and learns a single task: predicting the next chunk of text. After each mistake it is nudged a tiny bit, repeated millions of times. This builds the language and world knowledge that every later step relies on; the data is not a textbook but a cross-section of whatever happens to be online."
    }
  },
  "finetuning": {
    "aliases": {
      "de": [
        "Fine-tuning",
        "Feinschliff",
        "finegetunt",
        "Instruction-Tuning",
        "Supervised Fine-Tuning",
        "SFT",
        "feinjustiert"
      ],
      "en": [
        "fine-tuning",
        "finetuning",
        "fine-tuned",
        "instruction tuning",
        "supervised fine-tuning",
        "SFT"
      ]
    },
    "short": {
      "de": "Ein kürzeres Nachtraining, das dem vortrainierten Modell das Verhalten eines Assistenten beibringt – direkt antworten statt nur weiterschreiben.",
      "en": "A shorter follow-up training that teaches the pretrained model to behave like an assistant – to answer directly instead of just continuing the text."
    },
    "long": {
      "de": "Nach dem Pretraining ist ein Modell ein treffsicherer Text-Fortsetzer, aber kein Assistent: Es schreibt einfach weiter, was wahrscheinlich käme. Beim Finetuning (auch Instruction-Tuning oder Supervised Fine-Tuning, kurz SFT) trainiert man es mit Tausenden Beispielgesprächen aus Anfrage und idealer Antwort. So lernt es ein festes Gesprächsformat und die Gewohnheit, Anweisungen zu folgen und aufzuhören, wenn die Antwort fertig ist. Das Wissen stammt fast ganz aus dem Pretraining – Finetuning bringt vor allem das Verhalten bei.",
      "en": "After pretraining a model is a capable text continuer but not an assistant: it just keeps writing what would likely come next. Fine-tuning (also called instruction tuning or supervised fine-tuning, SFT for short) trains it on thousands of example conversations made of a request and an ideal answer. From these it learns a fixed conversation format and the habit of following instructions and stopping when the answer is done. The knowledge comes almost entirely from pretraining – fine-tuning mainly instils the behaviour."
    }
  },
  "rlhf": {
    "aliases": {
      "de": [
        "Reinforcement Learning from Human Feedback",
        "Lernen aus menschlichem Feedback"
      ],
      "en": [
        "Reinforcement Learning from Human Feedback",
        "learning from human feedback"
      ]
    },
    "short": {
      "de": "Ein Trainingsschritt, bei dem das Modell aus menschlichen Vergleichen lernt, welche Antwort die bessere ist.",
      "en": "A training step in which the model learns from human comparisons which of two answers is the better one."
    },
    "long": {
      "de": "RLHF steht für Reinforcement Learning from Human Feedback. Was eine gute Antwort ausmacht, lässt sich kaum als Regel aufschreiben – aber Menschen können bei zwei Antworten leicht sagen, welche besser ist. In drei Schritten sammelt man tausende solcher Vergleiche, lernt daraus ein Belohnungsmodell, das die menschlichen Vorlieben als Punktzahl vorhersagt, und optimiert das Sprachmodell dann auf hohe Bewertungen. So nimmt es Werte auf, die niemand direkt programmieren könnte.",
      "en": "RLHF stands for Reinforcement Learning from Human Feedback. What makes an answer good is hard to write down as a rule – but people can easily say which of two answers is better. In three steps you collect thousands of such comparisons, learn a reward model from them that predicts those preferences as a score, and then optimise the language model toward high scores. This way it picks up values nobody could program directly."
    }
  },
  "reward-model": {
    "aliases": {
      "de": [
        "Belohnungsmodell",
        "Belohnungsmodells",
        "Belohnungsmodelle",
        "Belohnungssignal"
      ],
      "en": [
        "reward model",
        "reward models",
        "reward signal",
        "learned reward"
      ]
    },
    "short": {
      "de": "Ein gelerntes Modell, das menschliche Vorlieben nachahmt und jeder Antwort eine Punktzahl gibt, statt dass ein Mensch jede einzeln bewertet.",
      "en": "A learned model that imitates human preferences and gives every answer a score, so a human need not rate each one by hand."
    },
    "long": {
      "de": "Das Belohnungsmodell ist das Herzstück von RLHF. Aus tausenden menschlichen Vergleichen lernt es, für jede beliebige Antwort vorherzusagen, wie sehr Menschen sie mögen würden – ausgedrückt als eine Zahl. Diese Zahl ersetzt im weiteren Training den Menschen: Das Sprachmodell wird so optimiert, dass es Antworten erzeugt, die das Belohnungsmodell hoch bewertet. Der Haken: Es ist nur ein Stellvertreter für echten Geschmack und lässt sich austricksen.",
      "en": "The reward model is the heart of RLHF. From thousands of human comparisons it learns to predict, for any answer, how much people would like it – expressed as a single number. That number then replaces the human in further training: the language model is optimised to produce answers the reward model scores highly. The catch: it is only a stand-in for real taste and can be gamed."
    }
  },
  "bradley-terry": {
    "aliases": {
      "de": [
        "Bradley-Terry",
        "Bradley-Terry-Methode",
        "Bradley–Terry-Modell"
      ],
      "en": [
        "Bradley-Terry",
        "Bradley–Terry",
        "Bradley-Terry method"
      ]
    },
    "short": {
      "de": "Eine Methode, die aus vielen Paarvergleichen für jede Option eine Punktzahl errechnet – wer öfter gewinnt, bekommt mehr Punkte.",
      "en": "A method that turns many pairwise comparisons into a score for each option – whatever wins more often gets more points."
    },
    "long": {
      "de": "Das Bradley-Terry-Modell ist die Mathematik hinter dem Belohnungsmodell. Es nimmt lauter Vergleiche der Form „A ist besser als B“ und leitet daraus für jede Antwort eine einzelne Punktzahl ab, sodass die beobachteten Vergleiche möglichst gut passen. Je größer der Punktabstand, desto sicherer wird die eine Antwort der anderen vorgezogen. Große RLHF-Systeme nutzen genau diese Methode, nur mit einem riesigen Netz statt weniger ablesbarer Merkmale.",
      "en": "The Bradley–Terry model is the maths behind the reward model. It takes many comparisons of the form \"A is better than B\" and derives a single score for each answer so that the observed comparisons fit as well as possible. The larger the gap in scores, the more confidently one answer is preferred over the other. Large RLHF systems use exactly this method, just with a huge network instead of a few legible traits."
    }
  },
  "reward-hacking": {
    "aliases": {
      "de": [
        "Reward-Hacking",
        "Belohnungshack"
      ],
      "en": [
        "reward hacking",
        "gaming the reward"
      ]
    },
    "short": {
      "de": "Wenn ein Modell die Belohnung hochtreibt, ohne wirklich besser zu werden – etwa durch lange, selbstsichere Antworten.",
      "en": "When a model drives up the reward without actually getting better – for example with long, confident answers."
    },
    "long": {
      "de": "Reward-Hacking entsteht, weil das Belohnungsmodell nur ein Stellvertreter für echten menschlichen Geschmack ist und das Sprachmodell hartnäckig auf diese eine Zahl optimiert. Findet es eine Antwort, die hoch bewertet wird, ohne wirklich zu helfen – lang, selbstsicher, schmeichelhaft –, nimmt es sie. Echte Systeme halten mit Sicherungen dagegen oder ersetzen die geratene Belohnung durch eine geprüfte, wie bei RLVR.",
      "en": "Reward hacking happens because the reward model is only a stand-in for real human taste, and the language model relentlessly optimises that single number. If it finds an answer that scores highly without truly helping – long, confident, flattering – it takes it. Real systems push back with safeguards, or replace the guessed reward with a checked one, as in RLVR."
    }
  },
  "rlvr": {
    "aliases": {
      "de": [
        "Reinforcement Learning with Verifiable Rewards",
        "überprüfbare Belohnung",
        "geprüfte Belohnung",
        "verifizierbare Belohnung"
      ],
      "en": [
        "Reinforcement Learning with Verifiable Rewards",
        "verifiable rewards",
        "verifiable reward"
      ]
    },
    "short": {
      "de": "Ein Trainingsschritt, bei dem ein Programm prüft, ob die Antwort wirklich stimmt, statt zu raten, ob sie gut klingt.",
      "en": "A training step where a program checks whether the answer is actually correct, instead of guessing whether it sounds good."
    },
    "long": {
      "de": "RLVR steht für Reinforcement Learning with Verifiable Rewards. Statt die Belohnung von einem gelernten Modell raten zu lassen, prüft ein Programm, ob die Antwort stimmt: Bei Mathe wird nachgerechnet, bei Code laufen Tests, beim Buchstabenzählen zählt man nach. Das Modell erzeugt viele Lösungswege, der Prüfer entscheidet bei jedem nur richtig oder falsch, und das Training macht die richtigen Wege wahrscheinlicher. Eine solche Belohnung lässt sich nicht überreden – das treibt moderne Reasoning-Modelle an.",
      "en": "RLVR stands for Reinforcement Learning with Verifiable Rewards. Instead of letting a learned model guess the reward, a program checks whether the answer is right: maths is recomputed, code is run against tests, letter counts are counted. The model produces many solution paths, the verifier rules each one simply correct or wrong, and training makes the correct paths more likely. Such a reward cannot be talked into anything – this is what powers modern reasoning models."
    }
  },
  "verifier": {
    "aliases": {
      "de": [
        "Prüfer",
        "Prüfers"
      ],
      "en": [
        "verifier",
        "verifiers",
        "checker"
      ]
    },
    "short": {
      "de": "Ein Stück Code, das eine Antwort objektiv nachrechnet und richtig oder falsch sagt – ohne Meinung oder Schätzung.",
      "en": "A piece of code that objectively recomputes an answer and says right or wrong – with no opinion or guessing."
    },
    "long": {
      "de": "Der Prüfer ist das Kernstück von RLVR: ein Stück Code, das eine Antwort nicht bewertet, sondern überprüft. Er rechnet die Mathe nach, lässt die Tests laufen oder zählt die Buchstaben direkt im Wort. Das Ergebnis ist die Wahrheit, gegen die jeder Versuch geprüft wird – keine Schätzung, keine Meinung. Manche falschen Versuche klingen genauso überzeugend wie die richtigen; den Prüfer beirrt das nicht, und genau deshalb lässt er sich nicht austricksen.",
      "en": "The verifier is the core of RLVR: a piece of code that does not rate an answer but checks it. It recomputes the maths, runs the tests, or counts the letters directly in the word. The result is the truth every attempt is measured against – no guessing, no opinion. Some wrong attempts sound just as convincing as the correct ones; the verifier is not swayed, which is exactly why it cannot be fooled."
    }
  },
  "loss": {
    "aliases": {
      "de": [
        "Verlust",
        "Fehlerwert",
        "Verlustkurve",
        "Fehlerlandschaft",
        "Kreuzentropie"
      ],
      "en": [
        "loss",
        "loss curve",
        "cross-entropy"
      ]
    },
    "short": {
      "de": "Eine Zahl, die misst, wie falsch die Vorhersage des Modells war – je kleiner, desto besser.",
      "en": "A number that measures how wrong the model's prediction was – the smaller, the better."
    },
    "long": {
      "de": "Der Verlust (Loss) ist der Hebel beim Lernen: eine Zahl, die misst, wie schlecht das Modell das richtige Ergebnis vorhergesagt hat. Aus diesem Fehler lässt sich für jede einzelne Zahl im Modell ausrechnen, in welche Richtung sie ihn kleiner macht – und genau dorthin wird sie ein winziges Stück verschoben. Man kann sich den Verlust als Landschaft über den Gewichten vorstellen, in der das Training bergab sucht.",
      "en": "The loss is the lever for learning: a number that measures how badly the model predicted the correct result. From this error you can work out, for every single number in the model, which direction makes it smaller – and that is exactly where each number is nudged a tiny bit. You can picture the loss as a landscape over the weights, in which training searches downhill."
    }
  },
  "epoch": {
    "aliases": {
      "de": [
        "Epoche",
        "Epochen",
        "Trainingsepoche",
        "Trainingsdurchlauf"
      ],
      "en": [
        "epoch",
        "epochs",
        "training epoch",
        "pass over the data"
      ]
    },
    "short": {
      "de": "Ein vollständiger Durchgang des Modells durch den gesamten Trainingsdatensatz.",
      "en": "One complete pass of the model through the entire training dataset."
    },
    "long": {
      "de": "Eine Epoche ist ein vollständiger Durchlauf durch alle Trainingsbeispiele. Nach jedem Beispiel justiert das Modell seine Stellschrauben ein wenig nach; ist der ganze Datensatz einmal durch, ist eine Epoche vorbei. Lernen braucht meist viele Epochen, weil das Modell dieselben Daten wieder und wieder sieht und mit jedem Durchgang etwas treffsicherer wird. Zu viele Epochen auf zu wenig Daten können allerdings zu Überanpassung führen.",
      "en": "An epoch is one full pass through all the training examples. After each example the model adjusts its tuning knobs a little; once the whole dataset has been seen once, one epoch is done. Learning usually takes many epochs, because the model sees the same data again and again and gets a bit more accurate with each pass. Too many epochs on too little data, however, can lead to overfitting."
    }
  },
  "overfitting": {
    "aliases": {
      "de": [
        "Überanpassung",
        "überangepasst",
        "auswendig gelernt",
        "auswendig lernen"
      ],
      "en": [
        "overfitting",
        "overfit",
        "memorising"
      ]
    },
    "short": {
      "de": "Wenn ein Modell die Trainingsbeispiele auswendig lernt statt die Regel dahinter und an neuen Daten dann scheitert.",
      "en": "When a model memorises the training examples instead of the underlying rule and then fails on new data."
    },
    "long": {
      "de": "Überanpassung heißt: Das Modell trifft die Trainingsdaten perfekt, scheitert aber an neuen, ungesehenen Beispielen. Es hat die Zufälligkeiten und das Rauschen im Trainingssatz auswendig gelernt statt die zugrunde liegende Regel. Oft entsteht das durch ein zu großes Modell oder zu viele Durchläufe auf zu wenig Daten; ein kleineres Modell zieht eine glattere Grenze und verallgemeinert meist besser. Diese Abwägung steckt hinter jedem echten Training.",
      "en": "Overfitting means the model fits the training data perfectly but fails on new, unseen examples. It has memorised the quirks and noise of the training set instead of the underlying rule. It often comes from a model that is too large, or too many passes over too little data; a smaller model draws a smoother boundary and usually generalises better. This trade-off sits behind every real training run."
    }
  },
  "train-test-split": {
    "aliases": {
      "de": [
        "Train/Test-Split",
        "Trainings- und Testdaten",
        "Testdaten",
        "Test-Genauigkeit",
        "Trainings-Genauigkeit"
      ],
      "en": [
        "train/test split",
        "training and test data",
        "test data",
        "test accuracy",
        "held-out data"
      ]
    },
    "short": {
      "de": "Die Aufteilung der Daten in einen Teil zum Trainieren und einen zurückgehaltenen Teil zum Prüfen, ob das Gelernte auch auf Neues passt.",
      "en": "Splitting the data into one part for training and a held-back part to check whether what was learned also fits new cases."
    },
    "long": {
      "de": "Beim Train/Test-Split teilt man die Daten in zwei Teile: Mit den Trainingsdaten lernt das Modell, die zurückgehaltenen Testdaten sieht es beim Lernen nie. Erst der Vergleich beider Genauigkeiten zeigt, ob das Modell wirklich die Regel gelernt hat oder nur auswendig: Bleibt die Test-Genauigkeit hinter der Trainings-Genauigkeit zurück, ist das ein Zeichen für Überanpassung. So macht der Split sichtbar, ob das Gelernte auch auf Neues passt.",
      "en": "In a train/test split the data is divided into two parts: the model learns from the training data and never sees the held-back test data during learning. Only comparing the two accuracies reveals whether the model truly learned the rule or just memorised: if test accuracy lags behind training accuracy, that is a sign of overfitting. The split makes visible whether what was learned also fits new cases."
    }
  },
  "parameters": {
    "aliases": {
      "de": [
        "Parameter",
        "Gewichte",
        "Stellschrauben",
        "Modellparameter",
        "Milliarden Parameter"
      ],
      "en": [
        "parameters",
        "weights",
        "model parameters",
        "billions of parameters"
      ]
    },
    "short": {
      "de": "Die einstellbaren Zahlen im Modell, die beim Training nachjustiert werden und das Gelernte speichern.",
      "en": "The adjustable numbers inside the model that get tuned during training and store what it has learned."
    },
    "long": {
      "de": "Parameter, auch Gewichte genannt, sind die einstellbaren Zahlen im Inneren eines Modells – seine Stellschrauben. Jeder Parameter sagt, wie stark ein Signal weitergegeben wird; zusammen bilden sie alles, was das Modell kann. Beim Training wird jeder einzelne ein winziges Stück in die Richtung verschoben, die den Fehler verkleinert. Große Sprachmodelle haben Milliarden davon, und ihre Zahl bestimmt mit, wie viel Speicher das Modell braucht.",
      "en": "Parameters, also called weights, are the adjustable numbers inside a model – its tuning knobs. Each parameter says how strongly a signal is passed on; together they make up everything the model can do. During training each one is nudged a tiny step in the direction that reduces the error. Large language models have billions of them, and their count partly determines how much memory the model needs."
    }
  },
  "inference": {
    "aliases": {
      "de": [
        "Inferenz",
        "Inferenz-Phase",
        "Anwendungsphase",
        "Anwendung des Modells"
      ],
      "en": [
        "inference",
        "inference phase",
        "at inference time",
        "inference time"
      ]
    },
    "short": {
      "de": "Die Phase, in der ein fertig trainiertes Modell angewendet wird und Antworten erzeugt.",
      "en": "The phase in which a finished, trained model is used to produce answers."
    },
    "long": {
      "de": "Inferenz ist die Anwendungsphase eines Sprachmodells: Das Training ist abgeschlossen, alle Parameter stehen fest, und das Modell wendet nur noch an, was es gelernt hat. Wer mit einer KI chattet, löst Inferenz aus. Im Kern besteht sie aus der Vorhersage des nächsten Tokens, wieder und wieder.",
      "en": "Inference is the application phase of a language model: training is over, all parameters are fixed, and the model simply applies what it has learned. Chatting with an AI triggers inference. At its core it consists of predicting the next token, over and over."
    }
  },
  "next-token-prediction": {
    "aliases": {
      "de": [
        "Next-Token-Prediction",
        "Next-Token-Vorhersage",
        "Vorhersage des nächsten Tokens",
        "nächstes Token vorhersagen",
        "Token für Token"
      ],
      "en": [
        "next token prediction",
        "predicting the next token",
        "next-token",
        "token by token"
      ]
    },
    "short": {
      "de": "Der Grundvorgang jedes Sprachmodells: für den bisherigen Text das wahrscheinlichste nächste Token bestimmen.",
      "en": "The basic operation of every language model: choosing the most likely next token for the text so far."
    },
    "long": {
      "de": "Bei der Next-Token-Vorhersage berechnet das Modell für jedes mögliche nächste Token eine Wahrscheinlichkeit – zur Wahl stehen Zehntausende, aber nur eine Handvoll ist wirklich wahrscheinlich. Einen ganzen Text erzeugt es durch Wiederholung: Token anhängen, neu rechnen, nächstes Token wählen. So entsteht Wort für Wort ein ganzer Satz.",
      "en": "In next-token prediction the model computes a probability for every possible next token – there are tens of thousands to choose from, but only a handful are truly likely. It produces a whole text by repetition: append a token, recompute, pick the next one. Word by word, a full sentence emerges."
    }
  },
  "logits": {
    "aliases": {
      "de": [
        "Logits",
        "Logit",
        "Roh-Werte des Modells"
      ],
      "en": [
        "logits",
        "logit",
        "raw scores"
      ]
    },
    "short": {
      "de": "Die rohen, noch nicht normierten Zahlen, die ein Modell jedem möglichen nächsten Token zuweist.",
      "en": "The raw, not-yet-normalised numbers a model assigns to every possible next token."
    },
    "long": {
      "de": "Logits sind die unbearbeiteten Punktzahlen, die das Modell ganz am Ende für jedes mögliche nächste Token ausgibt – ein höherer Wert bedeutet „passt besser“. Sie sind noch keine Wahrscheinlichkeiten; erst die Softmax-Funktion rechnet sie in eine Verteilung um, die sich zu 100 % addiert.",
      "en": "Logits are the unprocessed scores the model outputs at the very end for each possible next token – a higher value means \"fits better\". They are not yet probabilities; the softmax function turns them into a distribution that adds up to 100%."
    }
  },
  "logprobs": {
    "aliases": {
      "de": [
        "Logprobs",
        "Logprob",
        "Log-Wahrscheinlichkeit",
        "Log-Wahrscheinlichkeiten"
      ],
      "en": [
        "logprobs",
        "logprob",
        "log probability",
        "log probabilities",
        "log-probs"
      ]
    },
    "short": {
      "de": "Die Wahrscheinlichkeit eines Tokens im logarithmischen Maßstab – ein Maß dafür, wie sicher sich das Modell ist.",
      "en": "A token's probability on a logarithmic scale – a measure of how sure the model is."
    },
    "long": {
      "de": "Logprobs sind die Token-Wahrscheinlichkeiten in logarithmischer Form und machen sichtbar, wie sicher oder unsicher ein Modell beim nächsten Token ist. Trägt ein einzelner Balken fast die ganze Wahrscheinlichkeit, ist sich das Modell sicher; sind die Balken flach und zerstreut, rät es. Im fertigen Text klingt beides gleich überzeugt – die Logprobs zeigen den Unterschied.",
      "en": "Logprobs are token probabilities in logarithmic form, and they reveal how sure or unsure a model is about the next token. If a single bar carries almost all the probability, the model is confident; if the bars are flat and spread out, it is guessing. In the finished text both sound equally confident – the logprobs show the difference."
    }
  },
  "softmax": {
    "aliases": {
      "de": [
        "Softmax",
        "Softmax-Funktion"
      ],
      "en": [
        "softmax",
        "softmax function"
      ]
    },
    "short": {
      "de": "Die Funktion, die rohe Modellwerte in echte Wahrscheinlichkeiten umrechnet, die sich zu 100 % addieren.",
      "en": "The function that turns raw model scores into real probabilities that add up to 100%."
    },
    "long": {
      "de": "Softmax ist der Rechenschritt, der die rohen Logits in eine Wahrscheinlichkeitsverteilung verwandelt: Aus beliebigen Zahlen werden Werte zwischen 0 und 1, die sich zusammen zu 100 % addieren. Große Vorsprünge werden dabei betont, sodass das wahrscheinlichste Token klar heraussticht. Dieselbe Funktion macht aus den Relevanz-Werten der Attention die fertigen Gewichte.",
      "en": "Softmax is the step that turns the raw logits into a probability distribution: arbitrary numbers become values between 0 and 1 that together add up to 100%. Large leads get emphasised, so the most likely token stands out clearly. The same function turns attention's relevance scores into finished weights."
    }
  },
  "temperature": {
    "aliases": {
      "de": [
        "Temperatur",
        "Temperatur-Regler",
        "niedrige Temperatur",
        "hohe Temperatur"
      ],
      "en": [
        "temperature",
        "temperature setting",
        "low temperature",
        "high temperature"
      ]
    },
    "short": {
      "de": "Ein Regler, der steuert, wie risikofreudig ein Modell aus den Wahrscheinlichkeiten das nächste Token wählt.",
      "en": "A dial that controls how boldly a model picks the next token from the probabilities."
    },
    "long": {
      "de": "Die Temperatur steuert, wie „mutig“ das Modell wählt. Niedrig heißt: Es nimmt fast immer das wahrscheinlichste Token – verlässlich, aber vorhersehbar. Hoch heißt: Die Verteilung wird flacher, auch unwahrscheinlichere Tokens kommen zum Zug – der Text wird kreativer und unberechenbarer.",
      "en": "Temperature controls how \"boldly\" the model chooses. Low means it almost always takes the most likely token – reliable but predictable. High means the distribution flattens, so less likely tokens get their turn too – the text becomes more creative and less predictable."
    }
  },
  "sampling": {
    "aliases": {
      "de": [
        "Sampling",
        "Sampling-Schritt",
        "Token ziehen"
      ],
      "en": [
        "sampling",
        "sample",
        "sampling step",
        "drawing a token"
      ]
    },
    "short": {
      "de": "Das Ziehen des nächsten Tokens aus der Wahrscheinlichkeitsverteilung, statt immer das wahrscheinlichste zu nehmen.",
      "en": "Drawing the next token from the probability distribution instead of always taking the most likely one."
    },
    "long": {
      "de": "Sampling ist die Art, wie aus der Wahrscheinlichkeitsverteilung ein konkretes nächstes Token ausgewählt wird. Statt stur das wahrscheinlichste zu nehmen, wird per Zufall gezogen – wahrscheinliche Tokens öfter, unwahrscheinliche selten. Die Temperatur stellt ein, wie stark der Zufall mitspielt; deshalb klingt dieselbe Frage zweimal nicht wortgleich.",
      "en": "Sampling is how a concrete next token is selected from the probability distribution. Instead of stubbornly taking the most likely one, a token is drawn at random – likely tokens more often, unlikely ones rarely. Temperature sets how much randomness plays in; that is why the same question rarely comes back word for word the same."
    }
  },
  "attention": {
    "aliases": {
      "de": [
        "Attention",
        "Aufmerksamkeit",
        "Attention-Gewichte"
      ],
      "en": [
        "attention",
        "attention weights",
        "self-attention"
      ]
    },
    "short": {
      "de": "Der Mechanismus, mit dem jede Position im Text auf die bisherigen Wörter zurückschaut und gewichtet, was zählt.",
      "en": "The mechanism by which each position in the text looks back at earlier words and weights what matters."
    },
    "long": {
      "de": "Attention ist das Herzstück des Transformers: Jede Position kann sich über die bisherigen Wörter zurückblicken und gewichtet, was gerade zählt – worauf sich ein Wort wie „es“ bezieht, welche Wörter zusammengehören. So sammelt jede Position aus den früheren Wörtern das ein, was zu ihr passt, und ein Wort trägt erst dadurch die Bedeutung seines ganzen Satzes.",
      "en": "Attention is the heart of the transformer: each position looks back over the earlier words and weights what currently counts – what a word like \"it\" refers to, which words belong together. Each position gathers from the earlier words what fits it, and only through this does a word carry the meaning of its whole sentence."
    }
  },
  "qkv": {
    "aliases": {
      "de": [
        "Query",
        "Key",
        "Value",
        "Query-, Key- und Value-Projektionen",
        "Q·K·V"
      ],
      "en": [
        "query",
        "key",
        "value",
        "Q, K, V",
        "query-key-value"
      ]
    },
    "short": {
      "de": "Die drei Rollen in der Attention: eine Position fragt an (Query), Wörter bieten Schlüssel (Key) und Inhalt (Value).",
      "en": "The three roles inside attention: a position queries (Query), words offer a key (Key) and content (Value)."
    },
    "long": {
      "de": "Query, Key und Value sind die drei Bausteine, aus denen Attention ihre Gewichte berechnet. Jede Position stellt eine Anfrage (Query), jedes Wort hält einen Schlüssel (Key); ihr Skalarprodukt ergibt die Relevanz, Softmax macht daraus Gewichte, und die Ausgabe ist die gewichtete Mischung der Inhalte (Values). Diese drei Projektionen sind nicht eingebaut, sondern im Training gelernt.",
      "en": "Query, key and value are the three building blocks from which attention computes its weights. Each position poses a query, each word holds a key; their dot product gives the relevance, softmax turns that into weights, and the output is the weighted mix of the values. These three projections are not built in but learned during training."
    }
  },
  "transformer": {
    "aliases": {
      "de": [
        "Transformer",
        "Transformer-Architektur",
        "Transformer-Modell",
        "Transformer-Schicht"
      ],
      "en": [
        "transformer",
        "transformer architecture",
        "transformer model",
        "transformer layer"
      ]
    },
    "short": {
      "de": "Die Architektur, auf der heutige Sprachmodelle beruhen; ihr Kernbaustein ist die Attention.",
      "en": "The architecture today's language models are built on; its core building block is attention."
    },
    "long": {
      "de": "Der Transformer ist der Bauplan hinter heutigen Sprachmodellen. Sein Kern ist die Attention, mit der jede Position auf die bisherigen Wörter zurückschaut. Viele solcher Schichten werden übereinandergestapelt; über die Schichten hinweg entsteht so Schritt für Schritt ein immer reicheres Verständnis des Satzes.",
      "en": "The transformer is the blueprint behind today's language models. Its core is attention, with which each position looks back at the earlier words. Many such layers are stacked on top of each other; across the layers an ever richer understanding of the sentence is built up step by step."
    }
  },
  "chain-of-thought": {
    "aliases": {
      "de": [
        "Chain-of-Thought",
        "Gedankenkette",
        "Schritt für Schritt denken",
        "Lösungsweg ausschreiben"
      ],
      "en": [
        "chain-of-thought",
        "chain of thought",
        "CoT",
        "reasoning steps"
      ]
    },
    "short": {
      "de": "Das Modell schreibt seinen Lösungsweg aus, bevor es antwortet, und gibt sich die Zwischenschritte selbst als Kontext.",
      "en": "The model writes out its working before answering, handing itself the intermediate steps as context."
    },
    "long": {
      "de": "Chain-of-Thought heißt, dass das Modell seinen Lösungsweg ausschreibt, statt sofort zu antworten. Das ist nichts Magisches: Es sagt weiterhin nur das nächste Token voraus, gibt sich aber durch die Zwischenschritte selbst mehr Kontext – der Lösungsweg ist der sichtbar gemachte Arbeitsspeicher. Bei Rechenaufgaben entscheidet das oft über richtig und falsch.",
      "en": "Chain of thought means the model writes out its working instead of answering immediately. This is nothing magical: it still only predicts the next token, but the intermediate steps give it more context – the working is its memory made visible. On arithmetic problems this often decides between right and wrong."
    }
  },
  "hallucination": {
    "aliases": {
      "de": [
        "Halluzination",
        "Halluzinationen",
        "halluzinieren",
        "frei erfunden"
      ],
      "en": [
        "hallucination",
        "hallucinations",
        "hallucinate",
        "confabulation"
      ]
    },
    "short": {
      "de": "Eine Antwort, die flüssig und selbstsicher klingt, aber erfunden ist, weil das Modell die Lücke einfach füllt.",
      "en": "An answer that sounds fluent and confident but is invented, because the model simply fills the gap."
    },
    "long": {
      "de": "Eine Halluzination entsteht, weil ein Sprachmodell den wahrscheinlichsten nächsten Text vorhersagt – nicht die Wahrheit. Fehlt das Wissen, bricht es nicht ab, sondern setzt mit etwas Plausiblem fort und erfindet Romane, Lebensläufe oder Quellen mit glaubwürdigen Details. Aus dem Ton allein lässt sich das nicht erkennen: Das Modell klingt richtig wie falsch gleich überzeugt.",
      "en": "A hallucination arises because a language model predicts the most likely next text – not the truth. When knowledge is missing it does not stop but continues with something plausible, inventing novels, biographies or sources with credible details. The tone alone gives nothing away: the model sounds equally confident whether right or wrong."
    }
  },
  "rag": {
    "aliases": {
      "de": [
        "RAG",
        "Retrieval-Augmented Generation",
        "RAG-System"
      ],
      "en": [
        "RAG",
        "retrieval-augmented generation",
        "retrieval augmented generation",
        "RAG system"
      ]
    },
    "short": {
      "de": "Das Modell schlägt erst in einer Wissensquelle nach und stützt seine Antwort auf die gefundenen Dokumente.",
      "en": "The model first looks things up in a knowledge source and bases its answer on the documents it finds."
    },
    "long": {
      "de": "RAG steht für Retrieval-Augmented Generation: Statt nur aus dem Gedächtnis zu antworten, schlägt das Modell zuerst in einer Wissensquelle nach und stützt seine Antwort auf die passenden Dokumente. So kann es über Wissen sprechen, das es nie im Training gesehen hat – etwa ein internes Wiki oder frische Nachrichten. RAG ist aber nur so gut wie das, was die Suche findet.",
      "en": "RAG stands for retrieval-augmented generation: instead of answering from memory alone, the model first looks something up in a knowledge source and bases its answer on the matching documents. That lets it talk about knowledge it never saw in training – an internal wiki or fresh news, say. But RAG is only as good as what the search finds."
    }
  },
  "retrieval": {
    "aliases": {
      "de": [
        "Retrieval",
        "Heraussuchen",
        "Unterlagen heraussuchen",
        "passende Dokumente finden"
      ],
      "en": [
        "retrieval",
        "retrieve",
        "retrieving",
        "document retrieval"
      ]
    },
    "short": {
      "de": "Der Schritt in RAG, der zur Frage die passendsten Dokumente aus einer Wissensbasis heraussucht.",
      "en": "The step in RAG that pulls the most relevant documents from a knowledge base for the question."
    },
    "long": {
      "de": "Retrieval ist das Herz von RAG: das Heraussuchen der passenden Dokumente. Es ist genau die Ähnlichkeitssuche der Embeddings – die Frage wird in einen Vektor übersetzt und mit jedem Dokument verglichen, die ähnlichsten wandern als Kontext vor die Frage. Fehlt das richtige Dokument oder liegt ein ähnlich klingendes, aber falsches zuoberst, erdet sich die Antwort auf der falschen Quelle.",
      "en": "Retrieval is the heart of RAG: pulling up the matching documents. It is exactly the similarity search of embeddings – the question becomes a vector and is compared with every document, and the most similar ones are placed before the question as context. If the right document is missing, or a similar-sounding but wrong one sits on top, the answer grounds itself on the wrong source."
    }
  },
  "grounding": {
    "aliases": {
      "de": [
        "Grounding",
        "geerdet",
        "auf einer Quelle stützen",
        "auf Unterlagen stützen"
      ],
      "en": [
        "grounding",
        "grounded",
        "grounded answer",
        "grounding in sources"
      ]
    },
    "short": {
      "de": "Eine Antwort an konkrete, beigelegte Quellen binden, statt sie aus dem Gedächtnis raten zu lassen.",
      "en": "Tying an answer to concrete, supplied sources instead of letting it be guessed from memory."
    },
    "long": {
      "de": "Grounding heißt, eine Antwort auf konkrete Unterlagen zu stützen, die dem Modell zur Frage beigelegt werden, statt es aus dem Gedächtnis raten zu lassen. In RAG ist das der Punkt nach dem Heraussuchen: Das Modell formuliert seine Antwort aus den gefundenen Dokumenten. Sind diese falsch, erdet sich die Antwort auf der falschen Quelle – eine gute Grundlage zählt darum so viel wie das Modell selbst.",
      "en": "Grounding means basing an answer on concrete documents supplied to the model alongside the question, instead of letting it guess from memory. In RAG this is the point after retrieval: the model phrases its answer from the documents it found. If those are wrong, the answer grounds itself on the wrong source – so a good basis matters as much as the model itself."
    }
  },
  "vector-search": {
    "aliases": {
      "de": [
        "Vektorsuche",
        "Vektor-Suche",
        "semantische Suche",
        "Ähnlichkeitssuche",
        "Cosinus-Ähnlichkeit"
      ],
      "en": [
        "vector search",
        "semantic search",
        "similarity search",
        "cosine similarity"
      ]
    },
    "short": {
      "de": "Suche nach Bedeutung statt nach Stichwörtern: Texte werden als Vektoren verglichen, nicht Wort für Wort.",
      "en": "Search by meaning rather than keywords: texts are compared as vectors, not word for word."
    },
    "long": {
      "de": "Vektorsuche findet Texte nach Bedeutung statt nach übereinstimmenden Wörtern. Frage und Dokumente werden in Embeddings übersetzt – lange Zahlenvektoren –, und wie nah sich zwei davon stehen, misst die Cosinus-Ähnlichkeit. So findet die Suche auch passende Dokumente, in denen die Stichwörter der Frage gar nicht vorkommen. Das ist der Retrieval-Schritt in RAG.",
      "en": "Vector search finds texts by meaning rather than by matching words. The question and the documents are turned into embeddings – long number vectors – and how close two of them are is measured by cosine similarity. This way the search also finds relevant documents in which the question's keywords never appear. It is the retrieval step in RAG."
    }
  },
  "agent": {
    "aliases": {
      "de": [
        "Agent",
        "KI-Agent",
        "Agenten",
        "Agenten-Schleife"
      ],
      "en": [
        "agent",
        "AI agent",
        "agents",
        "agentic"
      ]
    },
    "short": {
      "de": "Ein Sprachmodell in einer Schleife, das Werkzeuge benutzt und deren Ergebnisse zurück in den Kontext bekommt.",
      "en": "A language model in a loop that uses tools and gets their results back into its context."
    },
    "long": {
      "de": "Ein Agent ist mechanisch kein neues Modell, sondern dasselbe Next-Token-Modell in einer Schleife: Es sagt Text voraus, und ist dieser Text ein Werkzeug-Aufruf, führt das Programm drumherum das Werkzeug aus und schreibt das Ergebnis zurück in den Kontext. Die „Handlungsfähigkeit“ steckt im Gerüst und in den Werkzeugen, nicht im Modell selbst.",
      "en": "An agent is mechanically not a new model but the same next-token model placed in a loop: it predicts text, and when that text is a tool call, the program around it runs the tool and writes the result back into the context. The \"agency\" lives in the scaffold and the tools, not in the model itself."
    }
  },
  "function-calling": {
    "aliases": {
      "de": [
        "Function Calling",
        "Werkzeugnutzung",
        "Werkzeug-Aufruf",
        "Tool-Aufruf"
      ],
      "en": [
        "function calling",
        "tool use",
        "tool call",
        "tool calling"
      ]
    },
    "short": {
      "de": "Das Modell gibt einen Werkzeug-Aufruf als Text aus, den das Programm drumherum ausführt und beantwortet.",
      "en": "The model outputs a tool call as text, which the surrounding program runs and answers."
    },
    "long": {
      "de": "Function Calling ist die Art, wie ein Modell Werkzeuge benutzt: Statt selbst zu rechnen oder nachzuschlagen, gibt es einen Werkzeug-Aufruf als Text aus – etwa „Datum nachschlagen“. Das Gerüst um das Modell fängt diesen Aufruf ab, führt das Werkzeug wirklich aus und schreibt das Ergebnis als neue Zeile in den Kontext. Dann sagt das Modell darüber weiter voraus.",
      "en": "Function calling is how a model uses tools: instead of computing or looking things up itself, it outputs a tool call as text – \"look up the date\", say. The scaffold around the model catches that call, actually runs the tool, and writes the result as a new line into the context. Then the model keeps predicting over it."
    }
  },
  "prompt": {
    "aliases": {
      "de": [
        "Prompt",
        "Prompts",
        "Anfrage an das Modell"
      ],
      "en": [
        "prompt",
        "prompts",
        "prompting"
      ]
    },
    "short": {
      "de": "Der Text, den ein Modell als Eingabe bekommt und über den es das nächste Token vorhersagt.",
      "en": "The text a model receives as input and over which it predicts the next token."
    },
    "long": {
      "de": "Ein Prompt ist die Eingabe an ein Sprachmodell – die Frage, der Auftrag oder schlicht ein Satzanfang. Das Modell hat keinen anderen Zugang zur Aufgabe als diesen Text; es sagt über den gesamten bisherigen Text das nächste Token voraus. Wie der Prompt formuliert ist, beeinflusst darum direkt, was herauskommt.",
      "en": "A prompt is the input to a language model – the question, the task, or simply the start of a sentence. The model has no access to the task other than this text; it predicts the next token over the whole text so far. How the prompt is phrased therefore directly shapes what comes out."
    }
  },
  "system-prompt": {
    "aliases": {
      "de": [
        "System-Prompt",
        "System-Anweisung",
        "vorangestellte Anweisung"
      ],
      "en": [
        "system prompt",
        "system message",
        "system instruction"
      ]
    },
    "short": {
      "de": "Eine vorangestellte Anweisung, die Rolle und Verhalten des Modells festlegt, bevor die eigentliche Frage kommt.",
      "en": "A preceding instruction that sets the model's role and behaviour before the actual question."
    },
    "long": {
      "de": "Der System-Prompt ist eine Anweisung, die dem Gespräch vorangestellt wird und Rolle, Ton und Grenzen des Modells festlegt – etwa „Du bist ein hilfreicher Assistent“. Der Nutzer sieht ihn meist nicht, doch das Modell behandelt ihn wie jeden anderen Text im Kontext und sagt darüber das nächste Token voraus. Er prägt das Verhalten über das ganze Gespräch.",
      "en": "The system prompt is an instruction placed before the conversation that sets the model's role, tone and limits – \"you are a helpful assistant\", for example. The user usually does not see it, yet the model treats it like any other text in the context and predicts the next token over it. It shapes the behaviour across the whole conversation."
    }
  },
  "perceptron": {
    "aliases": {
      "de": [
        "Perzeptron",
        "Perzeptrons",
        "Perzeptrone",
        "künstliches Neuron"
      ],
      "en": [
        "perceptron",
        "perceptrons"
      ]
    },
    "short": {
      "de": "Ein einzelnes künstliches Neuron, das seine Eingaben gewichtet, summiert und ab einer Schwelle „ja“ sagt.",
      "en": "A single artificial neuron that weights its inputs, sums them and says \"yes\" once a threshold is crossed."
    },
    "long": {
      "de": "Ein Perzeptron ist der kleinste Baustein neuronaler Netze: Es nimmt ein paar Zahlen, multipliziert jede mit einem Gewicht, zählt alles zusammen und gibt 1 aus, wenn die Summe eine Schwelle übersteigt, sonst 0. Geometrisch zieht es damit eine gerade Linie durch die Eingaben und sortiert sie in zwei Gruppen. Manche Muster wie XOR lassen sich mit einer einzigen Linie aber nie trennen – dafür braucht es mehrere Neuronen in Schichten.",
      "en": "A perceptron is the smallest building block of neural networks: it takes a few numbers, multiplies each by a weight, adds them up and outputs 1 if the sum exceeds a threshold, otherwise 0. Geometrically this draws a straight line through the inputs and sorts them into two groups. Some patterns like XOR can never be separated by a single line – that needs several neurons arranged in layers."
    }
  },
  "neuron": {
    "aliases": {
      "de": [
        "Neuron",
        "Neuronen",
        "künstliches Neuron",
        "künstliche Neuronen"
      ],
      "en": [
        "neuron",
        "neurons",
        "artificial neuron",
        "artificial neurons"
      ]
    },
    "short": {
      "de": "Eine kleine Recheneinheit, die Eingaben gewichtet, summiert und das Ergebnis durch eine Quetschfunktion schickt.",
      "en": "A small computing unit that weights its inputs, sums them and passes the result through a squashing function."
    },
    "long": {
      "de": "Ein künstliches Neuron bildet die gewichtete Summe seiner Eingaben und schickt sie durch eine Aktivierungsfunktion, die das Ergebnis in einen handlichen Bereich quetscht. Es hat nichts mit einer biologischen Nervenzelle gemein außer dem Bild; es ist reine Rechnung aus Multiplizieren und Addieren. Millionen solcher Neuronen, in Schichten gestapelt und gemeinsam trainiert, bilden ein neuronales Netz.",
      "en": "An artificial neuron forms the weighted sum of its inputs and passes it through an activation function that squashes the result into a manageable range. It shares nothing with a biological nerve cell except the metaphor; it is pure arithmetic of multiplying and adding. Millions of such neurons, stacked in layers and trained together, make up a neural network."
    }
  },
  "bias": {
    "aliases": {
      "de": [
        "Bias",
        "Schwellenwert",
        "Bias-Wert"
      ],
      "en": [
        "bias",
        "threshold",
        "bias term",
        "biases"
      ]
    },
    "short": {
      "de": "Ein verschiebbarer Schwellenwert, der festlegt, wie leicht ein Neuron „ja“ sagt.",
      "en": "An adjustable threshold that sets how easily a neuron says \"yes\"."
    },
    "long": {
      "de": "Der Bias (oder Schwellenwert) bestimmt, wie hoch die gewichtete Summe sein muss, damit ein Neuron feuert. Ein niedriger Schwellenwert lässt das Neuron leicht „ja“ sagen, ein hoher macht es zurückhaltend. Anders als die Gewichte, die einzelnen Eingaben mehr oder weniger Bedeutung geben, verschiebt der Bias die ganze Entscheidungsgrenze – er wird beim Lernen mit angepasst.",
      "en": "The bias (or threshold) sets how large the weighted sum has to be for a neuron to fire. A low threshold makes the neuron say \"yes\" easily, a high one makes it cautious. Unlike the weights, which give individual inputs more or less importance, the bias shifts the whole decision boundary – and it is adjusted during learning along with the weights."
    }
  },
  "mlp": {
    "aliases": {
      "de": [
        "MLP",
        "Mehrschichtiges Perzeptron",
        "mehrschichtige Perzeptronen",
        "MLPs"
      ],
      "en": [
        "MLP",
        "multilayer perceptron",
        "multi-layer perceptron",
        "MLPs"
      ]
    },
    "short": {
      "de": "Mehrere Neuronen in Schichten, die zusammen auch Muster trennen, an denen ein einzelnes Neuron scheitert.",
      "en": "Several neurons in layers that together separate patterns a single neuron cannot."
    },
    "long": {
      "de": "Ein MLP (mehrschichtiges Perzeptron) stapelt Neuronen in Schichten: eine oder mehrere versteckte Schichten zwischen Eingabe und Ausgabe. Jedes versteckte Neuron zieht eine eigene Linie, die nächste Schicht kombiniert sie zu gekrümmten Grenzen – so lässt sich auch XOR lösen, woran ein einzelnes Perzeptron scheitert. Genau dieser Stapel aus gewichteten Summen und Quetschfunktionen, per Backpropagation gelernt, ist im Kern jedes neuronale Netz, vom Spielzeugbeispiel bis zum Sprachmodell.",
      "en": "An MLP (multilayer perceptron) stacks neurons in layers: one or more hidden layers between input and output. Each hidden neuron draws its own line, and the next layer combines them into curved boundaries – which is how it solves XOR, where a single perceptron fails. This very stack of weighted sums and squashing functions, learned by backpropagation, is at heart what every neural network is, from toy examples to language models."
    }
  },
  "activation-function": {
    "aliases": {
      "de": [
        "Aktivierungsfunktion",
        "Aktivierungsfunktionen",
        "Quetschfunktion",
        "Quetschfunktionen"
      ],
      "en": [
        "activation function",
        "activation functions",
        "squashing function"
      ]
    },
    "short": {
      "de": "Die Funktion, die die gewichtete Summe eines Neurons in einen handlichen Bereich quetscht.",
      "en": "The function that squashes a neuron's weighted sum into a manageable range."
    },
    "long": {
      "de": "Eine Aktivierungsfunktion entscheidet, was ein Neuron nach der gewichteten Summe ausgibt. Statt einer harten Stufe (0 oder 1) nimmt man meist eine weiche Funktion wie tanh, Sigmoid oder ReLU, die sich glatt verbiegt – erst dadurch wird ein Netz lernfähig und kann auch krumme Grenzen ziehen. Ohne sie würde ein Stapel von Schichten zu einer einzigen geraden Linie zusammenfallen.",
      "en": "An activation function decides what a neuron outputs after the weighted sum. Instead of a hard step (0 or 1) one usually uses a smooth function like tanh, sigmoid or ReLU that bends gently – which is what makes a network trainable and able to draw curved boundaries. Without it, a stack of layers would collapse into a single straight line."
    }
  },
  "relu": {
    "aliases": {
      "de": [
        "ReLU",
        "Rectified Linear Unit"
      ],
      "en": [
        "ReLU",
        "rectified linear unit"
      ]
    },
    "short": {
      "de": "Eine einfache Aktivierungsfunktion: negative Werte werden zu null, positive bleiben unverändert.",
      "en": "A simple activation function: negative values become zero, positive values pass through unchanged."
    },
    "long": {
      "de": "ReLU ist eine besonders einfache Aktivierungsfunktion mit einem Knick bei null: Alles Negative wird zu 0, alles Positive bleibt, wie es ist. Dadurch entstehen stückweise gerade Grenzen statt runder, und das Lernen ist schnell und stabil. ReLU ist heute die übliche Wahl in großen Netzen, auch in Sprachmodellen.",
      "en": "ReLU is an especially simple activation function with a kink at zero: anything negative becomes 0, anything positive stays as it is. This produces piecewise-straight boundaries rather than round ones, and learning is fast and stable. ReLU is today's standard choice in large networks, including language models."
    }
  },
  "sigmoid": {
    "aliases": {
      "de": [
        "Sigmoid",
        "Sigmoidfunktion",
        "logistische Funktion"
      ],
      "en": [
        "sigmoid",
        "sigmoid function",
        "logistic function"
      ]
    },
    "short": {
      "de": "Eine S-förmige Aktivierungsfunktion, die jeden Wert weich auf einen Bereich zwischen 0 und 1 quetscht.",
      "en": "An S-shaped activation function that smoothly squashes any value into a range between 0 and 1."
    },
    "long": {
      "de": "Sigmoid ist eine S-förmige Funktion, die jede Zahl weich in den Bereich zwischen 0 und 1 quetscht – aus einer harten Ja/Nein-Schwelle wird so ein glatter Übergang. Das lässt sich als Wahrscheinlichkeit lesen, weshalb Sigmoid oft am Ausgang eines Netzes steht, das eine einzelne Ja/Nein-Entscheidung trifft. Die verwandte tanh-Funktion quetscht stattdessen in den Bereich zwischen −1 und 1.",
      "en": "Sigmoid is an S-shaped function that smoothly squashes any number into the range between 0 and 1 – turning a hard yes/no threshold into a gentle transition. The result can be read as a probability, which is why sigmoid often sits at the output of a network making a single yes/no decision. The related tanh function squashes into the range between −1 and 1 instead."
    }
  },
  "neural-network": {
    "aliases": {
      "de": [
        "Neuronales Netz",
        "Neuronale Netze",
        "neuronales Netzwerk",
        "neuronale Netzwerke"
      ],
      "en": [
        "neural network",
        "neural networks",
        "neural net",
        "neural nets"
      ]
    },
    "short": {
      "de": "Viele künstliche Neuronen in Schichten gestapelt, die gemeinsam aus Beispielen lernen.",
      "en": "Many artificial neurons stacked in layers that learn together from examples."
    },
    "long": {
      "de": "Ein neuronales Netz entsteht, wenn man viele künstliche Neuronen in Schichten stapelt: Die Ausgaben einer Schicht sind die Eingaben der nächsten. Mehr braucht es im Kern nicht – gewichtete Summen und Aktivierungsfunktionen, geschichtet und per Backpropagation gelernt. Vom kleinen XOR-Netz bis zum Sprachmodell ist es dieselbe Maschine, nur größer und mit viel mehr Gewichten.",
      "en": "A neural network arises when many artificial neurons are stacked in layers: the outputs of one layer are the inputs of the next. At heart it needs nothing more – weighted sums and activation functions, layered and learned by backpropagation. From a small XOR network to a language model it is the same machine, just larger and with far more weights."
    }
  },
  "gradient-descent": {
    "aliases": {
      "de": [
        "Gradientenabstieg",
        "Gradientenverfahren",
        "Abstieg im Fehlergebirge"
      ],
      "en": [
        "gradient descent",
        "steepest descent"
      ]
    },
    "short": {
      "de": "Das Verfahren, das die Gewichte Schritt für Schritt in die Richtung schiebt, die den Fehler verkleinert.",
      "en": "The method that shifts the weights step by step in the direction that lowers the error."
    },
    "long": {
      "de": "Beim Gradientenabstieg stellt man sich den Fehler als Höhe über den Gewichten vor – eine Landschaft mit Tälern. Die Steigung an der aktuellen Stelle (der Gradient) zeigt, wo es am steilsten bergauf geht; ein Schritt in die Gegenrichtung senkt den Fehler. Das wiederholt das Netz millionenfach, bis es in einem Tal landet. So lernen Perzeptron, MLP und Sprachmodell – nur in unterschiedlich vielen Dimensionen.",
      "en": "In gradient descent you picture the error as a height over the weights – a landscape with valleys. The slope at the current spot (the gradient) shows where it rises most steeply; a step in the opposite direction lowers the error. The network repeats this millions of times until it settles in a valley. This is how perceptron, MLP and language model all learn, just in different numbers of dimensions."
    }
  },
  "learning-rate": {
    "aliases": {
      "de": [
        "Lernrate",
        "Lernraten",
        "Schrittweite"
      ],
      "en": [
        "learning rate",
        "learning rates",
        "step size"
      ]
    },
    "short": {
      "de": "Die Schrittweite beim Lernen: wie weit die Gewichte bei jedem Schritt verschoben werden.",
      "en": "The step size during learning: how far the weights move with each step."
    },
    "long": {
      "de": "Die Lernrate ist die Schrittweite des Gradientenabstiegs. Ist sie zu klein, kriecht das Lernen quälend langsam; ist sie zu groß, überschießt jeder Schritt das Tal, und im schlimmsten Fall wächst der Fehler immer weiter. Die richtige Lernrate zu finden, ist eine der zentralen Stellschrauben beim Training eines Netzes.",
      "en": "The learning rate is the step size of gradient descent. If it is too small, learning crawls painfully slowly; if it is too large, every step overshoots the valley and in the worst case the error keeps growing. Finding the right learning rate is one of the central dials when training a network."
    }
  },
  "backpropagation": {
    "aliases": {
      "de": [
        "Backpropagation",
        "Rückpropagierung",
        "Fehlerrückführung",
        "Backprop"
      ],
      "en": [
        "backpropagation",
        "backprop",
        "back-propagation"
      ]
    },
    "short": {
      "de": "Das Verfahren, das den Fehler von der Ausgabe rückwärts durchs Netz reicht und jedem Gewicht seinen Anteil zuteilt.",
      "en": "The method that passes the error backward through the network, giving each weight its share."
    },
    "long": {
      "de": "Backpropagation rechnet aus, wie stark jedes einzelne Gewicht am Fehler schuld ist – die Steigung, die der Gradientenabstieg für seinen Schritt braucht. Dazu wird der Fehler von der Ausgabe Schicht für Schicht rückwärts durchgereicht und an jeder Kante mit dem lokalen Beitrag multipliziert. Im Kern ist es nur die Kettenregel der Mathematik, sauber organisiert – und damit der Motor, der jedes neuronale Netz vom kleinen MLP bis zum Sprachmodell trainiert.",
      "en": "Backpropagation works out how much each individual weight is to blame for the error – the slope that gradient descent needs for its step. To do this, the error is passed backward from the output layer by layer, multiplying at each edge by the local contribution. At heart it is just the chain rule of calculus, neatly organized – and thus the engine that trains every neural network, from a small MLP to a language model."
    }
  },
  "diffusion": {
    "aliases": {
      "de": [
        "Diffusionsmodell",
        "Diffusionsmodelle",
        "Diffusion",
        "Bildgenerator",
        "Bildgeneratoren"
      ],
      "en": [
        "diffusion model",
        "diffusion models",
        "diffusion",
        "image generator",
        "image generators"
      ]
    },
    "short": {
      "de": "Ein Bildgenerator, der mit reinem Rauschen startet und es Schritt für Schritt zu einem Bild entrauscht.",
      "en": "An image generator that starts from pure noise and denoises it step by step into an image."
    },
    "long": {
      "de": "Ein Diffusionsmodell dreht ein einfaches Rezept um: Vorwärts kippt man einer Form Schritt für Schritt Rauschen zu, bis nur noch Zufall übrig ist. Das Netz lernt, für jeden Schritt das zugefügte Rauschen vorherzusagen und abzuziehen. Generieren heißt dann: bei reinem Zufall anfangen und diesen Entrausch-Schritt viele Male wiederholen, bis ein Bild dasteht. Stable Diffusion und Midjourney arbeiten genau so – nur mit Millionen Pixeln statt Punkten in der Ebene.",
      "en": "A diffusion model reverses a simple recipe: forward, you add noise to a shape step by step until only randomness is left. The network learns to predict the added noise at each step and subtract it. Generating then means: start from pure randomness and repeat this denoising step many times until an image appears. Stable Diffusion and Midjourney work exactly this way – just with millions of pixels instead of points on a plane."
    }
  },
  "ddpm": {
    "aliases": {
      "de": [
        "DDPM",
        "Denoising Diffusion Probabilistic Model"
      ],
      "en": [
        "DDPM",
        "denoising diffusion probabilistic model"
      ]
    },
    "short": {
      "de": "Die klassische Bauart von Diffusionsmodellen: Rauschen vorhersagen, abziehen, wiederholen.",
      "en": "The classic recipe behind diffusion models: predict the noise, subtract it, repeat."
    },
    "long": {
      "de": "DDPM ist die klassische Bauart, nach der Diffusionsmodelle arbeiten. Sie zerlegt das Entrauschen in viele kleine Schritte: In jedem Schritt sagt das Netz das enthaltene Rauschen voraus, zieht es teilweise ab und nähert sich so von reinem Zufall einer gelernten Form. Der Name steht für „Denoising Diffusion Probabilistic Model“ und beschreibt das Grundrezept hinter Bildgeneratoren wie Stable Diffusion.",
      "en": "DDPM is the classic recipe behind diffusion models. It breaks denoising into many small steps: at each step the network predicts the contained noise, partially subtracts it, and so moves from pure randomness toward a learned shape. The name stands for \"denoising diffusion probabilistic model\" and describes the basic recipe behind image generators like Stable Diffusion."
    }
  },
  "noise": {
    "aliases": {
      "de": [
        "Rauschen",
        "Rauschens",
        "Gauss-Rauschen",
        "entrauschen"
      ],
      "en": [
        "noise",
        "Gaussian noise",
        "denoising",
        "denoise"
      ]
    },
    "short": {
      "de": "Zufällige Streuung ohne Muster – der reine Zufall, aus dem ein Diffusionsmodell ein Bild wachsen lässt.",
      "en": "Random scatter without pattern – the pure randomness a diffusion model grows an image from."
    },
    "long": {
      "de": "Rauschen ist zufällige Streuung ohne erkennbares Muster, oft als Gauss-Wolke um die Originalwerte. In einem Diffusionsmodell spielt es eine doppelte Rolle: Vorwärts wird eine Form Schritt für Schritt mit Rauschen überdeckt, bis nur noch Zufall übrig ist; rückwärts lernt das Netz, dieses Rauschen vorherzusagen und abzuziehen. Weil für jeden Zwischenschritt genau bekannt ist, wie viel Rauschen dazukam, wird das Verrauschen selbst zur Lernaufgabe.",
      "en": "Noise is random scatter without a recognizable pattern, often a Gaussian cloud around the original values. In a diffusion model it plays a double role: forward, a shape is covered with noise step by step until only randomness is left; backward, the network learns to predict that noise and subtract it. Because the exact amount of noise added at each step is known, the noising itself becomes the learning task."
    }
  },
  "llm": {
    "aliases": {
      "de": [
        "Sprachmodell",
        "Sprachmodelle",
        "LLM",
        "LLMs",
        "großes Sprachmodell",
        "große Sprachmodelle",
        "Large Language Model"
      ],
      "en": [
        "language model",
        "language models",
        "LLM",
        "LLMs",
        "large language model",
        "large language models"
      ]
    },
    "short": {
      "de": "Ein Programm, das gelernt hat, das nächste Wortstück vorherzusagen, und so Texte Stück für Stück fortsetzt.",
      "en": "A program that learned to predict the next piece of text and so continues writing piece by piece."
    },
    "long": {
      "de": "Ein Sprachmodell (oft LLM für „Large Language Model“) ist ein Programm, das aus sehr viel Text gelernt hat, welches Wortstück als Nächstes am wahrscheinlichsten kommt. Es schreibt einen Text, indem es immer wieder das nächste Stück anhängt – ohne den Inhalt zu „verstehen“ wie ein Mensch. So entstehen Antworten von Werkzeugen wie ChatGPT.",
      "en": "A language model (often called an LLM, for \"large language model\") is a program that has learned from huge amounts of text which next piece of text is most likely. It produces a response by repeatedly appending the next piece – without \"understanding\" the content the way a person does. This is how tools like ChatGPT generate their answers."
    }
  },
  "gpt": {
    "aliases": {
      "de": [
        "GPT",
        "GPTs",
        "Generative Pre-trained Transformer",
        "GPT-Modell",
        "GPT-Modelle"
      ],
      "en": [
        "GPT",
        "GPTs",
        "Generative Pre-trained Transformer",
        "GPT model",
        "GPT models"
      ]
    },
    "short": {
      "de": "Name einer bekannten Familie von Sprachmodellen von OpenAI; die Buchstaben stehen für „Generative Pre-trained Transformer“.",
      "en": "The name of a well-known family of language models from OpenAI; the letters stand for \"Generative Pre-trained Transformer\"."
    },
    "long": {
      "de": "GPT ist der Name einer bekannten Familie von Sprachmodellen der Firma OpenAI, die hinter ChatGPT stehen. Die Abkürzung bedeutet „Generative Pre-trained Transformer“: erzeugend, vortrainiert auf viel Text, und gebaut nach der Transformer-Bauweise. Inzwischen wird „GPT“ oft auch allgemein für solche Modelle benutzt.",
      "en": "GPT is the name of a well-known family of language models from the company OpenAI, the ones behind ChatGPT. The abbreviation stands for \"Generative Pre-trained Transformer\": it generates text, is pre-trained on lots of text, and is built using the transformer design. By now \"GPT\" is often used loosely for such models in general."
    }
  },
  "model": {
    "aliases": {
      "de": [
        "Modell",
        "Modelle",
        "KI-Modell",
        "KI-Modelle"
      ],
      "en": [
        "model",
        "models",
        "AI model",
        "AI models"
      ]
    },
    "short": {
      "de": "Das fertig trainierte Programm samt seiner gelernten Zahlenwerte, das aus einer Eingabe eine Vorhersage berechnet.",
      "en": "The finished, trained program together with its learned numbers, which turns an input into a prediction."
    },
    "long": {
      "de": "Ein Modell ist das fertige Ergebnis des Trainings: ein Programm zusammen mit den vielen Zahlenwerten (den Gewichten), die es beim Lernen angesammelt hat. Gibt man ihm eine Eingabe, rechnet es daraus eine Vorhersage – beim Sprachmodell etwa das nächste Wortstück. Das Training stellt diese Zahlen ein, im Betrieb bleiben sie unverändert.",
      "en": "A model is the finished result of training: a program together with the many numbers (its weights) it accumulated while learning. Given an input, it computes a prediction from them – for a language model, the next piece of text. Training sets these numbers; during use they stay fixed."
    }
  },
  "gpu": {
    "aliases": {
      "de": [
        "GPU",
        "GPUs",
        "Grafikkarte",
        "Grafikkarten",
        "Grafikprozessor",
        "Grafikprozessoren"
      ],
      "en": [
        "GPU",
        "GPUs",
        "graphics card",
        "graphics cards",
        "graphics processor",
        "graphics processing unit"
      ]
    },
    "short": {
      "de": "Ein Spezialchip, der viele gleichartige Rechnungen parallel erledigt – die übliche Hardware für Training und Betrieb von Modellen.",
      "en": "A specialized chip that does many similar calculations in parallel – the usual hardware for training and running models."
    },
    "long": {
      "de": "Eine GPU (Grafikprozessor) ist ein Chip, der ursprünglich für Bilder gebaut wurde und sehr viele gleichartige Rechnungen gleichzeitig erledigt. Genau solche Rechnungen braucht ein Sprachmodell, deshalb laufen Training und Betrieb meist auf GPUs. Wer ein Modell lokal nutzen will, stößt hier oft an die Grenze, weil leistungsfähige GPUs teuer sind.",
      "en": "A GPU (graphics processing unit) is a chip originally built for images that performs very many similar calculations at the same time. A language model needs exactly that kind of calculation, which is why training and running models usually happen on GPUs. People who want to run a model locally often hit a limit here, because powerful GPUs are expensive."
    }
  },
  "local-vs-cloud": {
    "aliases": {
      "de": [
        "lokal vs. Cloud",
        "lokal oder Cloud",
        "lokal und Cloud",
        "lokal vs Cloud"
      ],
      "en": [
        "local vs cloud",
        "local or cloud",
        "local and cloud",
        "on-device vs cloud"
      ]
    },
    "short": {
      "de": "Die Wahl, ob ein Modell auf dem eigenen Gerät läuft oder auf fremden Servern im Internet – mit Folgen für Datenschutz und Leistung.",
      "en": "The choice of whether a model runs on your own device or on someone else's servers online – affecting privacy and performance."
    },
    "long": {
      "de": "„Lokal vs. Cloud“ beschreibt, wo ein Modell rechnet. Lokal heißt auf dem eigenen Gerät: Die Eingaben verlassen den Computer nicht, dafür sind nur kleinere Modelle praktikabel. Cloud heißt auf fremden Servern im Internet: meist stärkere Modelle, aber die Eingaben werden an einen Anbieter geschickt. Welche Variante passt, hängt von Datenschutz, gewünschter Qualität und Aufwand ab.",
      "en": "\"Local vs. cloud\" describes where a model does its computing. Local means on your own device: the input never leaves the computer, but only smaller models are practical. Cloud means on someone else's servers online: usually stronger models, but the input is sent to a provider. Which option fits depends on privacy, the quality you need, and the effort involved."
    }
  },
  "open-weights": {
    "aliases": {
      "de": [
        "Open Weights",
        "offene Gewichte",
        "offenen Gewichten",
        "frei verfügbare Gewichte"
      ],
      "en": [
        "open weights",
        "open-weight",
        "open-weight models",
        "openly available weights"
      ]
    },
    "short": {
      "de": "Ein Modell, dessen gelernte Zahlenwerte frei heruntergeladen werden können, sodass man es selbst betreiben kann.",
      "en": "A model whose learned numbers can be freely downloaded, so anyone can run it themselves."
    },
    "long": {
      "de": "Open Weights bedeutet, dass die gelernten Zahlenwerte eines Modells – seine Gewichte – öffentlich zum Herunterladen bereitstehen. Damit kann man das Modell selbst betreiben, etwa lokal auf eigener Hardware, statt nur über die Server eines Anbieters. Offen sind dabei meist nur die Gewichte; die Trainingsdaten und der genaue Trainingsablauf bleiben oft trotzdem geheim.",
      "en": "Open weights means that a model's learned numbers – its weights – are publicly available for download. This lets anyone run the model themselves, for example locally on their own hardware, instead of only through a provider's servers. Usually only the weights are open; the training data and the exact training process often remain secret."
    }
  }
}

/** Zusammengeführte Begriffe – nur solche mit hinterlegtem Inhalt. */
export const glossaryTerms: GlossaryTerm[] = TERM_META.filter((m) => TERM_CONTENT[m.id]).map((m) => ({
  ...m,
  ...TERM_CONTENT[m.id],
}))

export const CATEGORY_ORDER: GlossaryCategory[] = ['data', 'training', 'inference', 'mlBasics', 'general']

// ── Auto-Linking-Matcher ────────────────────────────────────────────────────

export interface GlossaryMatcher {
  regex: RegExp
  /** kleingeschriebene Oberflächenform → Begriffs-id */
  lookup: Map<string, string>
}

const matcherCache: Partial<Record<Locale, GlossaryMatcher | null>> = {}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Oberflächenformen eines Begriffs fürs Matching: der Anzeigebegriff ohne
 * Klammerzusatz plus der Klammerinhalt plus die Aliasse. Beispiel:
 * „Attention (Aufmerksamkeit)" → ["Attention", "Aufmerksamkeit", …aliases].
 */
function matchSurfaces(term: GlossaryTerm, locale: Locale): string[] {
  const out: string[] = []
  const display = term.term[locale]
  const m = display.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (m) {
    out.push(m[1].trim(), m[2].trim())
  } else {
    out.push(display.trim())
  }
  out.push(...term.aliases[locale])
  return out
}

function buildMatcher(locale: Locale): GlossaryMatcher | null {
  const lookup = new Map<string, string>()
  const surfaces: string[] = []
  for (const term of glossaryTerms) {
    for (const surface of matchSurfaces(term, locale)) {
      const norm = surface.trim()
      if (norm.length < 2) continue // einzelne Buchstaben würden über-matchen
      const key = norm.toLowerCase()
      if (!lookup.has(key)) {
        lookup.set(key, term.id)
        surfaces.push(norm)
      }
    }
  }
  if (surfaces.length === 0) return null
  // Längste zuerst: „reward model" gewinnt vor „reward", „tokenization" vor „token".
  surfaces.sort((a, b) => b.length - a.length)
  try {
    const alternation = surfaces.map(escapeRegExp).join('|')
    // Unicode-Wortgrenzen via Lookarounds – \b versagt bei Umlauten (ä/ö/ü).
    const regex = new RegExp(`(?<![\\p{L}\\p{N}_])(${alternation})(?![\\p{L}\\p{N}_])`, 'giu')
    return { regex, lookup }
  } catch {
    // Uralter Browser ohne Lookbehind/\p{} → kein Auto-Linking (Text bleibt lesbar).
    return null
  }
}

/** Memoisierter Matcher je Sprache (Aufbau einmal pro Locale). */
export function getMatcher(locale: Locale): GlossaryMatcher | null {
  if (!(locale in matcherCache)) {
    matcherCache[locale] = buildMatcher(locale)
  }
  return matcherCache[locale] ?? null
}

const termById = new Map(glossaryTerms.map((t) => [t.id, t]))
export function getTerm(id: string): GlossaryTerm | undefined {
  return termById.get(id)
}
