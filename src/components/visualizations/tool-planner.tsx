import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ToolPlanner() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>KI-Einsatzplaner</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Interaktiver Planer: Setze deine Prioritäten...</p>
        {/* Hier kommt die UI und Logik des Planers */}
      </CardContent>
    </Card>
  );
}
