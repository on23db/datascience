# Codebuch: Ergebnisse_Bundestagswahl_2013_bereinigt.csv

**Quelle:** Der Bundeswahlleiter, Wiesbaden 2016  
**Wahl:** 18. Deutscher Bundestag, 22. September 2013  
**Bereinigt am:** 2026-06-08  
**Encoding:** UTF-8 (Original: ISO-8859-1)  
**Trennzeichen:** Komma (,)  
**Zeilen:** 316 (299 Wahlkreise + 16 Bundesländer + 1 Bundesgebiet)  
**Spalten:** 121  

---

## Bereinigungsprotokoll

| Schritt | Maßnahme |
|---------|----------|
| Kommentarzeilen entfernt | Zeilen 0–4 (beginnend mit `#`) wurden übersprungen |
| 3-zeiliger Header zusammengeführt | Zeilen 5–7 per Forward-Fill zu einzeiligem Header kombiniert |
| Leere Zeilen entfernt | Trennzeilen zwischen Bundesländerblöcken entfernt |
| Trailing-Spalte entfernt | Letzte Spalte war durchgehend leer (Artefakt des abschließenden Semikolons) |
| 39 komplett leere Spalten entfernt | Vorperioden-Spalten neuer Parteien (AfD, BIG etc.) sowie strukturell leere Spalten |
| Spalte `Gebietstyp` ergänzt | Kodiert: `Wahlkreis`, `Bundesland`, `Bundesgebiet` |
| `gehört_zu` für Bundesgebiet (999) | Leerstring → `0` (kein übergeordnetes Gebiet) |
| Numerische Spalten typisiert | Alle Stimmzahlspalten als `Int64` (nullable integer), leer → `NA` |
| Encoding | ISO-8859-1 → UTF-8 |
| Rohdaten unverändert | Original-CSV nicht überschrieben |

---

## Spaltenübersicht

### Identifikationsspalten

| Spaltenname | Typ | Beschreibung | Wertebereich |
|-------------|-----|--------------|--------------|
| `Nr` | int | Wahlkreisnummer bzw. Gebietscode | 1–299 (Wahlkreise), 901–916 (Bundesländer), 999 (Bundesgebiet) |
| `Gebiet` | str | Name des Wahlkreises / Bundeslandes | Freitext |
| `Gebietstyp` | str | Ebene des Gebiets | `Wahlkreis`, `Bundesland`, `Bundesgebiet` |
| `gehört_zu` | int | Bundesland-ID des übergeordneten Gebiets | 1–16 (Bundesländer), 0 = Bundesgebiet selbst, 99 = Summenzeile (Bundesland) |

**Bundesland-Schlüssel (`gehört_zu`):**

| Code | Bundesland |
|------|------------|
| 1 | Schleswig-Holstein |
| 2 | Hamburg |
| 3 | Niedersachsen |
| 4 | Bremen |
| 5 | Nordrhein-Westfalen |
| 6 | Hessen |
| 7 | Rheinland-Pfalz |
| 8 | Baden-Württemberg |
| 9 | Bayern |
| 10 | Saarland |
| 11 | Berlin |
| 12 | Brandenburg |
| 13 | Mecklenburg-Vorpommern |
| 14 | Sachsen |
| 15 | Sachsen-Anhalt |
| 16 | Thüringen |
| 99 | Summenwert (Bundesland) |
| 0 | Kein übergeordnetes Gebiet (Bundesgebiet) |

### Daten-Spalten (Stimmzahlen)

Alle Stimmzahlspalten folgen dem Namensschema:

```
{Partei/Kategorie}_{Stimmentyp}_{Zeitraum}
```

**Stimmentyp:** `Erststimmen` | `Zweitstimmen`  
**Zeitraum:** `Endgültig` (BTW 2013) | `Vorperiode` (BTW 2009, sofern vorhanden)  
**Typ:** `Int64` (nullable integer) – fehlende Werte als `NA` (Partei nicht angetreten)  
**Einheit:** Anzahl Stimmen (absolute Zahlen, keine Prozentangaben)  

#### Strukturelle Kategorien

| Spaltenprefix | Beschreibung |
|---------------|--------------|
| `Wahlberechtigte` | Anzahl Wahlberechtigter |
| `Wähler` | Anzahl abgegebener Stimmen |
| `Ungültige` | Ungültige Stimmen |
| `Gültige` | Gültige Stimmen |

#### Parteien

