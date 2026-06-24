# Codebuch – ZA8974_bereinigt.csv

GLES Rolling Cross-Section 2025 · German Longitudinal Election Study  
Bundestagswahl 2025

---

## 1. Allgemeine Beschreibung

Die Datei enthält Daten der **GLES Rolling Cross-Section 2025** (German Longitudinal Election Study), Studie ZA8974. Bei der Rolling Cross-Section handelt es sich um ein Erhebungsdesign, bei dem über den gesamten Erhebungszeitraum hinweg täglich neue Zufallsstichproben der Wahlberechtigten befragt werden. Dadurch lassen sich Meinungsveränderungen im Zeitverlauf des Wahlkampfs analysieren.

Die Originaldatei wurde vom GESIS Datenarchiv (Leibniz-Institut für Sozialwissenschaften) bereitgestellt.

| Eigenschaft | Wert |
|---|---|
| Dateiname (bereinigt) | ZA8974_bereinigt.csv |
| Originaldateiname | Kopie_von_ZA8974_v1-0-0.csv |
| GESIS-Studiennummer | ZA8974 |
| Version | v1.0.0 (2025-08-01) |
| DOI | https://doi.org/10.4232/1.14517 |
| Trennzeichen | Semikolon (`;`) |
| Zeichenkodierung | UTF-8 mit BOM (utf-8-sig) |
| Zeilen gesamt | 29.117 (inkl. Kopfzeile: 29.118) |
| Spalten gesamt | 272 |
| Erhebungszeitraum | 2024–2025 (Kalenderwochen 2–51) |
| Erhebungsmethode | CAWI (Computer Assisted Web Interview) und CAPI |
| Grundgesamtheit | Wahlberechtigte in Deutschland |

---

## 2. Bereinigungsschritte

Gegenüber der Originaldatei wurden folgende Änderungen vorgenommen:

1. **Konstante Metaspalten entfernt**: `za_nr` (immer `8974`), `version` (immer `v1.0.0, 2025-08-01`) und `doi` (immer `https://doi.org/10.4232/1.14517`) wurden entfernt, da sie in jeder Zeile identisch sind und keine analyserelev​ante Information tragen. Die Werte sind im Codebuch dokumentiert.
2. **Dezimalgewichte korrigiert**: `pwght` und `dwght` lagen im deutschen Dezimalformat vor (Komma als Trennzeichen, z. B. `,38` oder `1,04`). Diese wurden in das internationale Format mit Dezimalpunkt umgewandelt (z. B. `0.38`, `1.04`).

Alle inhaltlichen Variablen (`v1`–`v191`) sowie die Missings-Kodierung wurden **unverändert** übernommen.

---

## 3. Technische Administrationsvariablen (Spalten 1–7)

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `respid` | Integer | Eindeutige Befragten-ID. Wertebereich: 20001–511597. |
| `sample` | Integer | Stichprobenkennzeichnung. `1` = Hauptstichprobe Vorwahlbefragung, `2` = Auffrischungsstichprobe, `3` = Nachwahl-Ergänzung. |
| `mode` | Integer | Erhebungsmodus. `1` = CAPI (persönlich-mündlich), `2` = CAWI (online). |
| `intmonth` | Integer | Interviewmonat (1–12). |
| `intweek` | Integer | Interviewwoche als ISO-Kalenderwoche. Werte: 2, 5, 8, 10, 12, 15, 17, 20, 24, 26, 28, 33, 36, 39, 42, 45, 47, 49, 51. |
| `pwght` | Float | Personengewicht (probability weight). Korrigiert für unterschiedliche Auswahlwahrscheinlichkeiten. Wertebereich: ca. 0.25–4.27. |
| `dwght` | Float | Designgewicht. Für die meisten Befragten identisch mit `pwght`. Wertebereich: ca. 0.25–4.27. |

---

## 4. Inhaltliche Variablen (v1–v191)

Die Variablen `v1`–`v191` enthalten die eigentlichen Umfrageinhalte. Da das vollständige GLES-Codebuch mit allen Fragentexten und Antwortkategorien über den Umfang dieses Dokuments hinausgeht, werden hier Struktur, Namenskonventionen und thematische Blöcke dokumentiert. Das offizielle Codebuch mit allen Fragentexten ist über den DOI abrufbar: **https://doi.org/10.4232/1.14517**

### 4.1 Variablennamen-Konventionen

| Muster | Bedeutung | Beispiele |
|---|---|---|
| `vN` | Einfache Variable (eine Frage, eine Antwort) | `v1`, `v24`, `v100` |
| `vN_K` | Item K einer Itembatterie zu Frage N | `v16_1`–`v16_9`, `v20_1`–`v20_32` |

Variablen mit gleichem Präfix (z. B. alle `v20_*`) gehören zur selben Frage und sollten gemeinsam ausgewertet werden.

### 4.2 Thematische Blöcke (grobe Übersicht)

