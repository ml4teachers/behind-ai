'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'

// Typ für ein Trainingsdaten-Beispiel
type TrainingExample = {
  id: number
  input: string
  target: string
  options: {text: string, probability: number, isCorrect: boolean}[]
}

// CSV-Daten verarbeiten
const parseCSVData = (csvData: string[]): TrainingExample[] => {
  // Globalen Token-Pool aus allen CSV-Zeilen erstellen
  const globalTokens = csvData
    .map(text => text.split(' '))
    .flat();
  const uniqueGlobalTokens = Array.from(new Set(globalTokens));

  // CSV-Daten zufällig mischen
  const shuffledData = [...csvData].sort(() => Math.random() - 0.5);
  const examples: TrainingExample[] = [];

  shuffledData.forEach((text, index) => {
    if (!text || text.length < 30) return;

    // Sätze extrahieren und mischen
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 15);
    if (sentences.length === 0) return;
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];

    // Satz in Wörter aufteilen – ohne kurze Wörter herauszufiltern
    const words = randomSentence.split(' ');
    if (words.length < 6) return;

    const minInputWords = 5;
    const maxInputWords = Math.min(words.length - 1, 30);
    const inputLength = Math.floor(Math.random() * (maxInputWords - minInputWords + 1)) + minInputWords;
    const inputWords = words.slice(0, inputLength);
    const targetWord = words[inputLength];
    const input = inputWords.join(' ');

    // Optionen generieren: Richtiges Token
    const options = [
      { text: targetWord, probability: 0.15 + Math.random() * 0.1, isCorrect: true }
    ];

    // Falsche Tokens aus globalen Tokens ziehen – Tokens aus dem aktuellen Satz ausschließen
    const wrongTokensPool = uniqueGlobalTokens.filter(token => !words.includes(token));
    const shuffledWrongTokens = [...wrongTokensPool].sort(() => Math.random() - 0.5);
    const selectedWrongTokens = shuffledWrongTokens.slice(0, 4);
    selectedWrongTokens.forEach(word => {
      options.push({
        text: word,
        probability: 0.05 + Math.random() * 0.15,
        isCorrect: false
      });
    });

    options.sort((a, b) => b.probability - a.probability);

    examples.push({
      id: index,
      input,
      target: targetWord,
      options
    });
  });

  return examples.slice(0, 10);
}

// CSV-Texte (aus data.csv)
const csvTexts = [
  "Die Braut trug ein funkelndes Kleid und der Bräutigam lächelte vor Glück.",
  "Der Abgeordnete kritisierte lautstark die neuen Gesetzesvorschläge im Parlament.",
  "Auf dem Filmfestival präsentierte der Regisseur seinen preisgekrönten Kurzfilm.",
  "Die Band spielte rockige Klänge und begeisterte das Publikum mit ihrer Energie.",
  "Der Stürmer erzielte ein spektakuläres Tor in der Nachspielzeit des Spiels.",
  "Die neuen Webseite-Richtlinien fordern klare Datenschutz- und Nutzungsbedingungen.",
  "Der sprechende Kaktus tanzt durch die Wolken, während Pizza regnet.",
  "Das Brautpaar lachte und tanzte im strahlenden Sonnenlicht.",
  "Die internationale Konferenz diskutierte friedliche Lösungen für globale Konflikte.",
	"Glaube und Zweifel prägten die hitzige Debatte in der Gemeinde.",
	"Jeder Film auf dem Festival erzählte eine einzigartige, emotionale Geschichte.",
	"Der Pianist verzauberte das Publikum mit sanften, melancholischen Klängen.",
	"Die Mannschaft feierte ihren überraschenden Sieg mit Jubel und Konfetti.",
	"Neue Richtlinien verbessern die Barrierefreiheit und Benutzerfreundlichkeit der Webseite.",
	"Die tanzenden Wolken flüstern Geheimnisse in den Ohren der Bäume.",
	"Blumen, Lichter und Liebe schmückten den festlich geschmückten Hochzeitssaal.",
	"Der Präsident versprach, mehr Transparenz und Gerechtigkeit in seinem Amt zu gewährleisten.",
	"Die spirituelle Reise lehrt, den inneren Frieden im Chaos zu finden.",
	"Kurze, innovative Filme überraschten die Jury des internationalen Festivals."
];

