# Codebuch – Ergebnisse_Bundestagswahl_2017_bereinigt.csv

Amtliches Endergebnis · Bundestagswahl 24. September 2017

---

## 1. Allgemeine Beschreibung

Die Datei enthält die amtlichen Endergebnisse der Bundestagswahl vom 24. September 2017 auf Ebene der Wahlkreise, der Bundesländer und des gesamten Bundesgebiets. Die Rohdaten des Bundeswahlleiters wurden in dasselbe flache, maschinenlesbare Format überführt wie die bereinigten Datensätze BTW2021 und BTW2025.

| Eigenschaft | Wert |
|---|---|
| Dateiname | Ergebnisse_Bundestagswahl_2017_bereinigt.csv |
| Trennzeichen | Semikolon (`;`) |
| Zeichenkodierung | UTF-8 mit BOM (utf-8-sig) |
| Zeilen gesamt | 316 (inkl. Kopfzeile: 317) |
| Spalten gesamt | 194 |
| Wahlkreise | 299 |
| Bundesländer | 16 |
| Bundesgebiet | 1 |
| Quelle | Bundeswahlleiter – Amtliches Endergebnis BTW 2017 |
| Vorperiode | Bundestagswahl 2013 |

---

## 2. Spaltenstruktur

Jede Zeile beschreibt ein geografisches Gebiet (Wahlkreis, Bundesland oder Bundesgebiet). Die 194 Spalten gliedern sich in 5 Metadaten-Spalten und 189 Datenspalten für 47 Felder (je 4 Unterkategorien).