| Partei/Gruppe | Vollname / Anmerkung |
|---------------|----------------------|
| `CDU` | Christlich Demokratische Union Deutschlands |
| `SPD` | Sozialdemokratische Partei Deutschlands |
| `FDP` | Freie Demokratische Partei |
| `DIE LINKE` | Die Linke |
| `GRÜNE` | Bündnis 90/Die Grünen |
| `CSU` | Christlich-Soziale Union in Bayern (nur Bayern) |
| `PIRATEN` | Piratenpartei Deutschland |
| `NPD` | Nationaldemokratische Partei Deutschlands |
| `Tierschutzpartei` | Partei Mensch Umwelt Tierschutz |
| `REP` | Die Republikaner |
| `ÖDP` | Ökologisch-Demokratische Partei |
| `FAMILIE` | Familien-Partei Deutschlands |
| `Bündnis 21/RRP` | Bündnis 21/RRP |
| `RENTNER` | Rentner-Partei Deutschland |
| `BP` | Bayernpartei |
| `PBC` | Partei Bibeltreuer Christen |
| `BüSo` | Bürgerrechtsbewegung Solidarität |
| `DIE VIOLETTEN` | DIE VIOLETTEN – für spirituelle Politik |
| `MLPD` | Marxistisch-Leninistische Partei Deutschlands |
| `Volksabstimmung` | Ab jetzt … Bündnis für Deutschland (Volksabstimmung) |
| `PSG` | Partei für Soziale Gleichheit |
| `AfD` | Alternative für Deutschland (erstmals 2013) |
| `BIG` | Bündnis für Innovation & Gerechtigkeit |
| `pro Deutschland` | Bürgerbewegung pro Deutschland |
| `DIE RECHTE` | Die Rechte |
| `DIE FRAUEN` | Feministische Partei DIE FRAUEN |
| `FREIE WÄHLER` | Freie Wähler |
| `Nichtwähler` | Nichtwählerpartei |
| `PARTEI DER VERNUNFT` | Partei der Vernunft |
| `Die PARTEI` | Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative |
| `B` | Basisdemokratische Partei Deutschland |
| `BGD` | Bund für Gesamtdeutschland |
| `DKP` | Deutsche Kommunistische Partei |
| `NEIN!` | NEIN! – Neue Europäische Idee |
| `Übrige` | Sonstige Parteien (Sammelkategorie) |

---

## Hinweise zu fehlenden Werten (`NA`)

- `NA` bedeutet: Partei war in diesem Wahlkreis **nicht angetreten** oder hat in der jeweiligen Wahlperiode nicht kandidiert.
- Vorperioden-Spalten (BTW 2009) fehlen für Parteien, die 2009 noch nicht existierten (z. B. AfD, BIG, Die RECHTE).
- CSU-Spalten sind nur für bayerische Wahlkreise (Bundesland 9) befüllt.
- CDU-Spalten sind in Bayern (`gehört_zu == 9`) leer (dort kandidiert die CSU).

---

## Entfernte Spalten (Protokoll)

Folgende 40 Spalten wurden entfernt, da sie in allen 316 Zeilen leer waren:

- `Wahlberechtigte_Zweitstimmen_Endgültig`
- `Wahlberechtigte_Zweitstimmen_Vorperiode`
- `Wähler_Zweitstimmen_Endgültig`
- `Wähler_Zweitstimmen_Vorperiode`
- `RENTNER_Erststimmen_Vorperiode`
- `PSG_Erststimmen_Endgültig`
- `PSG_Erststimmen_Vorperiode`
- `AfD_Erststimmen_Vorperiode`
- `AfD_Zweitstimmen_Vorperiode`
- `BIG_Erststimmen_Vorperiode`
- `BIG_Zweitstimmen_Vorperiode`
- `pro Deutschland_Erststimmen_Vorperiode`
- `pro Deutschland_Zweitstimmen_Vorperiode`
- `DIE RECHTE_Erststimmen_Endgültig`
- `DIE RECHTE_Erststimmen_Vorperiode`
- `DIE RECHTE_Zweitstimmen_Vorperiode`
- `DIE FRAUEN_Erststimmen_Endgültig`
- `DIE FRAUEN_Erststimmen_Vorperiode`
- `DIE FRAUEN_Zweitstimmen_Vorperiode`
- `FREIE WÄHLER_Erststimmen_Vorperiode`
- `FREIE WÄHLER_Zweitstimmen_Vorperiode`
- `Nichtwähler_Erststimmen_Endgültig`
- `Nichtwähler_Erststimmen_Vorperiode`
- `Nichtwähler_Zweitstimmen_Vorperiode`
- `PARTEI DER VERNUNFT_Erststimmen_Vorperiode`
- `PARTEI DER VERNUNFT_Zweitstimmen_Vorperiode`
- `Die PARTEI_Erststimmen_Vorperiode`
- `Die PARTEI_Zweitstimmen_Vorperiode`
- `B_Erststimmen_Vorperiode`
- `B_Zweitstimmen_Endgültig`
- `B_Zweitstimmen_Vorperiode`
- `BGD_Erststimmen_Vorperiode`
- `BGD_Zweitstimmen_Endgültig`
- `BGD_Zweitstimmen_Vorperiode`
- `DKP_Zweitstimmen_Endgültig`
- `NEIN!_Erststimmen_Vorperiode`
- `NEIN!_Zweitstimmen_Endgültig`
- `NEIN!_Zweitstimmen_Vorperiode`
- `Übrige_Zweitstimmen_Endgültig`
- `Übrige_Zweitstimmen`