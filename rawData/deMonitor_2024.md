# Codebuch – ZA8920_Deutschland_Monitor_2024_bereinigt.csv

Deutschland Monitor 2024 · GESIS ZA8920  
Demokratie, gesellschaftliche Einstellungen und politische Partizipation

---

## 1. Allgemeine Beschreibung

Die Datei enthält Daten des **Deutschland Monitors 2024**, einer repräsentativen Bevölkerungsbefragung zu demokratischen Einstellungen, politischem Vertrauen, sozialen Normen und gesellschaftlicher Partizipation in Deutschland. Die Studie wird vom GESIS – Leibniz-Institut für Sozialwissenschaften durchgeführt und ist Teil des GESIS Panel-Programms.

| Eigenschaft | Wert |
|---|---|
| Dateiname (bereinigt) | ZA8920_Deutschland_Monitor_2024_bereinigt.csv |
| Originaldateiname | Kopie_von_ZA8920_v1-0-0_de.csv |
| GESIS-Studiennummer | ZA8920 |
| Version | 1.0.0 (2025-02-18) |
| DOI | doi:10.4232/1.14486 |
| Trennzeichen | Semikolon (`;`) |
| Zeichenkodierung | UTF-8 mit BOM (utf-8-sig) |
| Zeilen gesamt | 3.986 (inkl. Kopfzeile: 3.987) |
| Spalten gesamt | 163 |
| Erhebungsjahr | 2024 |
| Erhebungsmodus | CAWI (online, `mode = 0`) |
| Stichprobe | Basis-Stichprobe (Querschnitt) |
| Grundgesamtheit | Deutschsprachige Bevölkerung ab 18 Jahren in Deutschland |

---

## 2. Bereinigungsschritte

Gegenüber der Originaldatei wurden folgende Änderungen vorgenommen:

1. **6 konstante Metaspalten entfernt**: `za_nr` (`8920`), `version` (`1.0.0 (2025-02-18)`), `doi` (`doi:10.4232/1.14486`), `dataset` (`Basis-Stichprobe`), `year` (`2024`) und `mode` (`0`) – in jeder Zeile identisch. Werte sind im Codebuch dokumentiert.
2. **Dezimaltrennzeichen korrigiert** in 6 Spalten: `pop_index_a`, `pt_index_a`, `soctr_index`, `a_weight`, `d_weight`, `weight_trunc` – vom deutschen Kommaformat (z. B. `,42`) auf internationales Dezimalpunktformat (`0.42`) umgestellt.

Alle inhaltlichen Variablen und die Missings-Kodierung wurden unverändert übernommen.

---

## 3. Administrationsvariablen

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `id` | Integer | Befragten-ID (1–3986). Innerhalb des Datensatzes eindeutig. |
| `frame` | Integer | Stichprobenrahmen. `0` = Adressbasierte Stichprobe (n=2.712), `1` = Online-Access-Panel-Ergänzung (n=1.274). |
| `tel_con` | Integer | Telefonkontaktstatus. `1` = Kontakt hergestellt, `2` = Kontakt versucht, `3` = Kein Kontakt; `-96` = nicht zutreffend. |

---

## 4. Gewichtungsvariablen

| Spaltenname | Typ | Beschreibung |
|---|---|---|
| `a_weight` | Float | Analysegewicht (Hauptgewicht). Korrigiert für Designeffekte und kalibriert auf Strukturmerkmale der Bevölkerung (Geschlecht, Alter, Bildung, Region). Empfohlen für deskriptive Auswertungen. |
| `d_weight` | Float | Designgewicht. Berücksichtigt nur ungleiche Auswahlwahrscheinlichkeiten ohne Kalibrierung. |
| `weight_trunc` | Float | Gekürztes Gewicht (trimmed weight). Extremwerte von `a_weight` wurden auf ein Maximum begrenzt, um Ausreißereinfluss zu reduzieren. |

Für die meisten Analysen wird `a_weight` empfohlen. Dezimaltrennzeichen wurde in der Bereinigung von Komma auf Punkt umgestellt.

