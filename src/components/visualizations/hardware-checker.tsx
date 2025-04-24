'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Nur CardContent evtl. nötig
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, XCircle, Cloud, Cpu, MemoryStick, Monitor // oder Zap für Power?
} from 'lucide-react';

// Kategorien definieren
type ModelSizeCategory = 'small' | 'medium' | 'large' | 'veryLarge' | 'cloud';
type RamCategory = 'low' | 'medium' | 'high';
type GpuCategory = 'none' | 'low' | 'medium' | 'high';

// Typ für das Feedback
interface Feedback {
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  explanation: string;
  icon: React.ElementType;
}

// Anforderungen pro Modellgrösse definieren (vereinfacht!)
// Hier legen wir fest, welche *minimale* Kategorie benötigt wird.
// Diese Werte sind Schätzungen und dienen der Veranschaulichung.
const modelRequirements: Record<Exclude<ModelSizeCategory, 'cloud'>, { ram: RamCategory, gpu: GpuCategory, name: string }> = {
  small:     { ram: 'low',    gpu: 'none',   name: "Klein (~3B)"},
  medium:    { ram: 'medium', gpu: 'low',    name: "Mittel (~8B)"},
  large:     { ram: 'high',   gpu: 'medium', name: "Gross (~30B)"},
  veryLarge: { ram: 'high',   gpu: 'high',   name: "Sehr Gross (~70B)"},
};

// Numerische Levels zum einfachen Vergleichen der Kategorien
const ramLevels: Record<RamCategory, number> = { low: 1, medium: 2, high: 3 };
const gpuLevels: Record<GpuCategory, number> = { none: 0, low: 1, medium: 2, high: 3 };

