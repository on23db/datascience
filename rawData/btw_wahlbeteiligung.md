# Codebuch – BTW_Wahlbeteiligung_Geschlecht_bereinigt.csv

Wahlbeteiligung und Zweitstimmenverteilung nach Geschlecht · Bundestagswahlen 2002–2025

---

## 1. Allgemeine Beschreibung

Die Datei enthält Daten zur **Wahlbeteiligung** und zur **Zweitstimmenverteilung** bei den Bundestagswahlen 2002–2025, jeweils aufgeschlüsselt nach **Geschlecht**. Die Werte basieren auf der repräsentativen Wahlstatistik des Bundeswahlleiters und sind als **Prozentwerte** angegeben. Die Daten decken alle sieben Bundestagswahlen im Zeitraum ab.

| Eigenschaft | Wert |
|---|---|
| Dateiname | BTW_Wahlbeteiligung_Geschlecht_bereinigt.csv |
| Trennzeichen | Semikolon (`;`) |
| Zeichenkodierung | UTF-8 mit BOM (utf-8-sig) |
| Zeilen gesamt | 21 (inkl. Kopfzeile: 22) |
| Spalten gesamt | 11 |
| Zeitraum | Bundestagswahlen 2002, 2005, 2009, 2013, 2017, 2021, 2025 |
| Datenart | Prozentwerte (repräsentative Wahlstatistik) |
| Quelle | Bundeswahlleiter – Repräsentative Wahlstatistik |

---

## 2. Spaltenstruktur

### 2.1 Klassifikationsspalten (Spalten 1–2)

Jede Zeile ist eindeutig durch die Kombination `Jahr × Geschlecht` bestimmt. Pro Wahljahr gibt es drei Zeilen (insgesamt, weiblich, männlich).

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `Jahr` | Integer | Wahljahr. Mögliche Werte: `2002`, `2005`, `2009`, `2013`, `2017`, `2021`, `2025`. |
| `Geschlecht` | Text | Geschlechtsausprägung. Mögliche Werte: `insgesamt`, `weiblich`, `maennlich`. |

### 2.2 Ergebnisspaltenn (Spalten 3–11)

Alle Werte sind **Prozentwerte** mit einer Nachkommastelle. Dezimaltrennzeichen ist der Punkt (`.`).

| Spaltenname | Beschreibung |
|---|---|
| `Wahlbeteiligung` | Anteil der Wählenden an den Wahlberechtigten in Prozent. |
| `CDU` | Zweitstimmenanteil der Christlich Demokratischen Union Deutschlands in Prozent. Enthält nicht die CSU (Bayern). |
| `SPD` | Zweitstimmenanteil der Sozialdemokratischen Partei Deutschlands in Prozent. |
| `GRUENE` | Zweitstimmenanteil von BÜNDNIS 90/DIE GRÜNEN in Prozent. |
| `FDP` | Zweitstimmenanteil der Freien Demokratischen Partei in Prozent. |
| `DIE_LINKE` | Zweitstimmenanteil von DIE LINKE in Prozent. Erst ab 2005 ausgewiesen (vorher PDS, nicht separat erfasst). Leer für 2002. |
| `AfD` | Zweitstimmenanteil der Alternative für Deutschland in Prozent. Erst ab 2013 ausgewiesen. Leer für 2002–2009. |
| `BSW` | Zweitstimmenanteil des Bündnis Sahra Wagenknecht in Prozent. Erst ab 2025 ausgewiesen. Leer für 2002–2021. |
| `Sonstige` | Summe der Zweitstimmenanteile aller übrigen Parteien und Gruppierungen in Prozent. |

**Hinweis zur CDU/CSU:** Die Werte für `CDU` und (implizit im Unionsanteil) `CSU` sind in dieser Datei nicht zusammengefasst. Die CSU hat keinen eigenen Spalteneintrag; ihr Stimmenanteil ist im bundesweiten `CDU`-Wert rechnerisch enthalten (da die Datei bundesweite Gesamtwerte ausweist und CDU+CSU als Unionsblock gezählt werden).

---

## 3. Wertebereich und Vollständigkeit

| Spalte | Erste Wahl | Fehlende Werte | Grund |
|---|---|---|---|
| `Wahlbeteiligung` | 2002 | Keine | Durchgängig erfasst |
| `CDU` | 2002 | Keine | Durchgängig erfasst |
| `SPD` | 2002 | Keine | Durchgängig erfasst |
| `GRUENE` | 2002 | Keine | Durchgängig erfasst |
| `FDP` | 2002 | Keine | Durchgängig erfasst |
| `DIE_LINKE` | 2005 | 3 (Jahr 2002) | Partei unter diesem Namen erst ab 2005 |
| `AfD` | 2013 | 9 (Jahre 2002–2009) | Partei gegründet 2013 |
| `BSW` | 2025 | 18 (Jahre 2002–2021) | Partei gegründet 2024 |
| `Sonstige` | 2002 | Keine | Durchgängig erfasst |

Fehlende Werte sind als leere Zellen dargestellt. In der Originaldatei waren diese als `0` kodiert, was inhaltlich irreführend wäre (die Parteien existierten noch nicht).

---

## 4. Bereinigungsschritte

Die Originaldatei wurde wie folgt bereinigt:

1. **Dezimaltrennzeichen** von Komma (`,`) auf Punkt (`.`) umgestellt (europäische → internationale Konvention)
2. **Spaltennamen** vereinheitlicht: `GRUENE` statt `GRUENE`, `DIE_LINKE` statt `DIE LINKE` (Leerzeichen entfernt), `Sonstige` statt `sonstige` (Großschreibung)
3. **Spaltenreihenfolge** logisch neu sortiert: Klassifikationsspalten zuerst, dann `Wahlbeteiligung`, dann Parteien chronologisch nach Gründungsjahr, zuletzt `Sonstige`
4. **Nullwerte** für nicht-existente Parteien durch leere Zellen ersetzt (`DIE_LINKE` vor 2005, `AfD` vor 2013, `BSW` vor 2025)

---

## 5. Abgrenzung zu anderen Datensätzen

| Merkmal | Diese Datei | Ergebnisdateien (BTW 2017/2021/2025) | Alter-&-Geschlecht-Datei |
|---|---|---|---|
| Geografische Ebene | Bund gesamt | Wahlkreis / Land / Bund | Bund / Land |
| Zeitreihe | 2002–2025 (7 Wahlen) | Einzelne Wahl + Vorperiode | Einzelne Wahl |
| Aufschlüsselung | Geschlecht | Gebietseinheit | Geschlecht × Altersgruppe |
| Einheit | Prozentwerte | Absolute Stimmzahlen | Absolute Stimmzahlen (Stichprobe) |
| Parteientiefe | 8 Parteien + Sonstige | Alle angetretenen Parteien | 8 Parteien + Sonstige |

---

*Quelle: Bundeswahlleiter, www.bundeswahlleiter.de*