---

## 5. Fehlende Werte (Missings-Kodierung)

| Code | Bedeutung |
|---|---|
| `-96` | Nicht zutreffend / Filterführung (Item nicht für diese Person relevant) |
| `-97` | Nicht in dieser Split-Ballot-Version erhoben (andere Fragebogenhälfte) |
| `-98` | Weiß nicht / Keine Angabe |
| `-99` | Fehlender Wert (Item nicht beantwortet) |

`-97` tritt häufig bei Split-Ballot-Designs auf (z. B. `dem_split`, `fair_split`), bei denen nur ein Teil der Befragten eine bestimmte Frageversion erhält.

---

## 6. Inhaltliche Variablen

### 6.1 Überblick thematischer Blöcke

| Präfix / Variable | Themenbereich | Variablen |
|---|---|---|
| `acc01` | Akzeptanz politischer Entscheidungen | 1 |
| `aff01`–`aff03` | Affektive Polarisierung (Sympathie für Parteien/Gruppen) | 3 |
| `co01`–`co06` | Politisches Vertrauen / Compliance (Normbefolgung) | 6 |
| `eva01`–`eva06` | Evaluation politischer Akteure und Institutionen | 6 |
| `lim01`–`lim06` | Einstellungen zu demokratischen Grenzen / Restriktionen | 6 |
| `dem_*` | Demokratiekonzepte und -unterstützung | 8 |
| `dis01`–`dis07` | Politische Diskursorientierung / Diskussionsbereitschaft | 7 |
| `ep01`, `ep05`, `ep06` | Externe politische Efficacy (Responsivität) | 3 |
| `ext04_a`–`ext08`, `ext_index_a`, `ext_cat` | Extremismus-Skala | 6 |
| `fair01`–`fair15` | Wahrnehmung fairer gesellschaftlicher Behandlung | 15 |
| `unfair01`–`unfair15` | Wahrnehmung unfairer Behandlung | 15 |
| `clec`, `freq`, `frse` | Wahlverhalten (Wahlbeteiligung, Wahlhäufigkeit) | 3 |
| `gov01`–`gov08` | Bewertung staatlicher Institutionen / Gouvernanz | 8 |
| `pe01` | Politische Efficacy (intern) | 1 |
| `pi01`, `pi02`, `pint` | Politisches Interesse | 3 |
| `pop01`–`pop09`, `pop_index_a`, `pop_dum` | Populismus-Skala (Items und Index) | 9 + 2 |
| `post_reu_soc`, `pre_reu_soc` | Soziale Wiedervereinigungswahrnehmung (post/pre) | 2 |
| `pp01_a`, `pp05_a`, `pp06`, `pp07` | Parteipräferenz und Parteiidentifikation | 4 |
| `pt01`–`pt08`, `pt_index_a` | Politisches Vertrauen in Institutionen (Index) | 8 + 1 |
| `rile` | Links-Rechts-Selbsteinstufung (0–10) | 1 |
| `soc01`–`soc10` | Soziale Einstellungen (Solidarität, Ungleichheit) | 10 |
| `soctr01`–`soctr03`, `soctr_index` | Soziales Vertrauen (Index) | 3 + 1 |
| `stat01`, `stat02` | Bewertung des gesellschaftlichen Status quo | 2 |

### 6.2 Demokratievariablen (`dem_*`)

| Variable | Beschreibung |
|---|---|
| `dem_split` | Split-Ballot-Kennzeichnung (welche Demokratiefrage-Version). `-97` = andere Version. |
| `dem_const` | Demokratieverständnis: konstitutionelle Dimension |
| `dem_func` | Demokratieverständnis: funktionale Dimension |
| `dem_id` | Demokratieverständnis: identitäre Dimension |
| `dem_const_a` | Aggregierte konstitutionelle Demokratieunterstützung |
| `dem_func_a` | Aggregierte funktionale Demokratieunterstützung |
| `dem_id_a` | Aggregierte identitäre Demokratieunterstützung |
| `dem_cat` | Kategorialer Demokratietyp (Kombination aus obigen Dimensionen) |

