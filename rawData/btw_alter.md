# Codebuch: Datensatz_Bundestagswahl_Alter_bereinigt.csv

**Quelle:** Bundeswahlleiter / GESIS / Forschungsgruppe Wahlen (repräsentative Wahlstatistik)  
**Inhalt:** Wahlbeteiligung und Zweitstimmenverteilung nach Altersgruppen, Bundestagswahlen 2002–2025  
**Bereinigt am:** 2026-06-09  
**Encoding:** UTF-8  
**Trennzeichen:** Komma (,)  
**Dezimaltrennzeichen:** Punkt (.)  
**Zeilen:** 50  
**Spalten:** 11  

---

## Bereinigungsprotokoll

| Schritt | Befund | Maßnahme |
|---------|--------|----------|
| Encoding | ASCII/UTF-8 – kein Problem | Unverändert, Ausgabe als UTF-8 |
| Header | Einzeilig, klar strukturiert | Einheiten aus Spaltennamen in Variablennamen kodiert (`_Pct`) |
| Kommentarzeilen | Keine vorhanden | – |
| Leere Zeilen | Keine vorhanden | – |
| Duplikate | Keine (Jahr+Alter eindeutig) | – |
| Typen | `Jahr` int64, alle Zahlenspalten float64, korrekt | Keine Korrekturen nötig |
| Dezimaltrenner | Originalformat `;`-CSV mit `,` als Dezimal | Beim Einlesen korrekt behandelt, Ausgabe mit `.` |
| `AfD` = 0 vor 2013 | AfD existierte vor 2013 nicht → 0 ist inhaltlich falsch | **0 → NaN** (18 Werte, Jahre 2002–2009) |
| `DIE LINKE` = 0 in 2002 | DIE LINKE als Partei gegründet 2007; 2002 kein Antritt | **0 → NaN** (6 Werte, Jahr 2002) |
| Altersgruppen-Überschneidung | Ab 2013: `60 und mehr` + `60 bis 69` + `70 und mehr` parallel | Neue Spalte `Altersgruppen_Typ` zur Kennzeichnung ergänzt |
| Wertebereiche | Parteiprozentwerte 0–100 ✓, keine Negativwerte ✓, Wahlbeteiligung 57–84 % ✓ | – |
| Spaltennamen | Keine Einheit im Namen, `DIE LINKE` enthält Leerzeichen | Umbenannt mit Einheit (`_Pct`) und ohne Leerzeichen |
| Parteisummen | Rundungsabweichungen ±0,3 Pp (z. B. 98,7–100,2) | Erwartbar bei gerundeten Prozentzahlen, kein Fehler |
| Rohdaten | Nicht überschrieben | Original-CSV unverändert, Ausgabe als neue Datei |

---

## Spaltenübersicht

| Spaltenname | Typ | Einheit | Beschreibung | Wertebereich |
|-------------|-----|---------|--------------|--------------|
| `Jahr` | int64 | – | Wahljahr | 2002, 2005, 2009, 2013, 2017, 2021, 2025 |
| `Alter` | str | – | Altersgruppe der Wähler:innen | Siehe Alterskodierung unten |
| `Altersgruppen_Typ` | str | – | Klassifikation der Alterszeile | `Detailgruppe`, `Aggregat_60plus`, `Gesamtdurchschnitt` |
| `Sonstige_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil aller nicht einzeln ausgewiesenen Parteien | 1,2–15,0 |
| `CDU_CSU_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil CDU/CSU | 5,6–50,4 |
| `GRUENE_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil Bündnis 90/Die Grünen | 3,6–35,5 |
| `SPD_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil SPD | 8,7–44,0 |
| `AfD_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil AfD; **NaN vor 2013** (Partei nicht existent) | 3,4–13,9; NaN für 2002–2009 |
| `FDP_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil FDP | 3,8–22,1 |
| `DIELINKE_Zweitstimmen_Pct` | float64 | % | Zweitstimmenanteil DIE LINKE; **NaN in 2002** (Partei trat nicht an) | 3,1–37,1; NaN für 2002 |
| `Wahlbeteiligung_Pct` | float64 | % | Anteil der Wähler:innen an Wahlberechtigten in der jeweiligen Altersgruppe | 57,5–83,6 |

---

## Alterskodierung (`Alter`-Spalte)

| Wert | Bedeutung | Verfügbar ab |
|------|-----------|--------------|
| `18 bis 24` | Erstwähler:innen und junge Erwachsene | 2002 |
| `25 bis 34` | Jüngere Erwachsene | 2002 |
| `35 bis 44` | Mittleres Alter | 2002 |
| `45 bis 59` | Ältere Erwerbstätige | 2002 |
| `60 und mehr` | Alle ab 60 Jahre (Aggregat) | 2002 |
| `60 bis 69` | Jüngere Senior:innen (Untergruppe) | 2013 |
| `70 und mehr` | Ältere Senior:innen (Untergruppe) | 2013 |
| `insgesamt` | Gesamtdurchschnitt über alle Altersgruppen | 2002 |

**Achtung Überschneidung:** Ab 2013 erscheinen `60 und mehr`, `60 bis 69` und `70 und mehr` im selben Jahr. 
`60 und mehr` ist die Aggregatzeile; `60 bis 69` und `70 und mehr` sind Detailgruppen davon.
Für Längsschnittanalysen empfiehlt es sich, entweder nur `60 und mehr` oder nur die Detailgruppen zu verwenden.
Die Spalte `Altersgruppen_Typ` kodiert diese Unterscheidung.

---

## Fehlende Werte (`NaN`) – Übersicht

| Spalte | Anzahl NaN | Betroffen |
|--------|-----------|-----------|
| `AfD_Zweitstimmen_Pct` | 18 | Alle Zeilen der Jahre 2002, 2005, 2009 (AfD erst ab 2013 gegründet) |
| `DIELINKE_Zweitstimmen_Pct` | 6 | Alle Zeilen des Jahres 2002 (DIE LINKE erst 2007 gegründet; 2005: Vorläufer PDS/WASG ausgewiesen) |

---

## Parteisummen-Hinweis

Die Summe aller Parteiprozentwerte je Zeile weicht durch Rundung leicht von 100 % ab (beobachteter Bereich: 98,7–100,2 %). 
Dies ist eine bekannte Eigenschaft gerundeter Prozentzahlen und kein Datenfehler. Ab 2025 fällt die Summe etwas stärker ab (~98,7–99,8 %), 
weil kleinere Parteien durch die gestiegene Fragmentierung in der `Sonstige`-Kategorie weniger vollständig erfasst sind.