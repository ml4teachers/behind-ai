import React from 'react';
import { Laptop, Server, ShieldCheck, Home, ArrowRight } from 'lucide-react'; // Home Icon für lokale Verarbeitung

// Definiere die möglichen Szenarien, die die Komponente akzeptiert
type Scenario = 'local' | 'api' | 'wrapper';

interface DataFlowVisualizationProps {
  scenario: Scenario;
  // Optional könnte man hier Phasen übergeben, um Schritte hervorzuheben,
  // aber wir halten es erstmal "ganz einfach" gemäss Anforderung.
}

// Hilfskomponente für einen Schritt im Flow
const FlowStep: React.FC<{ icon: React.ElementType, label: string, isActive?: boolean }> = ({ icon: Icon, label, isActive = true }) => (
  <div className={`flex flex-col items-center text-center w-20 flex-shrink-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
    <Icon size={28} className="mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

// Hilfskomponente für einen Pfeil
const FlowArrow: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => (
  <div className={`flex items-center justify-center flex-shrink-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
     <ArrowRight size={20} className="text-gray-500" />
  </div>
);


export function DataFlowVisualization({ scenario }: DataFlowVisualizationProps) {

  return (
    // Container mit horizontalem Flexbox-Layout und Scrollmöglichkeit auf kleinen Schirmen
    <div className="flex items-center justify-center space-x-3 sm:space-x-6 p-4 border rounded-md bg-muted/50 overflow-x-auto w-full">

      {/* Schritt 1: User */}
      <FlowStep icon={Laptop} label="Dein Gerät" isActive={true} />

      {/* Pfeil zum nächsten Schritt */}
      <FlowArrow isActive={true} />

      {/* Schritt 2: Abhängig vom Szenario */}
      {scenario === 'local' && (
        <FlowStep icon={Home} label="Lokales Modell" isActive={true} />
        // Kein weiterer Pfeil nach aussen
      )}

      {scenario === 'api' && (
         <FlowStep icon={Server} label="API Anbieter" isActive={true} />
        // Kein Wrapper
      )}

       {scenario === 'wrapper' && (
         <>
           <FlowStep icon={ShieldCheck} label="Wrapper" isActive={true} />
           <FlowArrow isActive={true} />
           <FlowStep icon={Server} label="API Anbieter" isActive={true} />
         </>
      )}

      {/* Optional: Pfeil für Antwort (vereinfacht, zeigt nur Zielrichtung) */}
      {/* Man könnte hier noch Pfeile zurück zum User zeichnen, aber das kann schnell unübersichtlich werden. */}
      {/* Für die Einfachheit lassen wir den Rückweg erstmal weg oder deuten ihn nur an. */}
      {/* Beispiel für angedeuteten Rückpfeil: */}
      {/* {scenario !== 'local' && <FlowArrow isActive={true} />} */}
      {/* {scenario !== 'local' && <FlowStep icon={Laptop} label="Antwort" isActive={true} />} */}


    </div>
  );
}