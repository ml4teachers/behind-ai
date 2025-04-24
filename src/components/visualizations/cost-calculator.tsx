'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, HelpCircle } from 'lucide-react'; // MessageSquarePlus entfernt, da nicht verwendet
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Modellpreise (pro Token, in USD)
const modelPricing = {
  'gpt-4.1-nano': { name: 'GPT-4.1 nano (Schnell & Günstig)', inputPricePerToken: 0.10 / 1_000_000, outputPricePerToken: 0.40 / 1_000_000 },
  'gpt-4.1-mini': { name: 'GPT-4.1 mini (Ausgewogen)', inputPricePerToken: 0.40 / 1_000_000, outputPricePerToken: 1.60 / 1_000_000 },
  'o4-mini': { name: 'o4-mini (Gutes Reasoning)', inputPricePerToken: 1.10 / 1_000_000, outputPricePerToken: 4.40 / 1_000_000 },
  'o3': { name: 'o3 (Stärkstes Reasoning)', inputPricePerToken: 10.00 / 1_000_000, outputPricePerToken: 40.00 / 1_000_000 },
};
type ModelKey = keyof typeof modelPricing;

// Kategorien für Konversationskontext
type ContextSizeCategory = 'none' | 'short' | 'medium' | 'long';
const contextTokenValues: Record<ContextSizeCategory, number> = {
    none: 0,
    short: 1000,  // Annahme: ca. 1000 Tokens für kurzen Verlauf
    medium: 5000, // Annahme: ca. 5000 Tokens für mittleren Verlauf
    long: 20000   // Annahme: ca. 20000 Tokens für langen Verlauf
};


