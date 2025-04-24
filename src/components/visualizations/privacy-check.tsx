import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function PrivacyCheck() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Datenschutz-Check für Lehrpersonen</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Geführter Fragebogen: Beantworte die Fragen...</p>
        {/* Hier kommt die UI und Logik des Fragebogens */}
      </CardContent>
    </Card>
  );
}
