import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ModelMatchmaker() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>KI-Werkzeugkasten für den Unterricht</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Aufgabenbasierter Guide: Wähle eine Aufgabe...</p>
        {/* Hier kommt die UI und Logik des Guides */}
      </CardContent>
    </Card>
  );
}