// Verbesserte Wahrscheinlichkeitsverteilungen für Trainingsfortschritt
const improveDistributions = (examples: TrainingExample[], step: number): TrainingExample[] => {
  return examples.map(example => {
    // Tiefe Kopie des Beispiels erstellen
    const newExample = JSON.parse(JSON.stringify(example)) as TrainingExample
    
    // Für jeden Schritt die Wahrscheinlichkeiten anpassen
    if (step >= 2) {
      // Bei Schritt 2 erhöhen wir die Wahrscheinlichkeit des korrekten Tokens
      for (let i = 0; i < newExample.options.length; i++) {
        if (newExample.options[i].isCorrect) {
          // Korrekter Token bekommt höhere Wahrscheinlichkeit
          newExample.options[i].probability = Math.min(0.45, newExample.options[i].probability + 0.2)
        } else {
          // Andere Tokens bekommen niedrigere Wahrscheinlichkeiten
          newExample.options[i].probability = Math.max(0.05, newExample.options[i].probability - 0.05)
        }
      }
    }
    
    if (step >= 3) {
      // Bei Schritt 3 verbessern wir weiter
      for (let i = 0; i < newExample.options.length; i++) {
        if (newExample.options[i].isCorrect) {
          // Korrekter Token bekommt noch höhere Wahrscheinlichkeit
          newExample.options[i].probability = Math.min(0.75, newExample.options[i].probability + 0.3)
        } else {
          // Andere Tokens bekommen noch niedrigere Wahrscheinlichkeiten
          newExample.options[i].probability = Math.max(0.02, newExample.options[i].probability - 0.07)
        }
      }
    }
    
    // Sortieren nach aktueller Wahrscheinlichkeit
    newExample.options.sort((a, b) => b.probability - a.probability);
    
    return newExample
  })
}

interface TrainingSimulationProps {
  step: number
}

