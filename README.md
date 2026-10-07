# Interaktives Lernportal: Gele & Naturstoffe (Chemie Kursstufe Basisfach)

> **Didaktisches Lernlabor: Von der Panna Cotta zur Makromolekülstruktur**  
> Konzipiert für den Einsatz im Basisfach der Kursstufe (Klassen 11/12, Gymnasium Baden-Württemberg, Schule Birklehof).  
> Orientiert am **Bildungsplan 2016 Chemie (Fassung vom 25.03.2022)** und der offiziellen **Jahresplanung für das Basisfach (`Curriculum-BF_G8.md`)**.

---

## 🎯 Didaktisches Konzept & Curriculare Anbindung

Das Thema **3.3.3 Naturstoffe** schlägt im Basisfach der Kursstufe die Brücke zwischen den Grundlagen der organischen Chemie aus Klasse 10 und der Faszination makromolekularer Stoffsysteme in unserem Alltag.

Die offizielle Jahresplanung des Landes Baden-Württemberg (`Curriculum-BF_G8.md`, S. 4 & S. 10) sieht vor:
> *„Der Themenbereich der Naturstoffe, insbesondere der der Kohlenhydrate und Proteine, wird beispielhaft kontextbezogen an Verdickungsmitteln erarbeitet und auch fachlich vertieft.“*

Dieses Lernportal setzt diesen Bildungsplan-Kontext als **dualen Vergleichspfad** um:

```
                          [Panna Cotta Küchenlabor]
                     Rezeptur: Gelatine vs. Iota-Carrageen
                                     │
                        [Sol-Gel-Phänomensimulator]
                         (Kinetik, H-Brücken, Maschen)
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
      [Strang A: Proteine]                        [Strang B: Kohlenhydrate]
   • Aminosäuren & Chiralität                  • Verweis Carrageen (Wikipedia)
   • Zwitterionen-Struktur                     • D-Glucose: Fischer & Haworth
   • Peptidbindung (Kondensation)              • Glykosidische Bindung
   • Primär-, Sekundär-, Tertiärstruktur       • Stärke: Amylose vs. Amylopektin
   • Netzwerkbildung über H-Brücken            • Netzwerkbildung über H-Brücken
             │                                               │
             └───────────────────────┬───────────────────────┘
                                     ▼
                      [Synthese: Molekularer Vergleich]
             Zwei chemisch grundverschiedene Molekülwelten,
             derselbe makroskopische Effekt (Gelbildung)
                                     │
                    [Diagnose & Portfolio-Leistungsnachweis]
                 • Formatives Quiz mit Sofort-Feedback (10 BE)
                 • Klausur-Transferaufgaben (AFB I–III, 15 BE)
                 • Kompetenzraster Bildungsplan 3.3.3
                 • A4-Druckexport für die Lehrkraft
```

---

## 🔬 Interaktive Kernkomponenten

1. **Sol-Gel-Temperaturlabor (HTML5 Canvas Physik):**
   * Dynamische molekulare Partikelsimulation mit stufenlosem Temperaturregler (0 °C bis 90 °C).
   * Veranschaulicht, wie sich flexible Polymerketten beim Abkühlen an Verknüpfungszonen (Junction Zones) zu einem elastischen 3D-Netzwerk verknäulen.
   * Visualisiert das Phänomen der **Hydratisierung**: Anlagerung von Wassermolekülen über Wasserstoffbrücken an polare Gruppen der Ketten (Hydrathülle) sowie mechanisch-elektrostatische Immobilisierung von Wasser in den Hohlräumen der Netz-Struktur.
   * Interaktive viskoelastische Verformung: Beim Ziehen mit der Maus/Touch federt das Gel-Netzwerk elastisch zurück; im flüssigen Sol weichen die gelösten Ketten und das Wasser hydrodynamisch aus.
2. **Peptidbindungs- & Proteinstruktur-Baukasten:**
   * Klick-Interaktion zur Kondensationsreaktion von Glycin und Alanin zu Glycylalanin unter Abspaltung von H₂O.
   * Veranschaulichung des planaren Charakters der Peptidbindung (-CO-NH-).
   * Stufenweiser Struktur-Explorer von der Aminosäuresequenz über α-Helix/β-Faltblatt bis zum globulären Knäuel mit den vier Wechselwirkungen (inkl. London-Dispersionskräften zwischen temporären Dipolen).
   * Eingebettete Schüler-Skizzen und Myoglobin-Abbildung mit Häm-Cofaktor.
   * Erklärung des Kiwi-/Ananas-Phänomens (Proteolyse durch Actinidain/Bromelain).
