# Codebuch – Bundestagswahl_2009_bereinigt.csv
# Bundestagswahl 2009 – Endgültige Ergebnisse (Wahlkreise, Bundesländer, Bundesgebiet)

## Allgemein
- Quelle: Der Bundeswahlleiter, Wiesbaden 2016
- Originaldatei: `Ergebnisse_Bundestagswahl_2009.csv`
- Trenner: Semikolon (;)
- Kodierung: UTF-8
- Fehlende Werte: leere Zeichenkette ('') – bedeutet: Partei trat in diesem Gebiet nicht an oder Wert nicht verfügbar
- Original hatte 3-zeiligen Header + Encoding ISO-8859-1 → zu einzeiligem UTF-8-Header zusammengeführt
- Vorperioden-Spalten (Vergleichswerte BTW 2005) wurden entfernt; nur Endgültig-Werte behalten
- Leere Trennzeilen und Kommentarzeilen wurden entfernt
- Zeilenanzahl: 316 (299 Wahlkreise + 16 Bundesland-Summen + 1 Bundesgebiet)

## Kompatibilität mit BTW2025_bereinigt.csv
Dieser Datensatz verwendet dasselbe Spaltennamenschema, dieselben Metadaten-Spalten und
dieselben Wertelisten wie BTW2025_bereinigt.csv und kann direkt mit `pd.concat` oder JOIN
über `Nr`/`gehört_zu` zusammengeführt werden.

## Spalten (Metadaten)

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| Nr | String | Wahlkreisnummer (001–299), Bundesland-Code (01–16) oder '99' (Bundesgebiet) |
| Gebiet | String | Name des Wahlkreises, Bundeslandes oder 'Bund' |
| gehört_zu | String | Bundesland-Code (01–16) des übergeordneten Bundeslandes; leer bei Bundesgebiet (Nr=99) |
| Zeilentyp | String | 'Wahlkreis' / 'Bundesland' / 'Bundesgebiet' |
| Direktmandat_Gewinner | String | Leer (für 2009 nicht im Datensatz enthalten; Spalte nur für Kompatibilität mit 2025) |
| Land | String | 2-Buchstaben-Kürzel des Bundeslandes (SH, HH, … BY, Bund); Hilfsspalte zusätzlich zu gehört_zu |

## Bundesland-Codes (gehört_zu) – identisch mit BTW2025

| Code | Bundesland |
|------|-----------|
| 01 | Schleswig-Holstein (SH) |
| 02 | Hamburg (HH) |
| 03 | Niedersachsen (NI) |
| 04 | Bremen (HB) |
| 05 | Nordrhein-Westfalen (NW) |
| 06 | Hessen (HE) |
| 07 | Rheinland-Pfalz (RP) |
| 08 | Baden-Württemberg (BW) |
| 09 | Bayern (BY) |
| 10 | Saarland (SL) |
| 11 | Berlin (BE) |
| 12 | Brandenburg (BB) |
| 13 | Mecklenburg-Vorpommern (MV) |
| 14 | Sachsen (SN) |
| 15 | Sachsen-Anhalt (ST) |
| 16 | Thüringen (TH) |

## Spalten (Stimmdaten) – Namensschema

Alle weiteren Spalten folgen dem Muster:
  `<Kategorie>_<Stimmenart>_<Periode>`

- `<Kategorie>`: z.B. 'Wahlberechtigte', 'Wählende', 'Ungültige Stimmen', 'Gültige Stimmen', Parteiname
- `<Stimmenart>`: 'Erststimmen' (Direktkandidat) oder 'Zweitstimmen' (Partei)
- `<Periode>`: 'Endgültig' (BTW 2009) – Vorperiodenwerte (BTW 2005) wurden entfernt
- Alle Werte: Integer (absolute Stimmen/Berechtigte), leer = nicht verfügbar / nicht angetreten

## Parteien (Stimmspalten)

| Kürzel | Vollname | Anmerkung |
|--------|----------|-----------|
| SPD | Sozialdemokratische Partei Deutschlands | |
| CDU | Christlich Demokratische Union Deutschlands | Leer in BY (strukturell) |
| FDP | Freie Demokratische Partei | |
| LINKE | Die Linke | In 2 NRW-Wahlkreisen leer (keine Direktkandidatur) |
| GRÜNE | BÜNDNIS 90/DIE GRÜNEN | In 3 Wahlkreisen leer (keine Direktkandidatur) |
| CSU | Christlich-Soziale Union in Bayern e.V. | Leer außerhalb BY (strukturell) |
| Sonstige | Summe aller nicht einzeln ausgewiesenen Parteien | Enthält u.a. NPD, PIRATEN, REP, ödp, DVU, FW u.v.m. |
| NPD | Nationaldemokratische Partei Deutschlands | Teilmenge von Sonstige; in einigen WK leer (keine Kandidatur) |
| PIRATEN | Piratenpartei Deutschland | Teilmenge von Sonstige; 2009 sehr geringe Kandidaturdichte (296 von 316 Zeilen leer bei Erststimmen) |

