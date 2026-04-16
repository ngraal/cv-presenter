# LaTeX CV Template

LaTeX-Vorlage für den Lebenslauf, basierend auf der Struktur und dem Design der cv-presenter Web-App.

## Struktur

| Datei | Beschreibung |
|---|---|
| `cv-style.sty` | Haupt-Paket — lädt Abhängigkeiten, Farben und alle Komponenten |
| `cv-personal-header.tex` | Komponente: Personal Header & Contact Bar |
| `cv-timeline-section.tex` | Komponente: Timeline-Sections (Erfahrung, Ausbildung, …) |
| `cv-skills-section.tex` | Komponente: Skills-Grid mit Kategorie-Karten |
| `cv.tex` | Haupt-Dokument mit den CV-Daten |
| `profile-image.jpg` | Profilbild (kreisförmig im Header angezeigt) |
| `Dockerfile` | Container-Image auf Basis von texlive |
| `docker-compose.yml` | Build-Konfiguration |

## Wiederverwendbare Komponenten

Jede Komponente liegt in einer eigenen Datei und wird von `cv-style.sty` geladen.
Die Bausteine entsprechen den React-Komponenten der Web-App:

### Personal Header (`cv-personal-header.tex`)

```latex
% Ohne Profilbild
\personalheader{Name}{Titel}{Zusammenfassung}

% Mit Profilbild (kreisförmig, wie in der App)
\personalheaderwithimage{bild.jpg}{Name}{Titel}{Zusammenfassung}

\cvcontactbar{Geburtsdatum}{E-Mail}{Telefon}{Ort}
```

### Timeline Section (`cv-timeline-section.tex`)

```latex
\begin{timelinesection}{Sectiontitel}
  % [current] = aktuelle Position (gefüllter Kreis mit Ring)
  % [first]   = erster Eintrag (gefüllter Kreis)
  % (leer)    = vergangener Eintrag (leerer Kreis)
  \timelineitem[current]{Firma}{Rolle}{Startdatum}{Enddatum}{Beschreibung}
  \timelineitem{Firma}{Rolle}{Start}{Ende}{Beschreibung}
\end{timelinesection}
```

### Skills Section (`cv-skills-section.tex`)

```latex
\begin{skillssection}{Sectiontitel}
  \skillcategory{\faIcon{code}}{Kategorie}{Skill 1, Skill 2, Skill 3}
\end{skillssection}
```

## Farbschema

Die Farben orientieren sich am Material Design 3 Theme der App, angepasst für den Druck:

| Farbe | Hex | Verwendung |
|---|---|---|
| `cv-primary` | `#7B61FF` | Akzentfarbe (Lila) |
| `cv-secondary` | `#00B8D4` | Sekundärfarbe (Cyan) |
| `cv-tertiary` | `#2E7D32` | Tertiärfarbe (Grün) |

## PDF bauen

### Mit Docker Compose (empfohlen)

```bash
cd latex-template
docker compose run --rm latex-cv
```

Das PDF wird im `latex-template/`-Verzeichnis als `cv.pdf` erzeugt.

### Mit Docker direkt

```bash
cd latex-template
docker compose build latex-cv
docker compose run --rm latex-cv
```

### Lokal (mit installiertem TeX Live)

```bash
cd latex-template
pdflatex cv.tex
pdflatex cv.tex   # zweiter Durchlauf für Referenzen
```

## Anpassungen

- **Daten ändern:** `cv.tex` bearbeiten — die Struktur folgt dem JSON-Schema der App (`CVData`)
- **Design ändern:** `cv-style.sty` und die Komponentendateien bearbeiten — Farben, Abstände, Schriften
- **Neues Profil:** `cv.tex` kopieren und die Daten ersetzen; die Komponentendateien bleiben unverändert
- **Profilbild:** `profile-image.jpg` ersetzen oder `\personalheader` statt `\personalheaderwithimage` verwenden
