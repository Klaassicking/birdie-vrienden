# Combo Formulier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tab-switcher toevoegen aan het aanmeldformulier zodat bezoekers kunnen kiezen tussen "Per birdie" en "Eenmalig", en de webhook routeert submits naar het juiste tabblad.

**Architecture:** Twee wijzigingen: (1) `index.html` krijgt CSS + HTML tabs + aangepaste JS submit-logica; (2) `Code.gs` doPost krijgt routing op `data.type`. Geen nieuwe bestanden.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Apps Script (ES5)

## Global Constraints

- `index.html` gebruikt externe Google Fonts via CDN — niet verwijderen.
- CSS-variabelen: `--pink-d: #9D174D`, `--lila: #A78BFA`, `--lila-l: #F5F3FF`, `--border: #e8e4f0`, `--muted: #6b6880`.
- Apps Script sheet ID: `"1OFt91SSoiKGjSYIfT_mmaTUGJ2yKZSAH55oXfFvBwR8"`.
- "Eenmalige Sponsors" kolommen (in volgorde): NAAM, EMAIL, TELEFOON, BEDRAG (€), BETAALD.
- BETAALD default bij webhook-submit: `"Nee"`.
- `doPost` gebruikt `no-cors` vanuit browser — response is altijd opaque; foutafhandeling is best-effort.
- Bestaand gedrag van `doPost` voor Aanmeldingen mag niet wijzigen.

---

### Task 1: Tab-switcher UI + aangepaste submit logica in index.html

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: `currentTab` variabele (`"per_birdie"` of `"eenmalig"`), `switchTab(tab)` functie, aangepaste `submitForm()`

- [ ] **Stap 1: Voeg CSS toe voor de tab-switcher**

Voeg dit toe in de `<style>` sectie, direct voor de sluitende `</style>` tag (vóór regel 278):

```css
    /* Tab switcher */
    .tab-switcher {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: var(--lila-l);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.35rem;
    }
    .tab-btn {
      flex: 1;
      padding: 0.55rem 0.75rem;
      border: none;
      border-radius: 9px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      background: transparent;
      color: var(--muted);
      transition: background 0.15s, color 0.15s;
    }
    .tab-btn.active {
      background: white;
      color: var(--pink-d);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      font-weight: 600;
    }
```

- [ ] **Stap 2: Voeg de tab-switcher HTML + eenmalig-sectie toe aan de form**

Vervang de volledige inhoud van `<div id="form-state">` (regels 290–347) door:

```html
    <div id="form-state">
      <!-- Tab switcher -->
      <div class="tab-switcher">
        <button class="tab-btn active" id="tab-per-birdie" onclick="switchTab('per_birdie')">Per birdie</button>
        <button class="tab-btn"        id="tab-eenmalig"   onclick="switchTab('eenmalig')">Eenmalig</button>
      </div>

      <p class="section-label">Jouw gegevens</p>

      <div class="field">
        <label for="naam">Naam <span class="opt">(verplicht)</span></label>
        <input type="text" id="naam" placeholder="Voor- en achternaam" autocomplete="name" />
        <div class="error-msg" id="err-naam">Vul je naam in.</div>
      </div>

      <div class="field">
        <label for="email">E-mailadres <span class="opt">(verplicht)</span></label>
        <input type="email" id="email" placeholder="jij@voorbeeld.nl" autocomplete="email" />
        <div class="error-msg" id="err-email">Vul een geldig e-mailadres in.</div>
      </div>

      <div class="field">
        <label for="telefoon">Telefoonnummer <span class="opt">(verplicht)</span></label>
        <input type="tel" id="telefoon" placeholder="+31 6 ..." autocomplete="tel" />
        <div class="error-msg" id="err-telefoon">Vul je telefoonnummer in.</div>
      </div>

      <hr class="divider" />

      <!-- Per birdie sectie -->
      <div id="section-per-birdie">
        <p class="section-label">Jouw sponsorbedrag</p>

        <div class="field">
          <label for="per-birdie">Bedrag per birdie (€)</label>
          <div class="preset-row">
            <button class="preset" data-val="2"   onclick="setPreset(this,'per-birdie')">€2</button>
            <button class="preset" data-val="3.5" onclick="setPreset(this,'per-birdie')">€3,50</button>
            <button class="preset" data-val="5"   onclick="setPreset(this,'per-birdie')">€5</button>
          </div>
          <input type="number" id="per-birdie" placeholder="Eigen bedrag" min="0.5" step="0.5" />
          <div class="error-msg" id="err-birdie">Vul een bedrag in (min. €0,50).</div>
        </div>

        <div class="field cap-field">
          <label for="max-seizoen" style="font-size:0.82rem;color:var(--muted);">Seizoenscap (€) <span class="opt">(optioneel)</span></label>
          <input type="number" id="max-seizoen" placeholder="Max bedrag per seizoen" min="5" step="5" />
          <p class="hint">Eenmaal bereikt, geen verdere kosten.</p>
        </div>

        <hr class="divider" />
        <p class="section-label">Whatsapp groep</p>

        <label class="check-wrap" for="whatsapp">
          <input type="checkbox" id="whatsapp" />
          <div>
            <div class="check-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18" style="vertical-align:-3px;margin-right:5px;flex-shrink:0"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 8.5A10.44 10.44 0 0 0 16 5.5a10.5 10.5 0 0 0-9.1 15.7L5.5 26.5l5.5-1.4A10.5 10.5 0 0 0 26.5 16a10.44 10.44 0 0 0-3-7.5zm-7.5 16.1a8.7 8.7 0 0 1-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3a8.72 8.72 0 1 1 7.2 4zm4.8-6.5c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1.1-.3.2-.6 0a7.27 7.27 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.1c-.2-.5-.5-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.93 11.93 0 0 0 4.5 4 5 5 0 0 0 3 .6 2.76 2.76 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c0-.1-.3-.2-.5-.3z" fill="#fff"/></svg>Ja, voeg mij toe aan de Vrienden van Hester WhatsApp-groep</div>
            <div class="check-sub">Je volgt mijn leven op Tour van dichtbij — de goede rondes, de mindere dagen en alles daartussen. Alleen berichten van mij, geen spam.</div>
          </div>
        </label>
      </div>

      <!-- Eenmalig sectie -->
      <div id="section-eenmalig" style="display:none;">
        <p class="section-label">Jouw eenmalige bijdrage</p>

        <div class="field">
          <label for="bedrag-eenmalig">Bedrag (€) <span class="opt">(verplicht)</span></label>
          <input type="number" id="bedrag-eenmalig" placeholder="Bijv. 25" min="1" step="1" />
          <div class="error-msg" id="err-eenmalig">Vul een bedrag in (min. €1).</div>
        </div>
      </div>

      <button class="btn" id="submit-btn" onclick="submitForm()">Aanmelden als Birdie Vriend 🐥</button>

      <p class="terms" id="terms-per-birdie">
        Je ontvangt na elke 3 toernooien een betaalverzoek voor het gemaakte aantal birdies. Heb je een seizoenscap ingesteld? Dan stoppen de Tikkies zodra dat bedrag is bereikt. Het seizoen loopt tot en met december 2026. Afmelden kan altijd via <a href="mailto:hestersickinggolf@gmail.com">hestersickinggolf@gmail.com</a>.
      </p>
      <p class="terms" id="terms-eenmalig" style="display:none;">
        Je ontvangt een betaalverzoek voor je eenmalige bijdrage. Bedankt voor je steun! Vragen? Mail naar <a href="mailto:hestersickinggolf@gmail.com">hestersickinggolf@gmail.com</a>.
      </p>
    </div>

    <div class="thankyou" id="thankyou-state">
      <div class="big-bird">⛳</div>
      <h2 id="thankyou-title">Welkom, Birdie Vriend!</h2>
      <p id="thankyou-msg">Je aanmelding is ontvangen — Alvast bedankt.</p>
    </div>
```

- [ ] **Stap 3: Vervang de volledige `<script>` sectie**

Vervang de hele `<script>…</script>` (regels 358–450) door:

```html
<script>
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhaBC5EC2RZLF52TfssrEoZn6Idi990Dh2giZejemrNvoMn9oQb_Q1UQ4rOBVgLeAf/exec";

  var currentTab = 'per_birdie';

  function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-per-birdie').classList.toggle('active', tab === 'per_birdie');
    document.getElementById('tab-eenmalig').classList.toggle('active', tab === 'eenmalig');
    document.getElementById('section-per-birdie').style.display = tab === 'per_birdie' ? '' : 'none';
    document.getElementById('section-eenmalig').style.display   = tab === 'eenmalig'   ? '' : 'none';
    document.getElementById('terms-per-birdie').style.display   = tab === 'per_birdie' ? '' : 'none';
    document.getElementById('terms-eenmalig').style.display     = tab === 'eenmalig'   ? '' : 'none';
    document.getElementById('submit-btn').textContent            = tab === 'per_birdie'
      ? 'Aanmelden als Birdie Vriend 🐥'
      : 'Eenmalig sponsoren';
  }

  function setPreset(btn, fieldId) {
    document.getElementById(fieldId).value = btn.dataset.val;
    btn.closest('.field').querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function clearErrors() {
    ['naam','email','telefoon','birdie','eenmalig'].forEach(function(k) {
      var el = document.getElementById('err-' + k);
      if (el) el.style.display = 'none';
    });
    ['naam','email','telefoon','per-birdie','bedrag-eenmalig'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('invalid');
    });
  }

  function submitForm() {
    clearErrors();
    var ok = true;

    var naam     = document.getElementById('naam');
    var email    = document.getElementById('email');
    var telefoon = document.getElementById('telefoon');

    if (!naam.value.trim()) {
      naam.classList.add('invalid');
      document.getElementById('err-naam').style.display = 'block';
      ok = false;
    }
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.value.trim())) {
      email.classList.add('invalid');
      document.getElementById('err-email').style.display = 'block';
      ok = false;
    }
    if (!telefoon.value.trim()) {
      telefoon.classList.add('invalid');
      document.getElementById('err-telefoon').style.display = 'block';
      ok = false;
    }

    var payload;
    if (currentTab === 'per_birdie') {
      var birdie = document.getElementById('per-birdie');
      if (!birdie.value || parseFloat(birdie.value) < 0.5) {
        birdie.classList.add('invalid');
        document.getElementById('err-birdie').style.display = 'block';
        ok = false;
      }
      if (!ok) return;
      payload = {
        type:        'per_birdie',
        naam:        naam.value.trim(),
        email:       email.value.trim(),
        telefoon:    telefoon.value.trim(),
        per_birdie:  parseFloat(birdie.value),
        max_seizoen: parseFloat(document.getElementById('max-seizoen').value) || null,
        whatsapp:    document.getElementById('whatsapp').checked,
      };
    } else {
      var bedrag = document.getElementById('bedrag-eenmalig');
      if (!bedrag.value || parseFloat(bedrag.value) < 1) {
        bedrag.classList.add('invalid');
        document.getElementById('err-eenmalig').style.display = 'block';
        ok = false;
      }
      if (!ok) return;
      payload = {
        type:     'eenmalig',
        naam:     naam.value.trim(),
        email:    email.value.trim(),
        telefoon: telefoon.value.trim(),
        bedrag:   parseFloat(bedrag.value),
      };
    }

    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Bezig met verzenden…';

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    })
    .then(function() { showThanks(); })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = currentTab === 'per_birdie' ? 'Aanmelden als Birdie Vriend 🐥' : 'Eenmalig sponsoren';
      alert('Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.');
    });
  }

  function showThanks() {
    document.getElementById('form-state').style.display = 'none';
    var state = document.getElementById('thankyou-state');
    state.style.display = 'block';
    if (currentTab === 'eenmalig') {
      document.getElementById('thankyou-title').textContent = 'Bedankt voor je donatie!';
      document.getElementById('thankyou-msg').textContent   = 'Je eenmalige bijdrage is ontvangen — super bedankt!';
    }
  }

  ['per-birdie','max-seizoen'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function() {
      this.closest('.field').querySelectorAll('.preset').forEach(function(b) {
        b.classList.toggle('active', b.dataset.val === this.value);
      }.bind(this));
    });
  });
</script>
```

- [ ] **Stap 4: Commit**

```bash
git add index.html
git commit -m "feat: add per-birdie/eenmalig tab switcher to form"
```

---

### Task 2: Webhook routing in Code.gs

**Files:**
- Modify: `google-apps-script/Code.gs` — functie `doPost` (regels 23–53)

**Interfaces:**
- Consumes: `data.type` (`"eenmalig"` of anders), `data.naam`, `data.email`, `data.telefoon`, `data.bedrag`
- Produces: rij in "Eenmalige Sponsors" sheet bij `type === "eenmalig"`

- [ ] **Stap 1: Vervang de `doPost` functie**

Vervang de volledige `doPost` functie (regels 23–53) door:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss   = SpreadsheetApp.openById(SHEET_ID);

    if (data.type === "eenmalig") {
      var eenSheet = ss.getSheetByName("Eenmalige Sponsors");
      if (!eenSheet) {
        eenSheet = ss.insertSheet("Eenmalige Sponsors");
        eenSheet.appendRow(["NAAM", "EMAIL", "TELEFOON", "BEDRAG (€)", "BETAALD"]);
        eenSheet.setFrozenRows(1);
      }
      eenSheet.appendRow([
        data.naam     || "",
        data.email    || "",
        data.telefoon || "",
        data.bedrag   != null ? parseFloat(data.bedrag) : "",
        "Nee",
      ]);
      return buildResponse({ status: "ok", message: "Eenmalige sponsoring opgeslagen." });
    }

    // Bestaand gedrag: per-birdie naar Aanmeldingen
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(COLUMNS.map(function(c) { return c.toUpperCase(); }));
      sheet.setFrozenRows(1);
    }

    var row = [
      new Date(),
      data.naam        || "",
      data.email       || "",
      data.telefoon    || "",
      data.per_birdie  != null ? data.per_birdie : "",
      data.max_seizoen != null ? data.max_seizoen : "",
      data.whatsapp    ? "Ja" : "Nee",
      "Ja",
    ];

    sheet.appendRow(row);
    return buildResponse({ status: "ok", message: "Aanmelding opgeslagen." });

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() }, true);
  }
}
```

- [ ] **Stap 2: Commit**

```bash
git add google-apps-script/Code.gs
git commit -m "feat: route eenmalig submissions to Eenmalige Sponsors sheet"
```