### Nicht im Datensatz vorhanden (existierten 2009 noch nicht):
- AfD (Gründung 2013)
- BSW (Gründung 2023)
- FW als eigenständige Bundespartei (2009 unter Sonstige)

## Strukturelle Fehlwerte ('') – Protokoll

| Spalte | Betroffen | Begründung |
|--------|-----------|------------|
| CDU_Erststimmen_Endgültig, CDU_Zweitstimmen_Endgültig | Land BY (46 Zeilen) | Bayern hat keine CDU-Kandidaten; Stimmen stehen in CSU |
| CSU_Erststimmen_Endgültig, CSU_Zweitstimmen_Endgültig | Alle Länder außer BY (270 Zeilen) | CSU kandidiert ausschließlich in Bayern |
| LINKE_Erststimmen_Endgültig | 2 Wahlkreise in NW (WK 124, 142) | Keine Direktkandidatur |
| GRÜNE_Erststimmen_Endgültig | 3 Wahlkreise | Keine Direktkandidatur |
| NPD_Erststimmen_Endgültig | Diverse Wahlkreise | Keine Direktkandidatur |
| PIRATEN_Erststimmen_Endgültig | 296 von 316 Zeilen | 2009 sehr geringe Direktkandidaturdichte |
| PIRATEN_Zweitstimmen_Endgültig | 17 Zeilen | Keine Landesliste in einzelnen Bundesländern |
| Direktmandat_Gewinner | Alle Zeilen | Für 2009 nicht im Datensatz enthalten |
| gehört_zu | Bundesgebiet-Zeile (Nr=99) | Kein übergeordnetes Bundesland |

## Bereinigungsprotokoll

| Schritt | Aktion |
|---------|--------|
| 1 | Encoding von ISO-8859-1 → UTF-8 konvertiert |
| 2 | 5 Kommentarzeilen (beginnend mit #) entfernt |
| 3 | 3-zeiligen Header zu einzeiligem Header zusammengeführt (Forward-Fill + Konkatenation) |
| 4 | 16 Leer-/Trennzeilen entfernt |
| 5 | 66 Vorperioden-Spalten (BTW-2005-Vergleichswerte) entfernt; nur Endgültig-Spalten behalten |
| 6 | Strukturell leere Spalten entfernt: Wahlberechtigte_Zweit, Wähler_Zweit (in Quelle nicht ausgewiesen) |
| 7 | 23 Kleinparteien zu Sonstige_Erst/Sonstige_Zweit aggregiert; NPD und PIRATEN zusätzlich einzeln behalten |
| 8 | Spaltennamenschema an BTW2025 angeglichen: {Partei}_{Erst\|Zweit} → {Partei}_{Erststimmen\|Zweitstimmen}_Endgültig |
| 9 | DIE_LINKE → LINKE (Parteikürzel an BTW2025 angeglichen) |
| 10 | Wähler → Wählende (Bezeichnung an BTW2025 angeglichen) |
| 11 | Nr-Format angeglichen: Integer → String mit führenden Nullen (001–299 / 01–16 / 99) |
| 12 | Zeilentyp-Wert 'Bund' → 'Bundesgebiet' (an BTW2025 angeglichen) |
| 13 | Spalte gehört_zu ergänzt: numerischer Bundesland-Code (01–16), leer bei Bundesgebiet |
| 14 | Spalte Direktmandat_Gewinner ergänzt (leer; nur für strukturelle Kompatibilität mit BTW2025) |
| 15 | Gebietsnamen bereinigt: Anführungszeichen entfernt |
| 16 | Alle NaN-Werte → leere Zeichenkette '' (konsistent mit BTW2025) |
| 17 | Rohdaten nicht verändert |

## Hinweise für übergreifende Analysen mit BTW2025_bereinigt.csv

| Merkmal | BTW 2009 | BTW 2025 |
|---------|----------|----------|
| Spaltennamenschema | Identisch | Identisch |
| Nr-Format | Identisch | Identisch |
| gehört_zu-Codes | Identisch | Identisch |
| Zeilentyp-Werte | Identisch | Identisch |
| Fehlende Werte | Identisch ('') | Identisch ('') |
| AfD | Nicht vorhanden (Gründung 2013) | Vorhanden |
| BSW | Nicht vorhanden (Gründung 2023) | Vorhanden |
| FW | In Sonstige enthalten | Eigenständige Spalte |
| Direktmandat_Gewinner | Leer (nicht verfügbar) | Befüllt |
| Land-Hilfsspalte | Zusätzlich vorhanden | Nicht vorhanden |