### 6.3 Populismus-Index (`pop_index_a`, `pop_dum`)

`pop_index_a` ist ein kontinuierlicher Mittelwertindex über die Items `pop01`–`pop09` (ohne Missings). Wertebereich: 1–5 (höhere Werte = stärker populistische Einstellung). Dezimaltrennzeichen in der Bereinigung korrigiert.

`pop_dum` ist eine dichotome Klassifikation: `1` = populistische Einstellung, `0` = nicht populistisch.

### 6.4 Split-Ballot-Design (`fair_split`)

Die Items `fair01`–`fair15` und `unfair01`–`unfair15` wurden im Split-Ballot-Design erhoben: Jede Befragte/jeder Befragte erhielt entweder die `fair`- oder die `unfair`-Version, nicht beide. Zeilen mit `-97` in diesen Blöcken erhielten die jeweils andere Version.

### 6.5 Links-Rechts-Skala (`rile`)

Selbsteinstufung auf einer Skala von `0` (links) bis `10` (rechts). Wertebereich: 0–10, keine Missings in den Rohdaten.

---

## 7. Soziodemografische Variablen

| Variable | Beschreibung |
|---|---|
| `sex` | Geschlecht. `0` = weiblich, `1` = männlich. |
| `year_birth` | Geburtsjahr (vierstellig). |
| `age` | Altersgruppe (kategorisiert). |
| `age_num` | Alter in Jahren (numerisch). |
| `age_gen` | Altersgruppe als Generation. `1`–`5` (aufsteigend); `-96` = keine Angabe. |
| `educ01` | Schulabschluss (kategorisiert). |
| `educ02` | Berufsausbildung / Hochschulabschluss. |
| `educ03` | Bildungsniveau (kombiniert). |
| `casmin` | CASMIN-Bildungsklassifikation (international vergleichbar). |
| `famstat` | Familienstand. |
| `g_born` | In Deutschland geboren (`0`/`1`). |
| `g_cit` | Deutsche Staatsbürgerschaft (`0`/`1`). |
| `hh_inc` | Haushaltsnettoeinkommen (kategorisiert). |
| `hh_inc_equ` | Äquivalenzeinkommen (bedarfsgewichtet). |
| `hh_size` | Haushaltsgröße (Anzahl Personen). |
| `hh_kids` | Kinder im Haushalt (`0` = nein, `1` = ja). |
| `prof` | Berufsstatus / Erwerbssituation. |
| `religion` | Religionszugehörigkeit. |
| `eastwest` | Wohnregion. `1` = Westdeutschland, `0` = Ostdeutschland. |
| `bbsr` | Siedlungsstrukturtyp nach BBSR-Klassifikation. |
| `bik` | BIK-Stadtregionstyp (Gemeindegröße). |
| `iltis` | Gemeindegrößenklasse (ILTIS-Klassifikation). |
| `t_typ` | Siedlungstyp (weitere Klassifikation). |
| `townsize` | Einwohnerzahl der Gemeinde (kategorisiert). |

---

## 8. Originaldatei-Metadaten (entfernte Spalten)

| Spalte | Wert | Bedeutung |
|---|---|---|
| `za_nr` | `8920` | GESIS-Studiennummer |
| `version` | `1.0.0 (2025-02-18)` | Datensatzversion und Veröffentlichungsdatum |
| `doi` | `doi:10.4232/1.14486` | Persistenter Identifikator für Zitation |
| `dataset` | `Basis-Stichprobe` | Stichprobenbezeichnung |
| `year` | `2024` | Erhebungsjahr |
| `mode` | `0` | Erhebungsmodus (0 = CAWI/online) |

---

## 9. Zitation

> GESIS (2025): Deutschland Monitor 2024. GESIS, Köln. ZA8920, Version 1.0.0. doi:10.4232/1.14486

---

*Quelle: GESIS – Leibniz-Institut für Sozialwissenschaften, www.gesis.org*
