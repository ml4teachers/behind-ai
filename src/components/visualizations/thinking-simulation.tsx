'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LightBulbIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CodeBracketIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/solid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from '@/components/ui/progress'

// Beispielaufgaben für die Thinking-Simulation
interface Problem {
  question: string
  category: 'math' | 'logic' | 'code' | 'text'
  difficulty: 'easy' | 'medium' | 'hard'
  steps: ThinkingStep[]
  finalAnswer: string
  directAnswer: string
}

interface ThinkingStep {
  thought: string
  isCorrect: boolean
  correction?: string
}

const problems: Problem[] = [
  {
    question: "Berechne das Ergebnis der folgenden Aufgabe: (17 × 6) + (23 × 4) - 15²",
    category: 'math',
    difficulty: 'medium',
    steps: [
      {
        thought: "Zuerst berechne ich die einzelnen Terme in der Klammer:\n(17 × 6) = 102\n(23 × 4) = 92",
        isCorrect: true
      },
      {
        thought: "Als nächstes berechne ich 15²:\n15² = 15 × 15 = 225",
        isCorrect: true
      },
      {
        thought: "Jetzt setze ich die Werte in die ursprüngliche Gleichung ein:\n(17 × 6) + (23 × 4) - 15² = 102 + 92 - 225 = 194 - 225 = -31",
        isCorrect: true
      }
    ],
    finalAnswer: "Das Ergebnis der Berechnung (17 × 6) + (23 × 4) - 15² ist -31.",
    directAnswer: "Das Ergebnis ist -31."
  },
  {
    question: "Ein Auto fährt mit einer konstanten Geschwindigkeit von 80 km/h. Wie weit fährt es in 2 Stunden und 45 Minuten?",
    category: 'math',
    difficulty: 'easy',
    steps: [
      {
        thought: "Ich muss die Zeit in Stunden umrechnen:\n2 Stunden und 45 Minuten = 2 + (45/60) Stunden = 2 + 0,75 Stunden = 2,75 Stunden",
        isCorrect: true
      },
      {
        thought: "Jetzt berechne ich die zurückgelegte Strecke mit der Formel: Strecke = Geschwindigkeit × Zeit\nStrecke = 80 km/h × 2,75 h = 220 km",
        isCorrect: true
      }
    ],
    finalAnswer: "Bei einer konstanten Geschwindigkeit von 80 km/h legt das Auto in 2 Stunden und 45 Minuten eine Strecke von 220 km zurück.",
    directAnswer: "Das Auto fährt 220 km weit."
  },
  {
    question: "In einem Raum befinden sich 20 Personen. Jede Person schüttelt jeder anderen Person einmal die Hand. Wie viele Händeschütteln finden insgesamt statt?",
    category: 'math',
    difficulty: 'medium',
    steps: [
      {
        thought: "Ich überlege, wie viele Händeschütteln pro Person stattfinden. Jede Person schüttelt allen anderen Personen die Hand, also 19 Händeschütteln pro Person.",
        isCorrect: false,
        correction: "Hier liegt ein Denkfehler vor. Wenn jede Person allen anderen die Hand schüttelt, hätten wir 20 × 19 = 380 Händeschütteln. Aber dabei würde jedes Händeschütteln doppelt gezählt (einmal für Person A und einmal für Person B)."
      },
      {
        thought: "Ich muss das Problem anders angehen. Es geht um Paare von Personen. Mit 20 Personen kann ich n(n-1)/2 verschiedene Paare bilden, wobei n die Anzahl der Personen ist.\nAlso: 20 × (20-1) / 2 = 20 × 19 / 2 = 380 / 2 = 190 Paare.",
        isCorrect: true
      },
      {
        thought: "Jedes Paar schüttelt sich genau einmal die Hand, daher finden insgesamt 190 Händeschütteln statt.",
        isCorrect: true
      }
    ],
    finalAnswer: "In einem Raum mit 20 Personen, wo jede Person jeder anderen einmal die Hand schüttelt, finden insgesamt 190 Händeschütteln statt.",
    directAnswer: "Es finden 190 Händeschütteln statt."
  },
  {
    question: "Schreibe eine JavaScript-Funktion, die prüft, ob ein String ein Palindrom ist (vorwärts und rückwärts gelesen gleich ist).",
    category: 'code',
    difficulty: 'medium',
    steps: [
      {
        thought: "Ein Palindrom ist ein Wort oder Satz, der vorwärts und rückwärts gelesen gleich ist. Zum Beispiel 'Anna' oder 'Ein Neger mit Gazelle zagt im Regen nie'.",
        isCorrect: false,
        correction: "Der zweite Beispielsatz ist kein tatsächliches Palindrom, da die Leerzeichen und Groß-/Kleinschreibung berücksichtigt werden müssten. Außerdem enthält dieser Beispielsatz ein problematisches Wort. Bessere Beispiele wären 'Anna' oder 'Reliefpfeiler'."
      },
      {
        thought: "Für die Funktion muss ich:\n1. Den String in Kleinbuchstaben umwandeln\n2. Alle Sonderzeichen und Leerzeichen entfernen\n3. Den bereinigten String umkehren\n4. Prüfen, ob der bereinigte String gleich dem umgekehrten String ist",
        isCorrect: true
      },
      {
        thought: "Hier ist eine mögliche JavaScript-Implementierung:\n```javascript\nfunction isPalindrome(str) {\n  // Bereinige den String: Kleinbuchstaben und nur Buchstaben/Zahlen behalten\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  \n  // Kehre den String um\n  const reversedStr = cleanStr.split('').reverse().join('');\n  \n  // Vergleiche die beiden Strings\n  return cleanStr === reversedStr;\n}\n```",
        isCorrect: true
      },
      {
        thought: "Lass mich die Funktion mit ein paar Beispielen testen:\n- isPalindrome('Anna') sollte true zurückgeben\n- isPalindrome('Hallo') sollte false zurückgeben\n- isPalindrome('Ein Esel lese nie') sollte true zurückgeben, da es zu 'einesellesen' wird",
        isCorrect: true
      }
    ],
    finalAnswer: "```javascript\nfunction isPalindrome(str) {\n  // Bereinige den String: Kleinbuchstaben und nur Buchstaben/Zahlen behalten\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  \n  // Kehre den String um\n  const reversedStr = cleanStr.split('').reverse().join('');\n  \n  // Vergleiche die beiden Strings\n  return cleanStr === reversedStr;\n}\n\n// Beispiele:\n// isPalindrome('Anna') => true\n// isPalindrome('Hallo') => false\n// isPalindrome('Ein Esel lese nie') => true\n```",
    directAnswer: "```javascript\nfunction isPalindrome(str) {\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  const reversedStr = cleanStr.split('').reverse().join('');\n  return cleanStr === reversedStr;\n}\n```"
  },
  {
    question: "Drei Freunde bestellen gemeinsam Pizza. Anna isst 1/3 der Pizza, Ben isst 1/4 und Charlie isst 1/5. Wie viel der Pizza bleibt übrig?",
    category: 'math',
    difficulty: 'hard',
    steps: [
      {
        thought: "Ich muss ausrechnen, wie viel die drei Freunde insgesamt gegessen haben, und das dann von 1 (der ganzen Pizza) abziehen.\n\nAnna: 1/3\nBen: 1/4\nCharlie: 1/5",
        isCorrect: true
      },
      {
        thought: "Um die Brüche zu addieren, brauche ich einen gemeinsamen Nenner. Der kleinste gemeinsame Nenner von 3, 4 und 5 ist 60.",
        isCorrect: false,
        correction: "Der kleinste gemeinsame Nenner von 3, 4 und 5 ist nicht 60, sondern 60. Lass mich das nochmal berechnen: kgV(3, 4, 5) = 60."
      },
      {
        thought: "Jetzt rechne ich die Brüche in Sechzigstel um:\nAnna: 1/3 = 20/60\nBen: 1/4 = 15/60\nCharlie: 1/5 = 12/60",
        isCorrect: true
      },
      {
        thought: "Jetzt addiere ich alle Anteile:\n20/60 + 15/60 + 12/60 = 47/60",
        isCorrect: true
      },
      {
        thought: "Vom Ganzen (1 oder 60/60) bleibt also übrig:\n60/60 - 47/60 = 13/60",
        isCorrect: true
      }
    ],
    finalAnswer: "Nachdem Anna 1/3, Ben 1/4 und Charlie 1/5 der Pizza gegessen haben, bleiben 13/60 (oder etwa 21,7%) der Pizza übrig.",
    directAnswer: "Es bleiben 13/60 der Pizza übrig."
  },
  {
    question: "Wenn alle Katzen Tiere sind und einige Tiere können schwimmen, können wir daraus schließen, dass einige Katzen schwimmen können?",
    category: 'logic',
    difficulty: 'medium',
    steps: [
      {
        thought: "Ich analysiere die beiden gegebenen Aussagen:\n1. Alle Katzen sind Tiere.\n2. Einige Tiere können schwimmen.",
        isCorrect: true
      },
      {
        thought: "Aus diesen beiden Aussagen können wir schließen, dass einige Katzen schwimmen können, da alle Katzen Tiere sind und einige Tiere schwimmen können.",
        isCorrect: false,
        correction: "Das ist ein logischer Fehlschluss. Nur weil alle Katzen Tiere sind und einige Tiere schwimmen können, folgt daraus nicht notwendigerweise, dass einige Katzen zu den schwimmenden Tieren gehören. Die schwimmenden Tiere könnten alle Nicht-Katzen sein."
      },
      {
        thought: "Lassen Sie mich das mit einem Venn-Diagramm visualisieren. Wir haben eine Menge 'Tiere', die alle 'Katzen' enthält. Innerhalb der Menge 'Tiere' gibt es eine Teilmenge 'Schwimmende Tiere'. Aber wir wissen nicht, ob die Teilmenge 'Schwimmende Tiere' und die Teilmenge 'Katzen' sich überschneiden.",
        isCorrect: true
      },
      {
        thought: "Mit anderen Worten: Es ist möglich, dass die Menge der schwimmenden Tiere und die Menge der Katzen völlig getrennt sind. Es ist aber auch möglich, dass sie sich überschneiden. Aus den gegebenen Prämissen können wir nicht mit Sicherheit folgern, dass einige Katzen schwimmen können.",
        isCorrect: true
      }
    ],
    finalAnswer: "Aus den gegebenen Aussagen 'Alle Katzen sind Tiere' und 'Einige Tiere können schwimmen' können wir NICHT logisch schließen, dass einige Katzen schwimmen können. Die schwimmenden Tiere könnten eine völlig andere Teilmenge der Tiere sein als die Katzen.",
    directAnswer: "Nein, wir können nicht daraus schließen, dass einige Katzen schwimmen können."
  },
  {
    question: "Fasse den folgenden Absatz in drei prägnanten Stichpunkten zusammen: 'Die industrielle Revolution, die im späten 18. Jahrhundert in Großbritannien begann, war ein Prozess des Wandels von einer landwirtschaftlich geprägten Wirtschaft zu einer, in der maschinelle Fertigung dominierte. Diese Transformation wurde durch technologische Innovationen wie die Dampfmaschine und mechanische Webstühle angetrieben und führte zu erheblichen sozialen Veränderungen, darunter Urbanisierung, veränderte Arbeitsbedingungen und neue soziale Klassen. Die Auswirkungen dieser Revolution erstreckten sich auf nahezu alle Aspekte des täglichen Lebens und legten den Grundstein für die moderne industrialisierte Welt.'",
    category: 'text',
    difficulty: 'easy',
    steps: [
      {
        thought: "Ich lese den Text zunächst vollständig und identifiziere die Hauptthemen:\n- Beginn und Definition der industriellen Revolution\n- Technologische Treiber und Innovationen\n- Soziale Auswirkungen und Veränderungen\n- Langfristige Bedeutung für die moderne Welt",
        isCorrect: true
      },
      {
        thought: "Da ich drei prägnante Stichpunkte erstellen soll, muss ich die wichtigsten Aspekte auswählen und zusammenfassen. Ich versuche, die Kernaussagen zu destillieren:",
        isCorrect: true
      },
      {
        thought: "Für den ersten Stichpunkt könnte ich den Beginn, Ort und die grundlegende Definition zusammenfassen.",
        isCorrect: true
      },
      {
        thought: "Für den zweiten Stichpunkt scheinen die technologischen Innovationen als Treiber wichtig zu sein.",
        isCorrect: true
      },
      {
        thought: "Für den dritten Stichpunkt könnte ich die sozialen Veränderungen und die langfristigen Auswirkungen kombinieren.",
        isCorrect: true
      },
      {
        thought: "Basierend auf diesen Überlegungen formuliere ich folgende drei Stichpunkte:\n\n1. Übergang von agrarischer zu maschineller Produktion im späten 18. Jahrhundert in Großbritannien\n2. Angetrieben durch technologische Innovationen wie Dampfmaschine und mechanische Webstühle\n3. Führte zu tiefgreifenden gesellschaftlichen Veränderungen und legte den Grundstein für die moderne industrialisierte Welt",
        isCorrect: true
      }
    ],
    finalAnswer: "• Übergang von agrarischer zu maschineller Produktion im späten 18. Jahrhundert in Großbritannien\n• Angetrieben durch technologische Innovationen wie Dampfmaschine und mechanische Webstühle\n• Führte zu tiefgreifenden gesellschaftlichen Veränderungen und legte den Grundstein für die moderne industrialisierte Welt",
    directAnswer: "• Übergang von Agrar- zu Industriewirtschaft in Großbritannien (spätes 18. Jh.)\n• Technologische Innovationen als Treiber (Dampfmaschine, Webstühle)\n• Soziale Umwälzungen und Grundlage der modernen industrialisierten Welt"
  },
  {
    question: "Du hast drei Kisten: eine mit Äpfeln, eine mit Orangen und eine mit beiden Früchten gemischt. Alle Kisten sind falsch beschriftet. Du darfst eine Frucht aus einer Kiste ziehen. Wie kannst du mit nur einer Entnahme alle Kisten korrekt beschriften?",
    category: 'logic',
    difficulty: 'hard',
    steps: [
      {
        thought: "Ich habe drei Kisten, die alle falsch beschriftet sind:\n- Eine Kiste enthält nur Äpfel\n- Eine Kiste enthält nur Orangen\n- Eine Kiste enthält Äpfel und Orangen gemischt",
        isCorrect: true
      },
      {
        thought: "Da alle Kisten falsch beschriftet sind, kann ich daraus schließen:\n- Die Kiste mit der Aufschrift 'Äpfel' enthält entweder nur Orangen oder gemischte Früchte\n- Die Kiste mit der Aufschrift 'Orangen' enthält entweder nur Äpfel oder gemischte Früchte\n- Die Kiste mit der Aufschrift 'Gemischt' enthält entweder nur Äpfel oder nur Orangen",
        isCorrect: true
      },
      {
        thought: "Da ich nur eine Frucht ziehen darf, sollte ich eine Kiste wählen, bei der ich mit Sicherheit auf den Inhalt schließen kann. Die 'Gemischt'-Kiste ist ein guter Kandidat, da sie definitiv nicht gemischt ist (wegen der falschen Beschriftung).",
        isCorrect: true
      },
      {
        thought: "Angenommen, ich ziehe eine Frucht aus der 'Gemischt'-Kiste und es ist ein Apfel. Dann weiß ich, dass diese Kiste nur Äpfel enthält (da sie nicht gemischt sein kann).",
        isCorrect: true
      },
      {
        thought: "Da die 'Gemischt'-Kiste tatsächlich nur Äpfel enthält und die 'Äpfel'-Kiste falsch beschriftet ist, muss die 'Äpfel'-Kiste entweder nur Orangen oder gemischte Früchte enthalten. Da aber die 'Orangen'-Kiste auch falsch beschriftet ist, kann die 'Äpfel'-Kiste keine Orangen enthalten (sonst wäre eine Kiste korrekt beschriftet). Also muss die 'Äpfel'-Kiste gemischte Früchte enthalten.",
        isCorrect: true
      },
      {
        thought: "Durch Ausschluss bleibt dann nur noch die Möglichkeit, dass die 'Orangen'-Kiste nur Orangen enthält. Aber das wäre eine korrekte Beschriftung, was unmöglich ist. Hier habe ich einen Denkfehler gemacht.",
        isCorrect: false,
        correction: "Das ist ein Fehler. Wenn die 'Gemischt'-Kiste nur Äpfel enthält und die 'Äpfel'-Kiste gemischte Früchte enthält, dann muss die 'Orangen'-Kiste nur Orangen enthalten. Das würde bedeuten, dass die 'Orangen'-Kiste korrekt beschriftet wäre, was im Widerspruch zur Aufgabenstellung steht."
      },
      {
        thought: "Ich muss meine Überlegung korrigieren. Wenn die 'Gemischt'-Kiste nur Äpfel enthält, dann kann die 'Äpfel'-Kiste keine gemischten Früchte enthalten (sonst wäre keine Kiste für nur Orangen übrig). Also muss die 'Äpfel'-Kiste nur Orangen enthalten und die 'Orangen'-Kiste muss gemischte Früchte enthalten.",
        isCorrect: true
      },
      {
        thought: "Alternativ, wenn ich eine Orange aus der 'Gemischt'-Kiste ziehe, würde ich ähnlich schließen: Die 'Gemischt'-Kiste enthält nur Orangen, die 'Orangen'-Kiste enthält nur Äpfel, und die 'Äpfel'-Kiste enthält gemischte Früchte.",
        isCorrect: true
      }
    ],
    finalAnswer: "Ich würde eine Frucht aus der Kiste ziehen, die als 'Gemischt' beschriftet ist. Wenn ich einen Apfel ziehe, dann enthält diese Kiste nur Äpfel. Daraus folgt, dass die als 'Äpfel' beschriftete Kiste Orangen enthält und die als 'Orangen' beschriftete Kiste die gemischten Früchte enthält.\n\nWenn ich eine Orange ziehe, dann enthält die 'Gemischt'-Kiste nur Orangen. Daraus folgt, dass die als 'Orangen' beschriftete Kiste Äpfel enthält und die als 'Äpfel' beschriftete Kiste die gemischten Früchte enthält.",
    directAnswer: "Ziehe eine Frucht aus der mit 'Gemischt' beschrifteten Kiste. Sie bestimmt, ob diese Kiste nur Äpfel oder nur Orangen enthält. Durch logischen Ausschluss kannst du dann die anderen beiden Kisten korrekt beschriften."
  },
  {
    question: "Erstelle eine Python-Funktion zum Sortieren einer Liste von Zahlen mit dem Quicksort-Algorithmus.",
    category: 'code',
    difficulty: 'hard',
    steps: [
      {
        thought: "Der Quicksort-Algorithmus ist ein effizienter Sortieralgorithmus, der nach dem Divide-and-Conquer-Prinzip arbeitet. Hier sind die grundlegenden Schritte:\n\n1. Wähle ein Element als Pivot (oft das erste, letzte oder mittlere Element)\n2. Partitioniere die Liste so, dass alle Elemente kleiner als das Pivot links und alle größeren rechts stehen\n3. Wende den Algorithmus rekursiv auf die Teillisten links und rechts vom Pivot an",
        isCorrect: true
      },
      {
        thought: "Ich werde eine Python-Implementierung schreiben. Zuerst entwerfe ich die Funktion für die Partitionierung:",
        isCorrect: true
      },
      {
        thought: "```python\ndef partition(arr, low, high):\n    pivot = arr[high]  # Wähle das letzte Element als Pivot\n    i = low - 1  # Index für das kleinere Element\n    \n    for j in range(low, high):\n        # Wenn aktuelles Element kleiner oder gleich Pivot ist\n        if arr[j] <= pivot:\n            i += 1  # Erhöhe Index des kleineren Elements\n            arr[i], arr[j] = arr[j], arr[i]  # Tausche Elemente\n    \n    arr[i + 1], arr[high] = arr[high], arr[i + 1]  # Platziere Pivot an seiner korrekten Position\n    return i + 1  # Gib die Position des Pivots zurück\n```",
        isCorrect: true
      },
      {
        thought: "Jetzt implementiere ich die Hauptfunktion für Quicksort, die rekursiv auf die Teillisten angewendet wird:",
        isCorrect: true
      },
      {
        thought: "```python\ndef quicksort(arr, low, high):\n    if low < high:\n        # pi ist der Partitionsindex\n        pi = partition(arr, low, high)\n        \n        # Sortiere die Elemente getrennt vor und nach dem Partitionsindex\n        quicksort(arr, low, pi - 1)\n        quicksort(arr, pi + 1, high)\n```",
        isCorrect: true
      },
      {
        thought: "Jetzt binde ich eine benutzerfreundliche Wrapper-Funktion ein:",
        isCorrect: true
      },
      {
        thought: "```python\ndef sort_list(arr):\n    if not arr:\n        return arr  # Gib leere Liste zurück, wenn die Eingabe leer ist\n    quicksort(arr, 0, len(arr) - 1)\n    return arr\n```",
        isCorrect: false,
        correction: "Die Funktion `sort_list` modifiziert die Eingabeliste direkt, sollte aber eine neue sortierte Liste zurückgeben, ohne die Originalliste zu verändern. Eine bessere Implementierung wäre:\n```python\ndef sort_list(arr):\n    if not arr:\n        return []  # Gib leere Liste zurück, wenn die Eingabe leer ist\n    arr_copy = arr.copy()  # Erstelle eine Kopie der Eingabeliste\n    quicksort(arr_copy, 0, len(arr_copy) - 1)\n    return arr_copy\n```"
      },
      {
        thought: "Alternativ könnte ich auch den Quicksort-Algorithmus implementieren, ohne die Originalliste zu verändern, indem ich neue Listen erstelle. Das wäre weniger effizient im Speicherverbrauch, aber konzeptionell einfacher und folgt dem funktionalen Programmierparadigma:",
        isCorrect: true
      },
      {
        thought: "```python\ndef quicksort_functional(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    pivot = arr[len(arr) // 2]  # Wähle das mittlere Element als Pivot\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    return quicksort_functional(left) + middle + quicksort_functional(right)\n```",
        isCorrect: true
      }
    ],
    finalAnswer: "```python\n# Implementierung mit In-Place-Sortierung\ndef partition(arr, low, high):\n    pivot = arr[high]\n    i = low - 1\n    \n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    \n    arr[i + 1], arr[high] = arr[high], arr[i + 1]\n    return i + 1\n\ndef quicksort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quicksort(arr, low, pi - 1)\n        quicksort(arr, pi + 1, high)\n\ndef sort_list(arr):\n    if not arr:\n        return []\n    arr_copy = arr.copy()  # Erstelle eine Kopie, um die Originalliste nicht zu verändern\n    quicksort(arr_copy, 0, len(arr_copy) - 1)\n    return arr_copy\n\n# Alternativ: Funktionale Implementierung (einfacher, aber speicherintensiver)\ndef quicksort_functional(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    return quicksort_functional(left) + middle + quicksort_functional(right)\n\n# Beispiel:\n# numbers = [3, 6, 8, 10, 1, 2, 1]\n# sorted_numbers = sort_list(numbers)  # oder quicksort_functional(numbers)\n# print(sorted_numbers)  # [1, 1, 2, 3, 6, 8, 10]\n```",
    directAnswer: "```python\ndef quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n```"
  }
];

