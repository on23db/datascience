# Codebuch – BTW2025_bereinigt.csv
# Bundestagswahl 2025 – Endgültige Ergebnisse (Wahlkreise, Bundesländer, Bundesgebiet)

## Allgemein
- Trenner: Semikolon (;)
- Kodierung: UTF-8
- Fehlende Werte: leere Zeichenkette ('') – bedeutet: Partei trat in diesem Gebiet nicht an oder Wert nicht verfügbar
- Werte '–', '-', '—' wurden in '' umgewandelt
- Original hatte 3-zeiligen Header → zu einem einzeiligen Header zusammengeführt
- Leere Trennzeilen und Kommentarzeilen (Zeilen mit führendem ';') wurden entfernt
- Zeilenanzahl: 316 (299 Wahlkreise + 16 Bundesland-Summen + 1 Bundesgebiet)

## Spalten (Metadaten)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| Nr | String | Wahlkreisnummer (001–299), Bundesland-Code (01–16) oder '99' (Bundesgebiet) |
| Gebiet | String | Name des Wahlkreises, Bundeslandes oder 'Bundesgebiet' |
| gehört_zu | String | Bundesland-Code (01–16) des übergeordneten Bundeslandes; leer bei Bundesgebiet (Nr=99) |
| Zeilentyp | String | 'Wahlkreis' / 'Bundesland' / 'Bundesgebiet' |
| Direktmandat_Gewinner | String | Parteiname des Direktmandatsgewinners; leer = kein Direktmandat vergeben |

## Bundesland-Codes (gehört_zu)

| Code | Bundesland |
|------|-----------|
| 01 | Schleswig-Holstein |
| 02 | Hamburg |
| 03 | Niedersachsen |
| 04 | Bremen |
| 05 | Nordrhein-Westfalen |
| 06 | Hessen |
| 07 | Rheinland-Pfalz |
| 08 | Baden-Württemberg |
| 09 | Bayern |
| 10 | Saarland |
| 11 | Berlin |
| 12 | Brandenburg |
| 13 | Mecklenburg-Vorpommern |
| 14 | Sachsen |
| 15 | Sachsen-Anhalt |
| 16 | Thüringen |

## Spalten (Stimmdaten) – Namensschema

Alle weiteren Spalten folgen dem Muster:
  <Kategorie>_<Stimmenart>_<Periode>

- <Kategorie>: z.B. 'Wahlberechtigte', 'Wählende', 'Ungültige Stimmen', 'Gültige Stimmen', Parteiname
- <Stimmenart>: 'Erststimmen' (Direktkandidat) oder 'Zweitstimmen' (Partei)
- <Periode>: 'Endgültig' (BTW 2025) oder 'Vorperiode' (BTW 2021 zum Vergleich)
- Alle Werte: Integer (absolute Stimmen/Berechtigte), leer = nicht verfügbar / nicht angetreten

## Parteien (Spalten 5–140)

| Kürzel | Vollname in Spalte |
|--------|-------------------|
| SPD | Sozialdemokratische Partei Deutschlands |
| CDU | Christlich Demokratische Union Deutschlands |
| GRÜNE | BÜNDNIS 90/DIE GRÜNEN |
| FDP | Freie Demokratische Partei |
| AfD | Alternative für Deutschland |
| CSU | Christlich-Soziale Union in Bayern e.V. |
| LINKE | Die Linke |
| FW | FREIE WÄHLER |
| TIERSCHUTZ | PARTEI MENSCH UMWELT TIERSCHUTZ |
| BASIS | Basisdemokratische Partei Deutschland |
| TIERSCHUTZPARTEI | Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative |
| TODENHÖFER | Die Gerechtigkeitspartei – Team Todenhöfer |
| PIRATEN | Piratenpartei Deutschland |
| VOLT | Volt Deutschland |
| ÖDP | Ökologisch-Demokratische Partei - Die Naturschutzpartei |
| SSW | Südschleswigscher Wählerverband |
| PfV | Partei für Verjüngungsforschung |
| Humanisten | Partei der Humanisten - Fakten, Freiheit, Fortschritt |
| BündnisC | Bündnis C - Christen für Deutschland |
| BP | Bayernpartei |
| MLPD | Marxistisch-Leninistische Partei Deutschlands |
| MenschlicheWelt | Menschliche Welt - für das Wohl und Glücklichsein aller |
| PdF | Partei des Fortschritts |
| SGP | Sozialistische Gleichheitspartei, Vierte Internationale |
| BüSo | Bürgerrechtsbewegung Solidarität |
| BÜNDNIS_DE | BÜNDNIS DEUTSCHLAND |
| BSW | Bündnis Sahra Wagenknecht - Vernunft und Gerechtigkeit |
| MERA25 | MERA25 - Gemeinsam für Europäische Unabhängigkeit |
| WU | WerteUnion |
| Übrige | Übrige (Summe sonstiger Parteien) |

## Bereinigungsprotokoll

| Schritt | Aktion |
|---------|--------|
| 1 | BOM (UTF-8 Byte Order Mark) entfernt |
| 2 | 3-zeiliger Header zu einzeiligem Header zusammengeführt (Forward-Fill + Konkatenation) |
| 3 | 16 Leer-/Trennzeilen entfernt |
| 4 | Spaltennamen ohne Leerzeichen: 'gehört zu' → 'gehört_zu' |
| 5 | Fehlende Werte ('–', '-', '—') vereinheitlicht zu leerem String |
| 6 | Trailing-Spalte 141 (leere Duplikatspalte) entfernt |
| 7 | Neue Spalte 'Zeilentyp' ergänzt: Wahlkreis / Bundesland / Bundesgebiet |
| 8 | Alle Werte getrimmt (keine führenden/nachfolgenden Leerzeichen) |
| 9 | Keine Duplikate in 'Nr' gefunden |
| 10 | Kein Bundesgebiet-Row mehr (Nr=99) mit fehlenden Pflichtfeldern – korrekt leer bei 'gehört_zu' |