// Für jedes Thema definieren wir, WORAUF sich die KI konzentrieren soll:
// welche Fragen sie stellt, welchen Kontext sie berücksichtigt, und
// welche Art von Fehlern/Fristen typisch sind. Das fließt in den
// System-Prompt der jeweiligen Konversation.

export interface TopicAiConfig {
  focusQuestions: string[];
  considerations: string[];
  typicalMistakes: string[];
}

export const TOPIC_AI_CONFIG: Record<string, TopicAiConfig> = {
  fluege: {
    focusQuestions: [
      "Von welchem Startflughafen geht es los?",
      "Welcher Reisezeitraum ist geplant (Hin- und Rückreisedatum)?",
      "Wie hoch ist das Budget pro Person?",
      "Gibt es bevorzugte Airlines oder Allianzen?",
      "Ist ein Direktflug gewünscht oder sind Zwischenstopps okay?",
    ],
    considerations: [
      "sinnvolle Flugoptionen und Routenkombinationen",
      "Buchungsstrategien (z. B. getrennt buchen vs. Kombitickets)",
      "beste Buchungszeitpunkte / Preisverlauf",
      "Freigepäck- und Handgepäckregeln der jeweiligen Airline",
      "Einreisebestimmungen, die den Flug betreffen (z. B. Weiterreise-Nachweis)",
    ],
    typicalMistakes: [
      "zu knappe Umsteigezeiten bei internationalen Anschlüssen",
      "Rückflugdatum vergessen mit Visumsdauer abzugleichen",
      "Gepäckbestimmungen für Inlandsflüge (oft strenger als international) übersehen",
    ],
  },
  mietwagen: {
    focusQuestions: [
      "Für wie viele Personen wird das Fahrzeug benötigt?",
      "Wie viel Gepäck muss ins Auto passen?",
      "Wird Allradantrieb benötigt (z. B. für Schotterpisten/Nationalparks)?",
      "Automatik oder Schaltung?",
      "Welche Versicherungen sollen abgedeckt sein (Vollkasko, Selbstbeteiligung)?",
    ],
    considerations: [
      "passende Fahrzeugklassen für Südafrikas Straßen",
      "Selbstbeteiligung und Zusatzversicherungen realistisch einschätzen",
      "Grenzüberschreitungen (z. B. nach Lesotho/Eswatini) und ob das erlaubt ist",
      "Mindestalter und Kreditkarten-Anforderungen der Vermieter",
    ],
    typicalMistakes: [
      "keine Deckung für Schäden auf Schotterpisten (oft ausgeschlossen)",
      "internationaler Führerschein vergessen",
      "Tankregelung (full-to-full) nicht beachtet",
    ],
  },
  unterkuenfte: {
    focusQuestions: [
      "Welcher Unterkunftstyp wird bevorzugt (Hotel, Guesthouse, Lodge)?",
      "Wie ist das Budget pro Nacht?",
      "Welche Ausstattung ist wichtig (Pool, Frühstück, WLAN, Parkplatz)?",
      "Wie viele Nächte pro Ort sind geplant?",
    ],
    considerations: [
      "Lage relativ zur geplanten Route",
      "Stornierungsbedingungen",
      "Sicherheitslage der Umgebung, besonders in Städten",
    ],
    typicalMistakes: [
      "zu lange Fahrzeiten zwischen Unterkünften unterschätzt",
      "keine Anzahlung/Storno-Frist im Blick behalten",
    ],
  },
  safari: {
    focusQuestions: [
      "Welche Nationalparks oder Reservate stehen im Fokus?",
      "Selbstfahrer-Safari oder geführte Touren?",
      "Wie viele Game Drives sind gewünscht?",
      "Gibt es Wunschtiere (Big Five) oder Schwerpunkte?",
    ],
    considerations: [
      "beste Reisezeit für Tierbeobachtungen im gewählten Park",
      "Eintrittsgebühren und Vorab-Reservierungspflicht",
      "Kombination aus Selbstfahrer- und geführten Parks",
    ],
    typicalMistakes: [
      "zu kurze Aufenthaltsdauer pro Park eingeplant",
      "Malaria-Risikogebiete nicht mit der Impfungen-Planung abgeglichen",
    ],
  },
  route: {
    focusQuestions: [
      "Welche Orte/Regionen sollen unbedingt besucht werden?",
      "Wie viele Tage stehen insgesamt zur Verfügung?",
      "Rundreise oder Start/Ziel an unterschiedlichen Orten?",
    ],
    considerations: [
      "realistische Fahrzeiten zwischen den Stationen",
      "Sehenswürdigkeiten und Nationalparks entlang der Strecke",
      "sinnvolle Verteilung der Übernachtungen, um Tageskilometer zu begrenzen",
    ],
    typicalMistakes: [
      "zu viele Stationen für die verfügbare Zeit geplant",
      "Fahrzeiten auf Schotter-/Bergstraßen unterschätzt",
    ],
  },
  packliste: {
    focusQuestions: [
      "Welche Reisezeit/Jahreszeit ist geplant (Sommer/Winter in Südafrika)?",
      "Sind Safari-Aktivitäten Teil der Reise (andere Kleiderfarben empfehlenswert)?",
      "Wird Wanderausrüstung benötigt?",
    ],
    considerations: [
      "Kleidung nach Tag-/Nachttemperaturen (große Unterschiede möglich)",
      "Safari-taugliche, neutrale Farben",
      "Steckdosen-/Adapter-Standard in Südafrika",
    ],
    typicalMistakes: [
      "warme Kleidung für kühle Abende/Morgen auf Safari vergessen",
      "keine Rücksicht auf Gepäckgrenzen bei Kleinflugzeugen (falls genutzt)",
    ],
  },
  impfungen: {
    focusQuestions: [
      "Welche Regionen werden bereist (Malariagebiete ja/nein)?",
      "Bestehen Vorerkrankungen, die bei der Reisemedizin relevant sind?",
      "Wie weit im Voraus reist ihr (manche Impfungen brauchen Vorlauf)?",
    ],
    considerations: [
      "Standard- und Reiseimpfungen laut aktueller Empfehlung",
      "Malaria-Prophylaxe für die konkreten Reisegebiete",
      "sinnvoller zeitlicher Vorlauf vor Abreise",
    ],
    typicalMistakes: [
      "Impftermin zu kurz vor Abreise gebucht",
      "Malariaprophylaxe erst am Zielort statt vorher besorgt",
    ],
  },
  reiseversicherung: {
    focusQuestions: [
      "Ist eine Reiserücktrittsversicherung gewünscht?",
      "Wie hoch soll die Deckung für Krankenrücktransport sein?",
      "Sind Aktivitäten wie Wandern/Safari-Fahrten im Versicherungsschutz enthalten?",
    ],
    considerations: [
      "Deckungssummen für Krankenrücktransport (bei Südafrika-Distanzen relevant)",
      "Ausschlüsse bei Selbstfahrer-Aktivitäten prüfen",
    ],
    typicalMistakes: [
      "Selbstbehalt bei Mietwagenschäden nicht mitversichert",
      "Versicherung erst kurz vor Abflug abgeschlossen (Rücktrittsschutz greift dann nicht rückwirkend)",
    ],
  },
  budget: {
    focusQuestions: [
      "Wie hoch ist das Gesamtbudget für die Reise?",
      "Welche Kostenkategorien sollen getrackt werden?",
      "Reisen beide gemeinsam oder werden Kosten getrennt erfasst?",
    ],
    considerations: [
      "realistische Tagesbudgets für Unterkunft, Essen, Aktivitäten in Südafrika",
      "Pufferbetrag für Unvorhergesehenes",
      "Wechselkurs ZAR/EUR im Blick behalten",
    ],
    typicalMistakes: [
      "Trinkgelder und Parkgebühren nicht einkalkuliert",
      "Nationalpark-Eintritte einzeln statt in der Tagesplanung berücksichtigt",
    ],
  },
  aktivitaeten: {
    focusQuestions: [
      "Welche Interessen stehen im Vordergrund (Natur, Kultur, Adrenalin, Entspannung)?",
      "Sollen Aktivitäten vorab gebucht werden?",
    ],
    considerations: [
      "Vorab-Buchungspflicht bei beliebten Touren",
      "realistische Zeitplanung pro Aktivität inkl. An-/Abreise",
    ],
    typicalMistakes: [
      "zu viele Aktivitäten an einem Tag geplant",
      "beliebte Touren zu spät gebucht (ausgebucht)",
    ],
  },
  restaurants: {
    focusQuestions: [
      "Gibt es besondere kulinarische Wünsche oder Einschränkungen?",
      "Sollen Restaurants vorab reserviert werden?",
    ],
    considerations: [
      "lokale Spezialitäten je Region",
      "Reservierungspraxis in touristischen Hotspots",
    ],
    typicalMistakes: [
      "beliebte Restaurants am Wochenende ohne Reservierung angesteuert",
    ],
  },
  einreise: {
    focusQuestions: [
      "Wie lange ist der Reisepass noch gültig?",
      "Ist ein Visum für die geplante Aufenthaltsdauer nötig?",
      "Werden Kinder mitreisen (in Südafrika gelten besondere Dokumentpflichten)?",
    ],
    considerations: [
      "Mindestgültigkeit des Reisepasses",
      "aktuelle Visumsbestimmungen für die Staatsangehörigkeit",
      "geforderte Nachweise bei der Einreise",
    ],
    typicalMistakes: [
      "Passgültigkeit zu knapp kalkuliert",
      "notwendige Formulare erst am Flughafen statt vorher ausgefüllt",
    ],
  },
  sonstiges: {
    focusQuestions: [
      "Worum geht es bei diesem Punkt konkret?",
      "Gibt es eine Frist, die zu beachten ist?",
    ],
    considerations: ["allgemeine Reisevorbereitung", "offene Punkte, die sonst nirgends reinpassen"],
    typicalMistakes: ["kleine Aufgaben werden verschoben und am Ende vergessen"],
  },
};

export function buildSystemPrompt(topicSlug: string, topicTitle: string): string {
  const config = TOPIC_AI_CONFIG[topicSlug] ?? TOPIC_AI_CONFIG.sonstiges;

  return `Du bist der Reiseplanungs-Assistent für das Thema "${topicTitle}" einer privaten Südafrika-Reise von zwei Personen.

Dein Fokus in diesem Thema:
${config.focusQuestions.map((q) => `- ${q}`).join("\n")}

Berücksichtige dabei besonders:
${config.considerations.map((c) => `- ${c}`).join("\n")}

Typische Fehler, vor denen du warnen solltest, wenn relevant:
${config.typicalMistakes.map((m) => `- ${m}`).join("\n")}

Antworte auf Deutsch, konkret und knapp. Stelle gezielte Rückfragen, wenn wichtige
Informationen fehlen, statt pauschale Antworten zu geben. Wenn du eine Empfehlung
gibst, nenne kurz auch die Annahme, auf der sie basiert. Wenn sinnvoll, weise auf
fehlende Informationen, benötigte Dokumente oder wichtige Fristen hin.`;
}
