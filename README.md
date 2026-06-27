# Birdie Vrienden

Statische sponsorregistratiepagina voor Birdie Vrienden, gehost op GitHub Pages. Ingevulde formulieren gaan privé naar een Google Sheet via Google Apps Script.

---

## Quickstart (eerste keer opzetten)

### Stap 1 – Google Apps Script deployen

Volg de instructies in [`google-apps-script/README.md`](google-apps-script/README.md).  
Je hebt aan het einde een Web App URL nodig die eruitziet als:
```
https://script.google.com/macros/s/AKfyc.../exec
```

### Stap 2 – URL invullen in `index.html`

Open `index.html` en zoek naar:

```js
const APPS_SCRIPT_URL = "VERVANG_DIT_MET_JOUW_APPS_SCRIPT_WEB_APP_URL";
```

Vervang de placeholder door jouw Web App URL.

### Stap 3 – GitHub Pages inschakelen

1. Ga naar **Settings → Pages** in je GitHub-repository.
2. Zet **Source** op **GitHub Actions**.
3. Sla op.

### Stap 4 – Pushen

```bash
git add index.html
git commit -m "Add Apps Script URL"
git push
```

De GitHub Actions workflow deployt automatisch naar GitHub Pages. Na ±1 minuut is de site live op:
```
https://<jouw-gebruikersnaam>.github.io/<repo-naam>/
```

---

## Hoe het werkt

```
Bezoeker vult formulier in
        ↓
GitHub Pages (index.html)
        ↓  POST (no-cors, JSON)
Google Apps Script Web App
        ↓
Google Sheet "Aanmeldingen"
```

- De pagina is volledig statisch — geen server nodig.
- Data gaat direct en privé naar jouw Google Sheet; geen derde partij ziet het.
- Het Apps Script schrijft per aanmelding één rij met timestamp, naam, e-mail, telefoon, bedrijf, bedrag per birdie, seizoenscap en WhatsApp-voorkeur.

---

## Lokaal testen

Open `index.html` gewoon in een browser. Het formulier toont de bedankpagina na verzenden; omdat `APPS_SCRIPT_URL` nog een placeholder is, gaat er nog geen data naar de sheet.

Zodra je de echte URL hebt ingevuld, kun je testen via de live GitHub Pages URL (cross-origin fetch werkt niet vanaf `file://`).

---

## Bestanden

```
├── index.html                          # Sponsorformulier
├── .github/
│   └── workflows/
│       └── deploy.yml                  # Auto-deploy naar GitHub Pages
└── google-apps-script/
    ├── Code.gs                         # Apps Script webhook
    └── README.md                       # Deployinstructies voor het script
```