export function HardwareChecker() {
  // Standardauswahl für den Start
  const [selectedModelSize, setSelectedModelSize] = useState<ModelSizeCategory>('medium');
  const [selectedRam, setSelectedRam] = useState<RamCategory>('medium');
  const [selectedGpu, setSelectedGpu] = useState<GpuCategory>('low');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Neuberechnung des Feedbacks, wenn sich eine Auswahl ändert
  useEffect(() => {
    let currentFeedback: Feedback;

    if (selectedModelSize === 'cloud') {
      currentFeedback = {
        status: 'info',
        message: "Nur via Cloud/API",
        explanation: "Modelle dieser Grösse (wie GPT-4) laufen aufgrund ihrer enormen Anforderungen praktisch nur in spezialisierten Rechenzentren.",
        icon: Cloud
      };
    } else {
      const req = modelRequirements[selectedModelSize];
      const modelName = req.name;

      // Vergleiche die ausgewählten Level mit den benötigten Levels
      const hasEnoughRam = ramLevels[selectedRam] >= ramLevels[req.ram];
      const hasEnoughGpu = gpuLevels[selectedGpu] >= gpuLevels[req.gpu];
      const needsGpu = req.gpu !== 'none'; // Braucht das Modell überhaupt eine GPU?

      if (hasEnoughGpu && hasEnoughRam) {
        // Beste Bedingung: GPU reicht (und RAM auch)
        currentFeedback = {
          status: 'success',
          message: "Läuft voraussichtlich gut (GPU)",
          explanation: `Mit dieser Hardware-Ausstattung (RAM: ${selectedRam}, GPU: ${selectedGpu}) sollte ein ${modelName}-Modell flüssig auf der Grafikkarte laufen können.`,
          icon: CheckCircle
        };
      } else if (!hasEnoughGpu && needsGpu && hasEnoughRam) {
        // GPU reicht nicht, aber RAM schon UND Modell braucht eigentlich GPU
        // CPU-Fallback ist nur bei kleineren Modellen eine (sehr langsame) Option
        if (selectedModelSize === 'medium' || selectedModelSize === 'small') {
             currentFeedback = {
               status: 'warning',
               message: "Läuft nur auf CPU (sehr langsam)",
               explanation: `Die Grafikkarte (${selectedGpu}) ist für ein ${modelName}-Modell zu schwach. Mit ausreichend RAM (${selectedRam}) könnte es auf der CPU laufen, aber erwarte lange Wartezeiten.`,
               icon: AlertTriangle
            };
        } else {
             // Grosse Modelle ohne passende GPU -> unrealistisch
             currentFeedback = {
               status: 'error',
               message: "Stärkere Grafikkarte (GPU) benötigt",
               explanation: `Ein ${modelName}-Modell braucht mindestens eine ${req.gpu}-GPU. Deine Auswahl (${selectedGpu}) reicht nicht, auch wenn der RAM (${selectedRam}) genügt.`,
               icon: XCircle
             };
        }
      } else if (hasEnoughGpu && !hasEnoughRam) {
          // GPU würde reichen, aber RAM nicht -> RAM ist der Blocker
           currentFeedback = {
               status: 'error',
               message: "Mehr Arbeitsspeicher (RAM) benötigt",
               explanation: `Ein ${modelName}-Modell braucht mindestens ${req.ram}-RAM. Deine Auswahl (${selectedRam}) ist zu gering, auch wenn die Grafikkarte (${selectedGpu}) passen würde.`,
               icon: XCircle
           };
      }
      else if (!hasEnoughRam) {
         // RAM reicht nicht (primärer Blocker)
         currentFeedback = {
           status: 'error',
           message: "Nicht genügend Arbeitsspeicher (RAM)",
           explanation: `Ein ${modelName}-Modell benötigt mindestens ${req.ram}-RAM. Deine Auswahl (${selectedRam}) ist zu gering. Prüfe auch die Grafikkarten-Anforderung.`,
           icon: XCircle
         };
      } else if (!needsGpu && hasEnoughRam) {
          // Modell braucht keine GPU (z.B. 'small'), RAM reicht -> Läuft auf CPU
           currentFeedback = {
               status: 'success', // Oder 'info'? 'Success' weil es läuft.
               message: "Läuft auf CPU",
               explanation: `Ein ${modelName}-Modell benötigt keine spezielle Grafikkarte und sollte mit ${selectedRam}-RAM auf der CPU laufen können.`,
               icon: CheckCircle
           };
      }
      else {
         // Fallback für unerwartete Kombinationen
          currentFeedback = {
            status: 'error',
            message: "Konfiguration unklar/ungünstig",
            explanation: `Die Anforderungen für ${modelName} (${req.ram}-RAM, ${req.gpu}-GPU) passen nicht gut zur Auswahl (${selectedRam}-RAM, ${selectedGpu}-GPU).`,
            icon: XCircle
          };
      }
    }
    setFeedback(currentFeedback);

  }, [selectedModelSize, selectedRam, selectedGpu]);

  return (
    <div className="space-y-6 p-1"> {/* Weniger Padding innen, da es in einer Card sitzt */}
      {/* Auswahl-Steuerung */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Modellgrösse */}
        <div>
          <label htmlFor="model-size-select" className="block text-sm font-medium text-gray-700 mb-1">1. Wähle die Modellgrösse</label>
          <Select value={selectedModelSize} onValueChange={(value) => setSelectedModelSize(value as ModelSizeCategory)}>
            <SelectTrigger id="model-size-select">
              <SelectValue placeholder="Grösse wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Klein (z.B. ~3 Mrd. Parameter)</SelectItem>
              <SelectItem value="medium">Mittel (z.B. ~8 Mrd. Parameter)</SelectItem>
              <SelectItem value="large">Gross (z.B. ~30 Mrd. Parameter)</SelectItem>
              <SelectItem value="veryLarge">Sehr Gross (z.B. ~70 Mrd. Parameter)</SelectItem>
              <SelectItem value="cloud">Cloud-Modell (GPT-4 Klasse)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RAM */}
         <div>
          <label htmlFor="ram-select" className="block text-sm font-medium text-gray-700 mb-1">2. Wähle den Arbeitsspeicher</label>
          <Select value={selectedRam} onValueChange={(value) => setSelectedRam(value as RamCategory)}>
            <SelectTrigger id="ram-select">
              <SelectValue placeholder="RAM wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Wenig (z.B. 8 GB)</SelectItem>
              <SelectItem value="medium">Mittel (z.B. 16 GB)</SelectItem>
              <SelectItem value="high">Viel (z.B. 32 GB+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* GPU */}
        <div>
          <label htmlFor="gpu-select" className="block text-sm font-medium text-gray-700 mb-1">3. Wähle die Grafikkarte</label>
          <Select value={selectedGpu} onValueChange={(value) => setSelectedGpu(value as GpuCategory)}>
            <SelectTrigger id="gpu-select">
              <SelectValue placeholder="GPU wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine / Onboard (IGP)</SelectItem>
              <SelectItem value="low">Einsteiger (ca. 4-6 GB VRAM)</SelectItem>
              <SelectItem value="medium">Mittelklasse (ca. 8-12 GB VRAM)</SelectItem>
              <SelectItem value="high">High-End (16 GB+ VRAM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback Anzeige */}
      {feedback && (
        <Card className={`mt-6 p-4 border-l-4 shadow-md ${ // Mehr sichtbare Card
            feedback.status === 'success' ? 'bg-green-50 border-green-500' :
            feedback.status === 'warning' ? 'bg-yellow-50 border-yellow-500' :
            feedback.status === 'error' ? 'bg-red-50 border-red-500' :
            'bg-blue-50 border-blue-500' // info
          }`}
        >
          <div className="flex items-start sm:items-center"> {/* Bessere Ausrichtung auf kleinen Screens */}
            <feedback.icon aria-hidden="true" className={`h-6 w-6 mr-3 flex-shrink-0 ${ // Aria-hidden für Deko-Icon
                feedback.status === 'success' ? 'text-green-600' :
                feedback.status === 'warning' ? 'text-yellow-600' :
                feedback.status === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}
            />
            <div className="flex-grow">
              <p className={`font-semibold text-base ${ // Etwas grösser
                  feedback.status === 'success' ? 'text-green-800' :
                  feedback.status === 'warning' ? 'text-yellow-800' :
                  feedback.status === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}
              >
                {feedback.message}
              </p>
              <p className="text-sm text-gray-700 mt-1">{feedback.explanation}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}