| Variablen | Themenbereich |
|---|---|
| `v1`–`v3` | Erhebungszeitpunkt, Interviewdauer, Gesprächsverlauf |
| `v4`–`v15` | Wahlabsicht, Parteiidentifikation, Kanzlerpräferenz |
| `v16_1`–`v16_9` | Wichtigkeit politischer Themen (Itembatterie) |
| `v17_1`–`v17_6` | Problemlösungskompetenz der Parteien |
| `v18_1`–`v18_8` | Bewertung von Spitzenkandidaten |
| `v19_1`–`v19_4` | Links-Rechts-Selbsteinstufung und Parteieinstufungen |
| `v20_1`–`v20_32` | Politische Einstellungen / Sachfragen (Itembatterie) |
| `v21_1`–`v21_13` | Institutionenvertrauen |
| `v22_1`–`v22_3` | Demokratiezufriedenheit |
| `v23_1`–`v23_7` | Mediennutzung |
| `v24`–`v50` | Wahlverhalten, Nachwahlbefragung, Stimmabgabe |
| `v51`–`v100` | Politische Einstellungen, Wertorientierungen |
| `v101`–`v150` | Soziale und wirtschaftliche Einstellungen |
| `v151`–`v180` | Weitere thematische Blöcke (je nach Erhebungswelle) |
| `v181`–`v191` | Soziodemografie (Geschlecht, Alter, Bildung, Beruf, Region) |

### 4.3 Soziodemografische Variablen am Ende (v181–v191)

Die letzten Variablen enthalten Soziodemografika der Befragten. Genaue Fragentexte und Antwortkategorien sind dem offiziellen Codebuch zu entnehmen; typische Inhalte in GLES-Studien sind Geschlecht, Geburtsjahr bzw. Altersgruppe, Schulabschluss, Erwerbsstatus, Haushaltsgröße und Bundesland.

---

## 5. Fehlende Werte (Missings-Kodierung)

GLES-Datensätze verwenden ein differenziertes System negativer Codes für fehlende Werte. Diese Codes sind **keine inhaltlichen Antworten** und müssen vor jeder Analyse als „fehlend" behandelt werden.

| Code | Bedeutung |
|---|---|
| `-85` | Nicht erhoben (Item nicht in dieser Erhebungswelle enthalten) |
| `-86` | Nicht erhoben (Split-Ballot: andere Fragebogenversion) |
| `-94` | Nicht zutreffend / Filterfrage nicht erfüllt (kein Gültigkeitsbereich) |
| `-95` | Frage nicht gestellt (Routing / Filterführung) |
| `-97` | Verweigert |
| `-98` | Weiß nicht / keine Angabe |
| `-99` | Item nicht beantwortet (fehlender Wert ohne nähere Spezifikation) |

**Hinweis zu `-94` und `-95`:** `-94` bedeutet in der Regel, dass die Frage aufgrund einer Filterbedingung für diese Person nicht relevant war (z. B. Nachwahlfragen nur für tatsächlich Wählende). `-95` steht für Fragen, die in der jeweiligen Erhebungswelle gar nicht gestellt wurden.

---

## 6. Gewichtung

Die Datei enthält zwei Gewichtungsvariablen:

| Variable | Verwendung |
|---|---|
| `pwght` | **Personengewicht** – empfohlen für Auswertungen, die die Wahlberechtigten-Population repräsentieren sollen. Korrigiert ungleiche Auswahlwahrscheinlichkeiten und Ausfälle. |
| `dwght` | **Designgewicht** – berücksichtigt nur das Stichprobendesign, ohne Kalibrierung auf externe Strukturmerkmale. |

Für die meisten Analysen sollte `pwght` verwendet werden. Bei der Rolling Cross-Section sollte zusätzlich `intweek` als Zeitvariable berücksichtigt werden. Die Gewichte wurden in der Bereinigung vom deutschen Dezimalformat (Komma) in das internationale Format (Punkt) umgestellt.

---

## 7. Originaldatei-Metadaten (entfernte Spalten)

Die folgenden Spalten wurden aus der Originaldatei entfernt, da sie in jeder Zeile identische Werte haben:

| Spalte | Wert | Bedeutung |
|---|---|---|
| `za_nr` | `8974` | GESIS-Studiennummer |
| `version` | `v1.0.0, 2025-08-01` | Datensatzversion und Veröffentlichungsdatum |
| `doi` | `https://doi.org/10.4232/1.14517` | Persistenter Identifikator für Zitation und Nachnutzung |

---

## 8. Zitation

Bei Verwendung dieser Daten ist folgende Quellenangabe zu verwenden (gemäß GESIS-Nutzungsbedingungen):

> GLES (2025): German Longitudinal Election Study – Rolling Cross-Section with Pre- and Post-Election Surveys, BTW 2025. GESIS, Köln. ZA8974, Version 1.0.0. https://doi.org/10.4232/1.14517

---

*Quelle: GESIS – Leibniz-Institut für Sozialwissenschaften, www.gesis.org*