export const TrainingSimulation = ({ step }: TrainingSimulationProps) => {
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [selectedTokensCount, setSelectedTokensCount] = useState(0);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<{[key: number]: string}>({});
  const [processedStep, setProcessedStep] = useState(0);
  
  // Initialisierung der Beispiele
  useEffect(() => {
    const initialExamples = parseCSVData(csvTexts);
    setExamples(initialExamples);
    setProcessedStep(step);
  }, []);
  
  // Bei Änderung des Schritts die Beispiele aktualisieren
  useEffect(() => {
    if (examples.length > 0 && processedStep !== step) {
      setProcessedStep(step);
      setExamples(improveDistributions(examples, step));
      setSelectedTokens({});  // Auswahl zurücksetzen beim Schrittwechsel
      setSelectedTokensCount(0);
      
      // Zum ersten Beispiel zurückgehen
      setCurrentExampleIndex(0);
    }
  }, [step, examples, processedStep]);
  
  // Wenn alle 5 Beispiele bearbeitet wurden, den nächsten Trainingsschritt auslösen
  useEffect(() => {
    if (selectedTokensCount >= 5 && step < 3) {
      // Event auslösen, um zum nächsten Schritt zu wechseln
      const event = new CustomEvent('nextTrainingStep');
      window.dispatchEvent(event);
    }
  }, [selectedTokensCount, step]);
  
  const handleTokenSelect = (token: string) => {
    // Nur einen Token pro Beispiel auswählen lassen
    if (selectedTokens[currentExampleIndex]) return;
    
    const newSelectedTokens = {
      ...selectedTokens,
      [currentExampleIndex]: token
    };
    
    setSelectedTokens(newSelectedTokens);
    
    // Anzahl der ausgewählten Tokens zählen
    const newCount = selectedTokensCount + 1;
    setSelectedTokensCount(newCount);
    
    // Nach kurzer Verzögerung zum nächsten Beispiel wechseln
    setTimeout(() => {
      const nextIndex = (currentExampleIndex + 1) % Math.min(5, examples.length);
      setCurrentExampleIndex(nextIndex);
    }, 2500);
  }
  
  if (examples.length === 0) {
    return <div>Lade Trainingsbeispiele...</div>
  }
  
  const currentExample = examples[currentExampleIndex];
  const hasSelected = selectedTokens[currentExampleIndex] !== undefined;
  
  // Formatieren der Wahrscheinlichkeitswerte für die Anzeige
  const formatProbability = (prob: number) => {
    return (prob * 100).toFixed(1) + '%'
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2 text-violet-800">
          {step === 1 && "Schritt 1: Initialer Zustand des Modells"}
          {step === 2 && "Schritt 2: Nach 1000 Trainingsbeispielen"}
          {step === 3 && "Schritt 3: Nach 100.000 Trainingsbeispielen"}
        </h3>
        <div className="flex justify-center mb-2">
          <Progress value={step * 33} className="w-64 h-2" />
        </div>
        <p className="text-sm text-gray-600">
          {step === 1 && "Das Modell hat noch nicht viel gelernt und macht unpräzise Vorhersagen."}
          {step === 2 && "Das Modell verbessert seine Vorhersagen durch Anpassung der Gewichtungen."}
          {step === 3 && "Das Modell hat nun seine Vorhersagefähigkeit erheblich verbessert."}
        </p>
      </div>
      
      <Card className="p-4 bg-gray-50">
        <div className="font-medium mb-2 flex justify-between">
          <div>Trainingsbeispiel {currentExampleIndex + 1}/{Math.min(5, examples.length)}</div>
          <div className="text-violet-600">Bearbeitet: {selectedTokensCount}/{Math.min(5, examples.length)}</div>
        </div>
        <div className="mb-4 p-3 bg-white rounded-md border">
          <span className="font-medium text-lg">{currentExample.input} </span>
          <span className="text-gray-400">...</span>
        </div>
        
        <div className="mb-2 font-medium">Das Modell berechnet Wahrscheinlichkeiten für den nächsten Token:</div>
        
        <div className="space-y-2 mb-4">
          {currentExample.options.map((option, index) => (
            <motion.div 
              key={`${currentExample.id}-${index}`}
              initial={{ opacity: 0.7, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-3 rounded-md cursor-pointer flex justify-between items-center border
                ${hasSelected ? 'cursor-default' : 'hover:bg-violet-50 hover:border-violet-200'}
                ${hasSelected && option.text === selectedTokens[currentExampleIndex] ? 'border-2 border-violet-500 bg-violet-50' : 'border-gray-200'}
                ${hasSelected && option.isCorrect ? 'border-2 border-green-500 bg-green-50' : ''}
              `}
              onClick={() => !hasSelected && handleTokenSelect(option.text)}
            >
              <span className="font-medium">{option.text}</span>
              <div className="flex items-center">
                <div className="w-20 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 transition-all duration-1000 ease-out"
                    style={{ width: `${option.probability * 100}%` }}
                  />
                </div>
                <span className="ml-2 text-sm">{formatProbability(option.probability)}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <div className="font-medium text-blue-700 mb-1">Trainingsprozess:</div>
          <p className="text-sm text-blue-600">
            {!hasSelected && "Wähle den Token aus, den das Modell vorhersagen soll. Der korrekte Zieltoken ist: "}
            {!hasSelected && <span className="font-bold">{currentExample.target}</span>}
            
            {hasSelected && selectedTokens[currentExampleIndex] === currentExample.target && 
              "Richtig! Das Modell hat korrekt vorhergesagt. Die Gewichtungen werden verstärkt."}
            
            {hasSelected && selectedTokens[currentExampleIndex] !== currentExample.target && 
              `Das Modell hat "${selectedTokens[currentExampleIndex]}" vorhergesagt, aber der korrekte Token ist "${currentExample.target}". Die Gewichtungen werden angepasst.`}
          </p>
        </div>
      </Card>
      
      <div className="mt-6 p-4 bg-violet-50 rounded-md border border-violet-100">
        <h3 className="font-medium text-violet-900 mb-2">Was passiert beim Training?</h3>
        <p className="text-sm text-violet-700">
          1. Das Modell bekommt einen <strong>Teilsatz</strong> als Eingabe
        </p>
        <p className="text-sm text-violet-700">
          2. Es berechnet <strong>Wahrscheinlichkeiten</strong> für alle möglichen nächsten Tokens
        </p>
        <p className="text-sm text-violet-700">
          3. Es vergleicht seine Vorhersage mit dem <strong>tatsächlichen</strong> nächsten Token
        </p>
        <p className="text-sm text-violet-700">
          4. Es <strong>passt seine Parameter an</strong>, um die Vorhersagegenauigkeit zu verbessern
        </p>
        <p className="text-sm text-violet-700 mt-2">
          Dieser Prozess wird <strong>Milliarden Male</strong> mit verschiedenen Texten wiederholt!
        </p>
      </div>
      
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
        <strong>Hinweis:</strong> Diese Simulation nutzt kurze Textausschnitte, ähnlich denen im Trainingsdatensatz.
        In der Realität verarbeitet das Modell während des Trainings jedoch parallel Tausende von Eingabetokens, um die Vorhersage des nächsten Tokens zu optimieren.
      </div>
    </div>
  )
}