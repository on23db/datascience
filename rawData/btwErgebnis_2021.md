# Codebuch – Ergebnisse_Bundestagswahl_2021_bereinigt.csv

Amtliches Endergebnis · Bundestagswahl 26. September 2021

---

## 1. Allgemeine Beschreibung

Die Datei enthält die amtlichen Endergebnisse der Bundestagswahl vom 26. September 2021 auf Ebene der Wahlkreise, der Bundesländer und des gesamten Bundesgebiets. Die Rohdaten des Bundeswahlleiters wurden in ein flaches, maschinenlesbares Format überführt, das dem bereinigten 2025er-Datensatz (BTW2025_bereinigt.csv) entspricht.

| Eigenschaft | Wert |
|---|---|
| Dateiname | Ergebnisse_Bundestagswahl_2021_bereinigt.csv |
| Trennzeichen | Semikolon (`;`) |
| Zeichenkodierung | UTF-8 mit BOM (utf-8-sig) |
| Zeilen gesamt | 316 (inkl. Kopfzeile: 317) |
| Spalten gesamt | 213 |
| Wahlkreise | 299 |
| Bundesländer | 16 |
| Bundesgebiet | 1 |
| Quelle | Bundeswahlleiter – Amtliches Endergebnis BTW 2021 |
| Vorperiode | Bundestagswahl 2017 |

---

## 2. Spaltenstruktur

Jede Zeile beschreibt ein geografisches Gebiet (Wahlkreis, Bundesland oder Bundesgebiet). Die 213 Spalten gliedern sich in 5 Metadaten-Spalten und 208 Datenspalten für 52 Felder (je 4 Unterkategorien).