export function ApiCostSimulator() {
  const [inputText, setInputText] = useState<string>(
    "Fasse die wichtigsten Punkte unserer Teamsitzung vom 20. April zusammen: Projekt 'Medientage' Budget wurde genehmigt (Verantwortlich: Fr. Gerber), Hr. Rossi fehlt nächste Woche (krank)."
  );
  const [selectedModel, setSelectedModel] = useState<ModelKey>('gpt-4.1-mini');
  const [outputMultiplier, setOutputMultiplier] = useState<number>(2);
  const [selectedContextSize, setSelectedContextSize] = useState<ContextSizeCategory>('none'); // NEU: State für Kontext
  const [currentInputTokens, setCurrentInputTokens] = useState<number | null>(null); // Umbenannt für Klarheit
  const [contextTokens, setContextTokens] = useState<number>(0); // NEU: State für Kontext-Tokenzahl
  const [totalInputTokens, setTotalInputTokens] = useState<number | null>(null); // NEU: State für Gesamt-Input
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState<number | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null); // Kosten in USD
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset Funktion
  const resetCalculation = () => {
      setCurrentInputTokens(null);
      setTotalInputTokens(null);
      setEstimatedOutputTokens(null);
      setEstimatedCost(null);
      setError(null);
      // ContextTokens werden durch useEffect neu gesetzt, nicht hier resetten
  }

  const fetchTokenCount = async () => {
    if (!inputText.trim()) {
      setError("Bitte gib einen Text ein.");
      resetCalculation();
      return;
    }
    setIsLoading(true);
    resetCalculation(); // Reset vor dem Fetch

    try {
      const response = await fetch('/api/tokenize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText })
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Fehler beim Tokenisieren (${response.status})`);
      }
      const data: { totalTokens: number } = await response.json();
      setCurrentInputTokens(data.totalTokens); // Setzt nur die Tokens der aktuellen Eingabe

    } catch (err) {
        console.error("Tokenisierungsfehler:", err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Tokenisieren.');
        resetCalculation(); // Reset auch bei Fehler
    } finally {
      setIsLoading(false);
    }
  };

  // Effekt zur Berechnung der Kosten
  useEffect(() => {
    // Braucht die Tokens der aktuellen Eingabe UND die Auswahl des Kontexts
    if (currentInputTokens !== null) {
      const model = modelPricing[selectedModel];
      const contextTkns = contextTokenValues[selectedContextSize];
      const totalInputTkns = currentInputTokens + contextTkns;
      // Output basiert nur auf aktueller Anfrage, nicht auf Kontextlänge
      const outputTkns = Math.round(currentInputTokens * outputMultiplier);

      // HINWEIS: Hier verwenden wir den Standard-Input-Preis für *alle* Input-Tokens (aktuell + Kontext).
      // In Realität könnte Kontext günstiger sein (Cached Input).
      const cost = (totalInputTkns * model.inputPricePerToken) + (outputTkns * model.outputPricePerToken);

      setContextTokens(contextTkns); // Für Anzeige speichern
      setTotalInputTokens(totalInputTkns); // Für Anzeige speichern
      setEstimatedOutputTokens(outputTkns);
      setEstimatedCost(cost); // Kosten in USD speichern
      setError(null); // Reset error if calculation is successful
    } else {
      // Reset estimates if no current input tokens
      setContextTokens(contextTokenValues[selectedContextSize]); // Kontext-Tokens basierend auf Auswahl setzen
      setTotalInputTokens(null);
      setEstimatedOutputTokens(null);
      setEstimatedCost(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInputTokens, selectedModel, outputMultiplier, selectedContextSize]); // Abhängigkeiten korrekt

  // Funktion zur Formatierung der Kosten (Umrechnung USD -> CHF)
  const formatCost = (costInUSD: number | null): string => {
    if (costInUSD === null) return "N/A";

    // Annahme: 1 USD = 0.90 CHF (Kurs vom April 2025, anpassen falls nötig!)
    const exchangeRate = 0.90; // CHF pro USD
    const costInCHF = costInUSD / exchangeRate; // Korrekte Umrechnung

    if (costInCHF < 0.0001) { // Weniger als 0.01 Rappen
        return "< 0.01 Rp";
    } else if (costInCHF < 1.00) { // Zwischen 0.01 Rappen und 1 Franken
        const rappen = costInCHF * 100;
        // Runde auf 1-2 Nachkommastellen für Rappenbeträge
        return `${rappen.toFixed(rappen < 10 ? 2 : 1)} Rp`;
    } else { // Beträge ab 1 Franken
        // Runde auf 2 Nachkommastellen für Frankenbeträge
        return `${costInCHF.toFixed(2)} Fr`;
    }
  };

  return (
    // Container div (keine Card mehr aussen)
    <div className="space-y-4">
      {/* Input Textarea */}
       <div>
           <label htmlFor="cost-input-text" className="block text-sm font-medium text-gray-700 mb-1">
              Gib deine Anfrage hier ein:
            </label>
          <Textarea
            id="cost-input-text"
            placeholder="Schreibe oder kopiere deinen Text hier..."
            value={inputText}
            onChange={(e) => {
                setInputText(e.target.value);
                resetCalculation(); // Reset bei Textänderung
            }}
            rows={4}
            className="w-full"
            disabled={isLoading}
          />
           <p className="text-xs text-gray-500 mt-1">Die Länge dieser Anfrage bestimmt die direkten Input-Tokens.</p>
        </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modell Auswahl */}
          <div>
            <label htmlFor="cost-model-select" className="block text-sm font-medium text-gray-700 mb-1">
              Wähle Modell:
            </label>
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as ModelKey)}>
              <SelectTrigger id="cost-model-select"><SelectValue placeholder="Modell wählen..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(modelPricing).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <p className="text-xs text-gray-500 mt-1">Teurere Modelle = höhere Kosten/Token.</p>
          </div>

          {/* Antwortlänge */}
          <div>
             <label htmlFor="cost-output-multiplier" className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete Antwortlänge:
               <TooltipProvider delayDuration={100}><Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 relative -top-0.5"><HelpCircle className="h-4 w-4 text-gray-400" /></Button>
               </TooltipTrigger><TooltipContent className="max-w-xs"><p>Wie lang erwartest du die Antwort im Verhältnis zur aktuellen Anfrage? Output-Tokens kosten oft mehr!</p></TooltipContent></Tooltip></TooltipProvider>
            </label>
            <Select value={String(outputMultiplier)} onValueChange={(value) => setOutputMultiplier(Number(value))}>
               <SelectTrigger id="cost-output-multiplier"><SelectValue placeholder="Verhältnis wählen..." /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="0.5">Sehr kurz (~0.5x)</SelectItem>
                 <SelectItem value="1">Ähnlich lang (~1x)</SelectItem>
                 <SelectItem value="2">Doppelt so lang (~2x)</SelectItem>
                 <SelectItem value="3">Deutlich länger (~3x)</SelectItem>
                 <SelectItem value="5">Sehr lang (~5x)</SelectItem>
               </SelectContent>
            </Select>
             <p className="text-xs text-gray-500 mt-1">Längere Antworten = mehr Output-Tokens.</p>
          </div>

           {/* NEU: Konversationskontext */}
           <div>
             <label htmlFor="cost-context-size" className="block text-sm font-medium text-gray-700 mb-1">
              Vorheriger Chatverlauf:
               <TooltipProvider delayDuration={100}><Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 relative -top-0.5"><HelpCircle className="h-4 w-4 text-gray-400" /></Button>
               </TooltipTrigger><TooltipContent className="max-w-xs"><p>Wähle die geschätzte Länge des bisherigen Gesprächs. Diese Tokens werden bei jeder neuen Anfrage zusätzlich als Input gesendet und verursachen Kosten.</p></TooltipContent></Tooltip></TooltipProvider>
            </label>
            <Select value={selectedContextSize} onValueChange={(value) => setSelectedContextSize(value as ContextSizeCategory)}>
               <SelectTrigger id="cost-context-size"><SelectValue placeholder="Kontext wählen..." /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="none">Kein Verlauf (Einzelanfrage)</SelectItem>
                 <SelectItem value="short">Kurzer Verlauf (~1k Tokens)</SelectItem>
                 <SelectItem value="medium">Mittlerer Verlauf (~5k Tokens)</SelectItem>
                 <SelectItem value="long">Langer Verlauf (~20k Tokens)</SelectItem>
               </SelectContent>
            </Select>
             <p className="text-xs text-gray-500 mt-1">Längerer Verlauf = mehr Input-Tokens.</p>
          </div>
        </div>

      {/* Calculate Button */}
      <Button onClick={fetchTokenCount} disabled={isLoading || !inputText.trim()} className="w-full">
         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
         {isLoading ? 'Zähle Tokens...' : 'Kosten schätzen'}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center text-sm">
           <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
           <span>{error}</span>
        </div>
      )}

      {/* Results Display (ANGEPASST) */}
      {/* Zeige Ergebnisse nur an, wenn Berechnung erfolgreich war (totalInputTokens ist nicht null) */}
      {totalInputTokens !== null && estimatedCost !== null && !isLoading && !error && (
        <Card className="mt-4 p-4 bg-gray-50 border">
             <h4 className="text-sm font-semibold text-gray-800 mb-3">Geschätzte Kosten für diese Runde:</h4>
             {/* Angepasste Grid-Aufteilung */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* Input Tokens (Aktuell) */}
                <div>
                    <p className="text-xs text-gray-500 uppercase">Input (Aktuell)</p>
                    <p className="text-lg font-medium text-gray-900">{currentInputTokens ?? '?'}</p>
                </div>
                {/* Input Tokens (Kontext) */}
                <div>
                    <p className="text-xs text-gray-500 uppercase">Input (Kontext)</p>
                    {/* Zeige +0 an, wenn kein Kontext */}
                    <p className="text-lg font-medium text-gray-900">+{contextTokens}</p>
                </div>
                {/* Output Tokens */}
                 <div>
                    <p className="text-xs text-gray-500 uppercase">Output (Antwort)</p>
                    <p className="text-lg font-medium text-gray-900">~{estimatedOutputTokens ?? '?'}</p>
                </div>
                 {/* Geschätzte Kosten */}
                 <div>
                    <p className="text-xs text-gray-500 uppercase">Kosten (Runde)</p>
                    <p className="text-lg font-bold text-orange-700">{formatCost(estimatedCost)}</p>
                </div>
             </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                Basierend auf {modelPricing[selectedModel].name} Preisen (OpenAI, Apr 2025, in USD, umgerechnet zu CHF). Reale Kosten können abweichen (z.B. durch günstigeres Kontext-Caching).
              </p>
        </Card>
      )}
    </div> // Schliessendes Div des Hauptcontainers
  );
}