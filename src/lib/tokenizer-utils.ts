// Eine vereinfachte Darstellung vom BPE-Tokenisierungsalgorithmus
// (In echten Anwendungen würde man eine Bibliothek wie tiktoken oder tokenizers verwenden)

// Simuliertes Vokabular für häufige Wörter und Unterteile
export const vocabTokens: Record<string, number> = {
  "hall": 42,
  "o": 17,
  "hallo": 567,
  "ich": 23,
  "bin": 45,
  "ein": 12,
  "sprach": 890,
  "modell": 891,
  "sprachmodell": 5678,
  "lern": 432,
  "en": 11,
  "lernen": 789,
  "ki": 321,
  "künstliche": 1234,
  "intelligenz": 1235,
  "computer": 876,
  "program": 543,
  "mier": 544,
  "programmier": 1111,
  "programmieren": 2222,
  "schule": 333,
  "klasse": 444,
  "freund": 555,
  "in": 8,
  "ist": 9,
  "und": 10,
  "der": 5,
  "die": 6,
  "das": 7,
  "zu": 13,
  "für": 14,
  "mit": 15,
  "von": 16,
  "aber": 20,
  "oder": 21,
  "wenn": 22,
  "kann": 24,
  "wie": 25,
  "was": 26,
  "wer": 27,
  "wo": 28,
  "warum": 29,
  ",": 2,
  ".": 3,
  "!": 4,
  "?": 18,
  " ": 1,
};

// Vereinfachte Tokenisierungsfunktion
export const tokenizeText = (text: string): { token: string; id: number }[] => {
  const result: { token: string; id: number }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Nach längsten übereinstimmenden Token im Vokabular suchen
    let found = false;
    let longestMatch = "";
    let longestMatchId = -1;

    // Sortiere Vokabular nach Tokenlänge (absteigend), um längste Matches zuerst zu finden
    Object.keys(vocabTokens)
      .sort((a, b) => b.length - a.length)
      .forEach((token) => {
        if (remaining.startsWith(token) && token.length > longestMatch.length) {
          longestMatch = token;
          longestMatchId = vocabTokens[token];
          found = true;
        }
      });

    if (found) {
      // Token gefunden, zur Liste hinzufügen
      result.push({ 
        token: longestMatch, 
        id: longestMatchId 
      });
      // Verbleibenden Text aktualisieren
      remaining = remaining.slice(longestMatch.length);
    } else {
      // Kein Token gefunden, einzelnes Zeichen als Fallback verwenden
      const char = remaining[0];
      result.push({ 
        token: char, 
        id: vocabTokens[char] || 9999 // 9999 für unbekannte Tokens
      });
      remaining = remaining.slice(1);
    }
  }

  return result;
};

// Demonstriert, wie Wortstücke zu komplexeren Wörtern zusammengefügt werden
export const showTokenMerging = (word: string): string[][] => {
  // Einfache Demonstration von Byte Pair Encoding (BPE)
  // Zeigt, wie ein Wort schrittweise in immer größere Teile tokenisiert wird
  
  // Beispiel für "programmieren":
  if (word.toLowerCase() === "programmieren") {
    return [
      ["p", "r", "o", "g", "r", "a", "m", "m", "i", "e", "r", "e", "n"], // Einzelne Buchstaben
      ["pr", "o", "g", "r", "a", "m", "m", "i", "e", "r", "e", "n"],    // Erste Kombinationen
      ["pr", "o", "g", "r", "a", "mm", "i", "e", "r", "e", "n"],        // Häufiges Paar "mm"
      ["pr", "o", "g", "r", "a", "mm", "i", "er", "en"],                // Häufiges Paar "er" und "en"
      ["pro", "g", "r", "a", "mm", "i", "er", "en"],                    // Häufiges Paar "pro"
      ["pro", "g", "ra", "mm", "i", "er", "en"],                        // Häufiges Paar "ra"
      ["pro", "g", "ra", "mm", "ier", "en"],                            // Häufiges Paar "ier"
      ["pro", "gra", "mm", "ier", "en"],                                // Häufiges Paar "gra"
      ["program", "mier", "en"],                                        // Größere Zusammenfassung
      ["programmier", "en"],                                            // Fast fertig
      ["programmieren"]                                                 // Vollständiges Wort
    ];
  }
  
  // Beispiel für "sprachmodell":
  if (word.toLowerCase() === "sprachmodell") {
    return [
      ["s", "p", "r", "a", "c", "h", "m", "o", "d", "e", "l", "l"],  // Einzelne Buchstaben
      ["s", "p", "r", "a", "c", "h", "m", "o", "d", "e", "ll"],      // Häufiges Paar "ll"
      ["s", "p", "r", "a", "c", "h", "m", "o", "d", "ell"],          // Häufiges Paar "ell"
      ["s", "p", "r", "a", "ch", "m", "o", "d", "ell"],              // Häufiges Paar "ch"
      ["s", "pr", "a", "ch", "m", "o", "d", "ell"],                  // Häufiges Paar "pr"
      ["s", "pr", "a", "ch", "m", "o", "dell"],                      // Häufiges Paar "dell"
      ["spr", "a", "ch", "m", "o", "dell"],                          // Häufiges Muster "spr"
      ["spra", "ch", "m", "o", "dell"],                              // Häufiges Paar "spra"
      ["sprach", "m", "o", "dell"],                                  // Wort "sprach"
      ["sprach", "mo", "dell"],                                      // Häufiges Paar "mo"
      ["sprach", "modell"],                                          // Wort "modell"
      ["sprachmodell"]                                               // Vollständiges Wort
    ];
  }
  
  // Fallback für andere Wörter
  const chars = word.split('');
  return [chars, [word]];
};