### 2.1 Metadaten-Spalten (Spalten 1–5)

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `Nr` | Text | Gebietsnummer. Wahlkreise: dreistellig mit führender Null (001–299). Bundesländer: zweistellig (01–16). Bundesgebiet: 99. |
| `Gebiet` | Text | Bezeichnung des Gebiets (z. B. „Flensburg – Schleswig", „Schleswig-Holstein", „Bundesgebiet"). |
| `gehört_zu` | Text | Übergeordnetes Bundesland (zweistellige Ländernummer 01–16). Bei Bundesland-Zeilen: 99. Bei der Bundesgebiet-Zeile: leer. |
| `Zeilentyp` | Text | Art des Gebiets. Mögliche Werte: `Wahlkreis`, `Bundesland`, `Bundesgebiet`. |
| `Direktmandat_Gewinner` | Text | In der Rohdatei 2017 nicht enthalten – Spalte ist für alle Zeilen leer. |

### 2.2 Datenspalten (Spalten 6–194)

Ab Spalte 6 folgen die Stimmdaten. Der Spaltenname ist nach folgendem Schema aufgebaut:

```
Feld_Stimmart_Zählstand
```

| Bestandteil | Mögliche Werte | Bedeutung |
|---|---|---|
| `Feld` | z. B. `SPD`, `CDU`, … | Parteiname oder aggregiertes Feld (Wahlberechtigte, Wähler, Ungültige/Gültige). |
| `Stimmart` | `Erststimmen`, `Zweitstimmen` | Erststimme = Direktkandidatur im Wahlkreis. Zweitstimme = Partei-/Listenstimme. |
| `Zählstand` | `Endgültig`, `Vorperiode` | Endgültig = amtliches Endergebnis BTW 2017. Vorperiode = Vergleichswert BTW 2013. |

Pro Partei/Feld entstehen je 4 Spalten (Erst-/Zweitstimme × Endgültig/Vorperiode).

### 2.3 Aggregierte Felder (vor den Partei-Spalten)

| Feld | Beschreibung |
|---|---|
| `Wahlberechtigte` | Anzahl der Wahlberechtigten im Gebiet. |
| `Wähler` | Anzahl der Personen, die ihre Stimme abgegeben haben (Wahlbeteiligung = Wähler / Wahlberechtigte). Hinweis: In den Datensätzen 2021 und 2025 heißt dieses Feld `Wählende`. |
| `Ungültige` | Anzahl ungültiger Stimmzettel. Hinweis: In 2021/2025 heißt dieses Feld `Ungültige Stimmen`. |
| `Gültige` | Anzahl gültiger Stimmzettel (= Wähler − Ungültige). Hinweis: In 2021/2025 heißt dieses Feld `Gültige Stimmen`. |

---

## 3. Zeilentypen

| Zeilentyp | Anzahl | Nr-Format | Beschreibung |
|---|---|---|---|
| `Wahlkreis` | 299 | 001–299 | Einzelne Wahlkreise. Das Feld `Direktmandat_Gewinner` ist in dieser Datei nicht befüllt. |
| `Bundesland` | 16 | 01–16 | Aggregat aller Wahlkreise eines Bundeslandes. |
| `Bundesgebiet` | 1 | 99 | Aggregat über ganz Deutschland. Entspricht dem bundesweiten amtlichen Endergebnis. |

### 3.1 Bundesland-Schlüssel (`gehört_zu` / `Nr`)

| Nr | Bundesland | Nr | Bundesland |
|---|---|---|---|
| 01 | Schleswig-Holstein | 09 | Bayern |
| 02 | Hamburg | 10 | Saarland |
| 03 | Niedersachsen | 11 | Berlin |
| 04 | Bremen | 12 | Brandenburg |
| 05 | Nordrhein-Westfalen | 13 | Mecklenburg-Vorpommern |
| 06 | Hessen | 14 | Sachsen |
| 07 | Rheinland-Pfalz | 15 | Sachsen-Anhalt |
| 08 | Baden-Württemberg | 16 | Thüringen |

---

## 4. Parteien und sonstige Felder

Insgesamt sind 43 Parteien/Gruppierungen sowie die Sammelkategorie „Übrige" enthalten. Pro Eintrag gibt es je vier Spalten (Erst-/Zweitstimme × Endgültig/Vorperiode).

| Kürzel | Vollständiger Name im Datensatz |
|---|---|
| CDU | Christlich Demokratische Union Deutschlands |
| SPD | Sozialdemokratische Partei Deutschlands |
| LINKE | DIE LINKE |
| GRÜNE | BÜNDNIS 90/DIE GRÜNEN |
| CSU | Christlich-Soziale Union in Bayern e.V. |
| FDP | Freie Demokratische Partei |
| AfD | Alternative für Deutschland |
| Piraten | Piratenpartei Deutschland |
| NPD / Die Heimat | Nationaldemokratische Partei Deutschlands |
| FW | FREIE WÄHLER |
| Tierschutzpartei | PARTEI MENSCH UMWELT TIERSCHUTZ |
| ÖDP | Ökologisch-Demokratische Partei |
| Tierschutzallianz | Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative |
| BP | Bayernpartei |
| Volksabstimmung | Ab jetzt...Demokratie durch Volksabstimmung |
| Partei der Vernunft | Partei der Vernunft |
| MLPD | Marxistisch-Leninistische Partei Deutschlands |
| BüSo | Bürgerrechtsbewegung Solidarität |
| SGP | Sozialistische Gleichheitspartei, Vierte Internationale |
| DIE RECHTE | DIE RECHTE |
| ADD | Allianz Deutscher Demokraten |
| Allianz Tierschutz | Allianz für Menschenrechte, Tier- und Naturschutz |
| bergpartei | bergpartei, die überpartei |
| Grundeinkommen | Bündnis Grundeinkommen |
| DiBe | DEMOKRATIE IN BEWEGUNG |
| DKP | Deutsche Kommunistische Partei |
| Deutsche Mitte | Deutsche Mitte |
| Die Grauen | Die Grauen – Für alle Generationen |
| Urbane | Die Urbane. Eine HipHop Partei |
| Gartenpartei | Magdeburger Gartenpartei |
| Menschliche Welt | Menschliche Welt |
| Humanisten | Partei der Humanisten |
| Gesundheitsforschung | Partei für Gesundheitsforschung |
| V-Partei³ | V-Partei³ - Partei für Veränderung, Vegetarier und Veganer |
| Bündnis C | Bündnis C - Christen für Deutschland |
| DIE EINHEIT | DIE EINHEIT |
| Die Violetten | Die Violetten |
| Familienpartei | Familien-Partei Deutschlands |
| DIE FRAUEN | Feministische Partei DIE FRAUEN |
| Mieterpartei | Mieterpartei |
| Neue Liberale | Neue Liberale – Die Sozialliberalen |
| UNABHÄNGIGE | UNABHÄNGIGE für bürgernahe Demokratie |
| Übrige | Übrige (Summe nicht einzeln ausgewiesener Parteien) |

---

## 5. Fehlende Werte

| Situation | Darstellung |
|---|---|
| Partei trat in diesem Wahlkreis nicht an | Leere Zelle |
| Vorperiodenwert nicht verfügbar | Leere Zelle |
| `Direktmandat_Gewinner` (gesamte Spalte) | Leer – in der Rohdatei 2017 nicht ausgewiesen |
| `gehört_zu` bei Bundesgebiet-Zeile | Leer |

---

## 6. Hinweise zur Bereinigung

Die Originaldatei des Bundeswahlleiters hatte folgendes Format:
- 5 Kommentarzeilen (mit `#` eingeleitet, Lizenz- und Beschreibungstext)
- 3 Kopfzeilen (Parteiname / Erststimmen–Zweitstimmen / Endgültig–Vorperiode)
- Keine Spalten für `Zeilentyp` oder `Direktmandat_Gewinner`

Folgende Schritte wurden bei der Bereinigung durchgeführt:

1. Kommentarzeilen entfernt (beim Einlesen via `comment='#'` übersprungen)
2. Dreizeilige Kopfzeile zu einer einzigen flachen Kopfzeile zusammengeführt (Schema: `Feld_Stimmart_Zählstand`)
3. Spalte `Zeilentyp` abgeleitet (`Wahlkreis` / `Bundesland` / `Bundesgebiet`)
4. Spalte `Direktmandat_Gewinner` ergänzt (leer, da in 2017-Rohdaten nicht enthalten)
5. `Nr` dreistellig null-aufgefüllt (001–299); Bundesländer zweistellig (01–16)
6. `gehört_zu` zweistellig null-aufgefüllt (01–16)

### Abweichungen gegenüber den Datensätzen 2021 und 2025

| Aspekt | BTW 2017 | BTW 2021 / 2025 |
|---|---|---|
| Feldname Wahlbeteiligung | `Wähler` | `Wählende` |
| Feldname ungültige Stimmen | `Ungültige` | `Ungültige Stimmen` |
| Feldname gültige Stimmen | `Gültige` | `Gültige Stimmen` |
| Anzahl Parteispalten | 43 + Übrige | 48 + Übrige (2021), 34 + Übrige (2025) |
| Kommentarzeilen in Rohdatei | 5 (mit `#`) | Keine (2021: 2 Titelzeilen) |
| Spalten gesamt | 194 | 213 (2021), 141 (2025) |

---

*Quelle: Bundeswahlleiter, www.bundeswahlleiter.de*