3. **Glykosidischer Bindungs- & Polysaccharid-Architekt:**
   * Systematischer Strukturvergleich zwischen offenkettiger Fischer-Projektion der D-Glucose (4 Chiralitätszentren) und den ringförmigen Halbacetalen (α- und β-D-Glucopyranose in Haworth-Projektion).
   * Verknüpfung zu Disacchariden (Maltose, Saccharose, Lactose) und Polysacchariden.
   * Direkter Strukturvergleich der Stärkebestandteile: lineare, schraubenförmige **Amylose** (α-1,4) vs. baumartig verzweigtes **Amylopektin** (zusätzliche α-1,6-Verzweigungen).
4. **Diagnose- und Kompetenzmodul:**
   * Streng auf die im Portal behandelten Inhalte abgestimmt (ohne externe experimentelle Nachweise).
   * Formatives Quiz (5 Aufgaben, 10 BE) mit Sofort-Feedback.
   * Drei offene Klausur-Transferaufgaben (15 BE) nach AFB I–III mit einblendbarer Musterlösung.
   * Speichert alle Schülereingaben und Testergebnisse permanent im lokalen Browser-Speicher (`localStorage`).

---

## 🖨️ PDF-Portfolio-Export für Schule Birklehof

Oben rechts befindet sich der Button **`🖨️ PDF / Druck`**:
* Aktiviert ein spezielles Druck-Stylesheet (`@media print`), das Bildschirm-Bedienelemente ausblendet.
* Erzeugt ein offizielles, mehrseitiges Schüler-Portfolio mit:
  * Schulkopf: Schule Birklehof – Kursstufe Chemie Basisfach
  * Name, Kurs, Datum und erreichter BE-Punktzahl
  * Vollständig dokumentierten Schüler-Freitextantworten
  * Ausgefülltem Kompetenzraster nach Bildungsplan 3.3.3
  * Unterschriftenfeldern für Schüler/in und Fachlehrkraft

---

## 🖼️ Integriertes Bild- und Strukturmaterial (`assets/`)

Das Lernportal bindet hochwertige Fachgrafiken und authentische Strukturzeichnungen ein:

* **Proteine (Strang A):**
  * `sekundaerstruktur_helix_faltblatt.png`: α-Helix und β-Faltblatt mit H-Brücken zwischen Peptidbindungen
  * `tertiaerstruktur_wechselwirkungen.png`: Vier Seitenketten-Wechselwirkungen (Disulfidbrücken, London-Kräfte, H-Brücken, Ionenbindungen)
  * `myoglobin_tertiaerstruktur.png`: 3D-Bändermodell des Myoglobins mit Häm-Tasche und gebundenem Sauerstoff
* **Kohlenhydrate (Strang B):**
  * `glucose_fischer_projektion.png`: D-Glucose in offenkettiger Fischer-Projektion (Chiralitätszentren, D-Reihe)
  * `glucose_haworth_alpha.png`: α-D-Glucopyranose in Haworth-Projektion (Halbacetal-Sechsring, C1-OH unten)
  * `glucose_haworth_beta.png`: β-D-Glucopyranose in Haworth-Projektion (Halbacetal-Sechsring, C1-OH oben)
  * `glycosidische_bindung_saccharose.png`: Kondensation von Glucose und Fructose zu Saccharose unter H₂O-Abspaltung
  * `amylose_struktur.png`: Unverzweigte α-1,4-verknüpfte Glucopyranose-Kette der Amylose (n = 100 bis 4.500)
  * `amylopektin_struktur.png`: Verzweigte Struktur des Amylopektins mit Hauptstrang (α-1,4) und Seitenast (α-1,6)

---

## 🚀 Schnelle Inbetriebnahme

Die Webanwendung ist vollkommen autark und benötigt keine externen Node.js- oder Server-Abhängigkeiten:
1. Den Ordner `KS_Basisfach/Lernportal_Gele_Naturstoffe/` im Dateimanager öffnen.
2. Doppelklick auf `index.html` – öffnet sich direkt in jedem modernen Webbrowser (Safari, Chrome, Firefox, Edge).
3. Vollständig für die Verwendung auf Schul-iPads, Tablets und Laptops optimiert.

# Lernportal-Gelbildner