// Hauptkomponente
export const ThinkingSimulation = () => {
  const [phase, setPhase] = useState<'intro' | 'problem' | 'thinking' | 'comparison'>('intro');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(Math.floor(Math.random() * problems.length));
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Problem['category']>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | Problem['difficulty']>('all');
  
  // Fortschritt bei Thinking simulieren
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (phase === 'thinking' && currentStepIndex < problems[currentProblemIndex].steps.length) {
      interval = setInterval(() => {
        setThinkingProgress(prev => {
          const next = prev + 2;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (currentStepIndex < problems[currentProblemIndex].steps.length - 1) {
                setCurrentStepIndex(currentStepIndex + 1);
                setThinkingProgress(0);
              } else {
                setShowFinalAnswer(true);
              }
            }, 500);
            return 100;
          }
          return next;
        });
      }, 50);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, currentStepIndex, currentProblemIndex]);
  
  const handleStartDemo = () => {
    setPhase('problem');
  };
  
  const handleSolveProblem = () => {
    setPhase('thinking');
    setCurrentStepIndex(0);
    setThinkingProgress(0);
    setShowFinalAnswer(false);
  };
  
  const handleCompare = () => {
    setPhase('comparison');
  };
  
  const handleNextProblem = () => {
    // Filtere Probleme basierend auf Kategorie und Schwierigkeit
    const filteredProblems = problems.filter(p => {
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
    
    // Wähle ein zufälliges Problem aus den gefilterten, das nicht das aktuelle ist
    const availableIndices = filteredProblems.map((_, idx) => 
      problems.findIndex(p => p === filteredProblems[idx])
    ).filter(idx => idx !== currentProblemIndex);
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentProblemIndex(randomIndex);
    } else if (filteredProblems.length > 0) {
      // Falls nur ein Problem in der Kategorie ist, verwende es trotzdem
      setCurrentProblemIndex(problems.findIndex(p => p === filteredProblems[0]));
    }
    
    setPhase('problem');
    setCurrentStepIndex(0);
    setThinkingProgress(0);
    setShowFinalAnswer(false);
  };
  
  const handleCategoryChange = (category: 'all' | Problem['category']) => {
    setSelectedCategory(category);
    // Bei Kategoriewechsel auch ein passendes Problem wählen
    if (category !== 'all') {
      const matchingProblems = problems.filter(p => {
        return p.category === category && 
              (selectedDifficulty === 'all' || p.difficulty === selectedDifficulty);
      });
      
      if (matchingProblems.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingProblems.length);
        setCurrentProblemIndex(problems.findIndex(p => p === matchingProblems[randomIndex]));
      }
    }
  };
  
  const handleDifficultyChange = (difficulty: 'all' | Problem['difficulty']) => {
    setSelectedDifficulty(difficulty);
    // Bei Schwierigkeitswechsel auch ein passendes Problem wählen
    if (difficulty !== 'all') {
      const matchingProblems = problems.filter(p => {
        return p.difficulty === difficulty && 
              (selectedCategory === 'all' || p.category === selectedCategory);
      });
      
      if (matchingProblems.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingProblems.length);
        setCurrentProblemIndex(problems.findIndex(p => p === matchingProblems[randomIndex]));
      }
    }
  };
  
  const getCategoryIcon = (category: Problem['category']) => {
    switch (category) {
      case 'math':
        return <LightBulbIcon className="h-5 w-5 text-amber-500" />;
      case 'logic':
        return <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-500" />;
      case 'code':
        return <CodeBracketIcon className="h-5 w-5 text-green-500" />;
      case 'text':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getCategoryTranslation = (category: Problem['category']) => {
    switch (category) {
      case 'math':
        return 'Mathematik';
      case 'logic':
        return 'Logik';
      case 'code':
        return 'Programmierung';
      case 'text':
        return 'Textanalyse';
    }
  };
  
  const getDifficultyTranslation = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'Leicht';
      case 'medium':
        return 'Mittel';
      case 'hard':
        return 'Schwierig';
    }
  };
  
  const getDifficultyColor = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-amber-600';
      case 'hard':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: Einführung */}
      {phase === 'intro' && (
        <div className="space-y-4">
          <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
            <h3 className="font-medium text-violet-800 mb-2">Chain-of-Thought verstehen</h3>
            <p className="text-sm text-violet-700">
              In dieser Simulation kannst du beobachten, wie ein KI-Modell verschiedene Aufgaben mit Hilfe
              von Chain-of-Thought (Gedankenkette) löst:
            </p>
            <ul className="text-sm text-violet-700 list-disc pl-5 space-y-1 mt-2">
              <li><strong>Mathematische Probleme</strong> - Schritt-für-Schritt-Lösungen mit Zwischenrechnungen</li>
              <li><strong>Logische Rätsel</strong> - Kombinieren von Informationen und logisches Schlussfolgern</li>
              <li><strong>Programmieraufgaben</strong> - Strukturiertes Vorgehen bei der Algorithmenentwicklung</li>
              <li><strong>Textanalyse</strong> - Systematisches Erfassen und Zusammenfassen von Informationen</li>
            </ul>
            <p className="text-sm text-violet-700 mt-2">
              Du wirst sehen, wie das Modell sich selbst korrigiert, verschiedene Ansätze prüft und
              seine "Gedanken" strukturiert, um komplexe Probleme zu lösen.
            </p>
          </div>
          
          <Button 
            onClick={handleStartDemo} 
            className="w-full"
          >
            Chain-of-Thought Demo starten
          </Button>
        </div>
      )}
      
      {/* Phase 2: Aufgabe auswählen */}
      {phase === 'problem' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-medium text-lg">Aufgabe auswählen</h3>
            
            <div className="flex gap-2">
              <Tabs value={selectedCategory} onValueChange={(value) => handleCategoryChange(value as any)}>
                <TabsList className="grid grid-cols-5 h-8">
                  <TabsTrigger value="all" className="text-xs py-0">Alle</TabsTrigger>
                  <TabsTrigger value="math" className="text-xs py-0">Mathe</TabsTrigger>
                  <TabsTrigger value="logic" className="text-xs py-0">Logik</TabsTrigger>
                  <TabsTrigger value="code" className="text-xs py-0">Code</TabsTrigger>
                  <TabsTrigger value="text" className="text-xs py-0">Text</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs value={selectedDifficulty} onValueChange={(value) => handleDifficultyChange(value as any)}>
                <TabsList className="grid grid-cols-4 h-8">
                  <TabsTrigger value="all" className="text-xs py-0">Alle</TabsTrigger>
                  <TabsTrigger value="easy" className="text-xs py-0">Leicht</TabsTrigger>
                  <TabsTrigger value="medium" className="text-xs py-0">Mittel</TabsTrigger>
                  <TabsTrigger value="hard" className="text-xs py-0">Schwer</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(problems[currentProblemIndex].category)}
                  <span className="font-medium">{getCategoryTranslation(problems[currentProblemIndex].category)}</span>
                </div>
                <span className={`text-sm font-medium ${getDifficultyColor(problems[currentProblemIndex].difficulty)}`}>
                  {getDifficultyTranslation(problems[currentProblemIndex].difficulty)}
                </span>
              </div>
              
              <p className="font-medium mb-2">Aufgabe:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4 text-gray-800 whitespace-pre-line">
                {problems[currentProblemIndex].question}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <div className="flex items-center text-blue-800 mb-1">
                  <LightBulbIcon className="h-4 w-4 mr-1.5" />
                  <p className="text-sm font-medium">Diese Aufgabe erfordert mehrere Denkschritte</p>
                </div>
                <p className="text-sm text-blue-700">
                  Bei komplexen Aufgaben wie dieser ist es wichtig, den Lösungsweg in logische Teilschritte zu zerlegen 
                  und strukturiert vorzugehen. Dies hilft dabei, Fehler zu vermeiden und die Lösung nachvollziehbar zu machen.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button onClick={handleNextProblem} variant="outline">
                  Andere Aufgabe
                </Button>
                <Button onClick={handleSolveProblem}>
                  Aufgabe lösen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 3: Thinking-Prozess */}
      {phase === 'thinking' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Thinking-Prozess der KI</h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p className="font-medium">Aufgabe:</p>
                <div className="p-3 bg-gray-50 rounded-md mb-1 text-sm">
                  {problems[currentProblemIndex].question}
                </div>
                
                <div className="border rounded-md p-3 bg-violet-50">
                  <div className="flex items-center gap-2 mb-2">
                    <EllipsisHorizontalIcon className="h-5 w-5 text-violet-600 animate-pulse" />
                    <p className="font-medium text-violet-800">Denkprozess</p>
                  </div>
                  
                  <div className="space-y-4">
                    {problems[currentProblemIndex].steps.slice(0, currentStepIndex).map((step, idx) => (
                      <div key={idx} className="p-2 rounded-md bg-white border">
                        <div className="whitespace-pre-line text-sm">{step.thought}</div>
                        {step.correction && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-100 text-sm text-red-700 flex gap-2">
                            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Korrektur:</p>
                              <p>{step.correction}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {currentStepIndex < problems[currentProblemIndex].steps.length && (
                      <div className="relative">
                        <div className="animate-pulse p-2 rounded-md bg-white border opacity-90">
                          <div className="whitespace-pre-line text-sm opacity-70">{problems[currentProblemIndex].steps[currentStepIndex].thought.split('\n')[0]}...</div>
                        </div>
                        <Progress value={thinkingProgress} className="absolute bottom-0 left-0 right-0" />
                      </div>
                    )}
                    
                    {showFinalAnswer && (
                      <div className="p-2 rounded-md bg-green-50 border border-green-200">
                        <div className="flex items-center mb-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                          <p className="font-medium text-green-800">Endgültige Antwort:</p>
                        </div>
                        <div className="whitespace-pre-line text-sm text-green-700">{problems[currentProblemIndex].finalAnswer}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {showFinalAnswer && (
                  <div className="flex justify-end">
                    <Button onClick={handleCompare}>
                      Vergleichen Sie mit direkter Antwort
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 4: Vergleich */}
      {phase === 'comparison' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Vergleich: Mit vs. ohne Chain-of-Thought</h3>
          
          <Card>
            <CardContent className="pt-4">
              <p className="font-medium mb-3">Aufgabe:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4">
                {problems[currentProblemIndex].question}
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-amber-700">1</span>
                    </div>
                    <p className="font-medium">Direkte Antwort (ohne Chain-of-Thought):</p>
                  </div>
                  <div className="p-3 bg-white rounded-md border border-gray-200 whitespace-pre-line">
                    {problems[currentProblemIndex].directAnswer}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-green-700">2</span>
                    </div>
                    <p className="font-medium">Antwort mit Chain-of-Thought:</p>
                  </div>
                  <div className="p-3 bg-violet-50 rounded-md border border-violet-200 whitespace-pre-line">
                    {problems[currentProblemIndex].finalAnswer}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
                <p className="font-medium text-blue-800 mb-2">Vorteile des Chain-of-Thought Ansatzes:</p>
                <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                  <li>
                    <span className="font-medium">Transparenz</span>: Der vollständige Denkprozess ist nachvollziehbar
                  </li>
                  <li>
                    <span className="font-medium">Fehlerkorrektur</span>: Das Modell kann seine eigenen Gedanken überprüfen und korrigieren
                  </li>
                  <li>
                    <span className="font-medium">Komplexität</span>: Ermöglicht die Lösung von komplexeren Problemen durch Zerlegung
                  </li>
                  <li>
                    <span className="font-medium">Lehrwert</span>: Der Lösungsweg selbst kann wertvoll sein, nicht nur das Endergebnis
                  </li>
                  <li>
                    <span className="font-medium">Begründung</span>: Die Antwort ist nicht nur ein Ergebnis, sondern beinhaltet auch die Begründung
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setPhase('thinking')}>
                  Zurück
                </Button>
                <Button onClick={handleNextProblem}>
                  Nächste Aufgabe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};