### 2.1 Metadaten-Spalten (Spalten 1–5)

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `Nr` | Text | Gebietsnummer. Wahlkreise: dreistellig mit führender Null (001–299). Bundesländer: zweistellig (01–16). Bundesgebiet: 99. |
| `Gebiet` | Text | Bezeichnung des Gebiets (z. B. „Flensburg – Schleswig", „Schleswig-Holstein", „Bundesgebiet"). |
| `gehört_zu` | Text | Übergeordnetes Bundesland (zweistellige Ländernummer 01–16). Bei Bundesland-Zeilen: 99. Bei der Bundesgebiet-Zeile: leer. |
| `Zeilentyp` | Text | Art des Gebiets. Mögliche Werte: `Wahlkreis`, `Bundesland`, `Bundesgebiet`. |
| `Direktmandat_Gewinner` | Text | In der Rohdatei 2021 nicht enthalten – Spalte ist für alle Zeilen leer. (In der 2025-Datei steht hier der Name der Partei des Direktmandatsgewinners.) |

### 2.2 Datenspalten (Spalten 6–213)

Ab Spalte 6 folgen die Stimmdaten. Der Spaltenname ist nach folgendem Schema aufgebaut:

```
Feld_Stimmart_Zählstand
```

| Bestandteil | Mögliche Werte | Bedeutung |
|---|---|---|
| `Feld` | z. B. `SPD`, `CDU`, … | Parteiname oder aggregiertes Feld (Wahlberechtigte, Wählende, Ungültige/Gültige Stimmen). |
| `Stimmart` | `Erststimmen`, `Zweitstimmen` | Erststimme = Direktkandidatur im Wahlkreis. Zweitstimme = Partei-/Listenstimme. |
| `Zählstand` | `Endgültig`, `Vorperiode` | Endgültig = amtliches Endergebnis BTW 2021. Vorperiode = Vergleichswert BTW 2017. |

Pro Partei/Feld entstehen je 4 Spalten (Erst-/Zweitstimme × Endgültig/Vorperiode).

### 2.3 Aggregierte Felder (vor den Partei-Spalten)

| Feld | Beschreibung |
|---|---|
| `Wahlberechtigte` | Anzahl der Wahlberechtigten im Gebiet. |
| `Wählende` | Anzahl der Personen, die ihre Stimme abgegeben haben (Wahlbeteiligung = Wählende / Wahlberechtigte). |
| `Ungültige Stimmen` | Anzahl ungültiger Stimmzettel. |
| `Gültige Stimmen` | Anzahl gültiger Stimmzettel (= Wählende − Ungültige Stimmen). |

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

Insgesamt sind 48 Parteien/Gruppierungen sowie die Sammelkategorie „Übrige" enthalten. Pro Eintrag gibt es je vier Spalten (Erst-/Zweitstimme × Endgültig/Vorperiode).

| Kürzel | Vollständiger Name im Datensatz |
|---|---|
| CDU | Christlich Demokratische Union Deutschlands |
| SPD | Sozialdemokratische Partei Deutschlands |
| AfD | Alternative für Deutschland |
| FDP | Freie Demokratische Partei |
| LINKE | DIE LINKE |
| GRÜNE | BÜNDNIS 90/DIE GRÜNEN |
| CSU | Christlich-Soziale Union in Bayern e.V. |
| FW | FREIE WÄHLER |
| dieBasis | Basisdemokratische Partei Deutschland |
| Tierschutzpartei | PARTEI MENSCH UMWELT TIERSCHUTZ |
| Tierschutzallianz | Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative |
| Die Heimat | Die Heimat (2021: Nationaldemokratische Partei Deutschlands) |
| Piraten | Piratenpartei Deutschland |
| ÖDP | Ökologisch-Demokratische Partei |
| V-Partei³ | V-Partei³ - Partei für Veränderung, Vegetarier und Veganer |
| DiBe | DEMOKRATIE IN BEWEGUNG |
| BP | Bayernpartei |
| Allianz Tierschutz | Allianz für Menschenrechte, Tier- und Naturschutz |
| MLPD | Marxistisch-Leninistische Partei Deutschlands |
| Verjüngungsforschung | Partei für schulmedizinische Verjüngungsforschung (2021: Partei für Gesundheitsforschung) |
| Menschliche Welt | Menschliche Welt - für das Wohl und Glücklichsein aller |
| DKP | Deutsche Kommunistische Partei |
| Die Grauen | Die Grauen – Für alle Generationen |
| BüSo | Bürgerrechtsbewegung Solidarität |
| Humanisten | Partei der Humanisten |
| Gartenpartei | Gartenpartei |
| Urbane | Die Urbane. Eine HipHop Partei |
| SGP | Sozialistische Gleichheitspartei, Vierte Internationale |
| Bündnis C | Bündnis C - Christen für Deutschland |
| BfFW | Bürgerbewegung für Fortschritt und Wandel |
| III. Weg | DER DRITTE WEG |
| diePinken | diePinken/BÜNDNIS21 |
| LIEBE | Europäische Partei LIEBE |
| Wir Bürger | Wir Bürger (2021: Liberal-Konservative Reformer) |
| Fortschritt | Partei des Fortschritts |
| Kinderpartei | >> Partei für Kinder, Jugendliche und Familien << – Lobbyisten für Kinder – |
| SSW | Südschleswigscher Wählerverband |
| Todenhöfer | Team Todenhöfer – Die Gerechtigkeitspartei |
| UNABHÄNGIGE | UNABHÄNGIGE für bürgernahe Demokratie |
| Volt | Volt Deutschland |
| Volksabstimmung | Ab jetzt...Demokratie durch Volksabstimmung - Politik für die Menschen |
| bergpartei | bergpartei, die überpartei - ökoanarchistisch-realdadaistisches sammelbecken |
| SONSTIGEN | DIE SONSTIGEN - X |
| Familienpartei | Familien-Partei Deutschlands |
| Graue Panther | Graue Panther |
| Klimaliste | Klimaliste Baden-Württemberg |
| THP | Thüringer Heimatpartei |
| Übrige | Übrige (Summe nicht einzeln ausgewiesener Parteien) |

---

## 5. Fehlende Werte

| Situation | Darstellung |
|---|---|
| Partei trat in diesem Wahlkreis nicht an | Leere Zelle |
| Vorperiodenwert nicht verfügbar | Leere Zelle |
| `Direktmandat_Gewinner` (gesamte Spalte) | Leer – in der Rohdatei 2021 nicht ausgewiesen |
| `gehört_zu` bei Bundesgebiet-Zeile | Leer |

---

## 6. Hinweise zur Bereinigung

Die Originaldatei des Bundeswahlleiters hatte folgendes Format:
- 2 Titelzeilen (Datei- und Ergebnistitel)
- 3 Kopfzeilen (Parteiname / Erststimmen–Zweitstimmen / Endgültig–Vorperiode)
- Keine Spalten für `Zeilentyp` oder `Direktmandat_Gewinner`

Folgende Schritte wurden bei der Bereinigung durchgeführt:

1. Titelzeilen entfernt
2. Dreizeilige Kopfzeile zu einer einzigen flachen Kopfzeile zusammengeführt (Schema: `Feld_Stimmart_Zählstand`)
3. Spalte `Zeilentyp` abgeleitet (`Wahlkreis` / `Bundesland` / `Bundesgebiet`)
4. Spalte `Direktmandat_Gewinner` ergänzt (leer, da in 2021-Rohdaten nicht enthalten)
5. `Nr` dreistellig null-aufgefüllt (001–299); Bundesländer zweistellig (01–16)
6. `gehört_zu` zweistellig null-aufgefüllt (01–16)
7. Leere Trennzeilen zwischen Bundesland-Blöcken entfernt

---

*Quelle: Bundeswahlleiter, www.bundeswahlleiter.de*
