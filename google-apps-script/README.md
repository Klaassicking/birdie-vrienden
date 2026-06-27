# Google Apps Script – Birdie Vrienden webhook

Dit script ontvangt ingevulde formulierdata van de GitHub Pages website en schrijft die weg naar een Google Sheet.

---

## Eenmalige setup (±5 minuten)

### 1. Google Sheet aanmaken

1. Ga naar [sheets.google.com](https://sheets.google.com) en maak een nieuw spreadsheet aan.
2. Geef het een naam, bijv. **Birdie Vrienden Aanmeldingen**.
3. Het tabblad **"Aanmeldingen"** wordt automatisch aangemaakt de eerste keer dat het script data ontvangt.

### 2. Apps Script openen

1. In het spreadsheet: klik op **Extensions → Apps Script**.
2. Er opent een nieuw tabblad met de script-editor.

### 3. Code plakken

1. Verwijder de bestaande inhoud van `Code.gs`.
2. Kopieer de volledige inhoud van `Code.gs` uit deze map en plak die.
3. Sla op met **Ctrl+S** (of Cmd+S op Mac).

### 4. Deployen als Web App

1. Klik rechtsboven op **Deploy → New deployment**.
2. Klik op het tandwiel-icoon naast "Select type" en kies **Web App**.
3. Vul in:
   - **Description**: `Birdie Vrienden v1`
   - **Execute as**: `Me` ← **verplicht**
   - **Who has access**: `Anyone` ← **verplicht** (anders kan de website er niet naartoe posten)
4. Klik op **Deploy**.
5. Geef toestemming als Google daarom vraagt (éénmalig).
6. **Kopieer de Web App URL** — die ziet er zo uit:
   ```
   https://script.google.com/macros/s/AKfyc.../exec
   ```

### 5. URL invullen in `index.html`

Open `index.html` in de root van dit project en zoek naar:

```js
const APPS_SCRIPT_URL = "VERVANG_DIT_MET_JOUW_APPS_SCRIPT_WEB_APP_URL";
```

Vervang de placeholder-string door de URL die je in stap 4 gekopieerd hebt. Commit en push.

---

## Herimplementeren na een codewijziging

Elke keer dat je `Code.gs` aanpast en de wijzigingen live wilt zetten:

1. Klik op **Deploy → Manage deployments**.
2. Klik op het potlood-icoon naast je deployment.
3. Zet **Version** op **New version**.
4. Klik **Deploy** — de URL blijft hetzelfde.

---

## Kolommen in de sheet

| Kolom | Inhoud |
|-------|--------|
| TIMESTAMP | Datum en tijd van aanmelding |
| NAAM | Voor- en achternaam |
| EMAIL | E-mailadres |
| TELEFOON | Telefoonnummer (optioneel) |
| BEDRIJF | Bedrijfsnaam (optioneel) |
| PER_BIRDIE | Bedrag per birdie in € |
| MAX_SEIZOEN | Seizoenscap in € (leeg = geen cap) |
| WHATSAPP | Ja / Nee |

---

## Problemen oplossen

**Data komt niet aan in de sheet**
- Controleer of "Who has access" echt op **Anyone** staat (niet "Anyone with Google account").
- Controleer of de URL in `index.html` correct is overgenomen (geen spaties, geen aanhalingstekens kwijt).
- Open de Apps Script editor, klik **Executions** in de linkerzijbalk en kijk of er foutmeldingen staan.

**Script vraagt opnieuw om toestemming**
- Dit gebeurt als je het script aanpast op een manier die extra permissies nodig heeft. Volg de OAuth-stroom opnieuw.
