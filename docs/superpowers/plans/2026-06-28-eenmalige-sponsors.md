# Eenmalige Sponsors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Voeg een "Eenmalige Sponsors" tabblad toe aan de spreadsheet via een setup-functie en menu-item in Google Apps Script.

**Architecture:** Eén nieuwe functie `setupEenmaligSponsors()` in `Code.gs`, plus een menu-item in `onOpen()`. Volledig zelfstandig — geen koppeling met andere tabbladen of functies.

**Tech Stack:** Google Apps Script (JavaScript ES5), SpreadsheetApp API

## Global Constraints

- Sheet ID: `"1OFt91SSoiKGjSYIfT_mmaTUGJ2yKZSAH55oXfFvBwR8"` — gebruik altijd `SpreadsheetApp.openById(SHEET_ID)`.
- Tabblad naam: `"Eenmalige Sponsors"` — exact zo.
- Kleurenschema header: achtergrond `#9D174D`, tekst `#ffffff`, vet.
- Totaalrij achtergrond: `#fdf2f8`, vet.
- Betaald-dropdown waarden: `["Ja", "Nee"]`.
- Voorwaardelijke opmaak: Ja → `{bg: "#d1fae5", fg: "#065f46"}`, Nee → `{bg: "#fee2e2", fg: "#991b1b"}`.
- Bevestigingsdialoog bij reset: zelfde patroon als `setupBetalingen()`.

---

### Task 1: Menu-item toevoegen

**Files:**
- Modify: `google-apps-script/Code.gs` (functie `onOpen`, regels 68–81)

**Interfaces:**
- Produces: menu-item "Setup Eenmalige Sponsors" dat `setupEenmaligSponsors` aanroept (functie wordt in Task 2 geïmplementeerd)

- [ ] **Stap 1: Voeg het menu-item toe aan `onOpen()`**

Zoek in `Code.gs` de `onOpen()` functie. Voeg na de regel met `'Setup Betalingen'` dit toe:

```javascript
.addItem('Setup Eenmalige Sponsors',          'setupEenmaligSponsors')
```

De volledige `onOpen()` wordt dan:

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Birdie Vrienden')
    .addItem('Setup Overzicht + Birdies',        'setupOverzicht')
    .addItem('Setup Betalingen',                 'setupBetalingen')
    .addItem('Setup Eenmalige Sponsors',          'setupEenmaligSponsors')
    .addItem('Refresh Overzicht formulas',       'refreshOverzichtFormulas')
    .addItem('Setup Aanmeldingen (ACTIEF kolom)','setupAanmeldingenKolommen')
    .addItem('Voeg datumpicker toe aan Birdies', 'setupBirdiesDatumPicker')
    .addSeparator()
    .addItem('Sync toernooien naar Betalingen',  'syncToernooien')
    .addSeparator()
    .addItem('Genereer betaalverzoek',           'genereerBetaalverzoek')
    .addToUi();
}
```

- [ ] **Stap 2: Commit**

```bash
git add google-apps-script/Code.gs
git commit -m "feat: add menu item for Eenmalige Sponsors"
```

---

### Task 2: `setupEenmaligSponsors()` implementeren

**Files:**
- Modify: `google-apps-script/Code.gs` — voeg nieuwe functie toe na `setupBetalingen()`

**Interfaces:**
- Consumes: globale variabele `SHEET_ID` (al gedefinieerd bovenaan Code.gs)
- Produces: tabblad "Eenmalige Sponsors" met kolommen NAAM, EMAIL, TELEFOON, BEDRAG, BETAALD

- [ ] **Stap 1: Voeg de functie toe aan `Code.gs`**

Voeg de volgende functie toe direct na de sluitende `}` van `setupBetalingen()` (rond regel 181):

```javascript
// ─────────────────────────────────────────────────────────────────────────────
// Eenmalige Sponsors – aanmaken
// ─────────────────────────────────────────────────────────────────────────────
function setupEenmaligSponsors() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var sheet = ss.getSheetByName("Eenmalige Sponsors");
  if (sheet) {
    var ui = SpreadsheetApp.getUi();
    var antwoord = ui.alert(
      "Eenmalige Sponsors-tabblad bestaat al",
      "Wil je het volledig opnieuw aanmaken? Alle data gaat verloren.",
      ui.ButtonSet.YES_NO
    );
    if (antwoord !== ui.Button.YES) return;
    sheet.clear();
    sheet.clearDataValidations();
    sheet.setConditionalFormatRules([]);
  } else {
    sheet = ss.insertSheet("Eenmalige Sponsors");
  }

  // ── Headers ────────────────────────────────────────────────────────────────
  var headers = ["NAAM", "EMAIL", "TELEFOON", "BEDRAG (€)", "BETAALD"];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  sheet.getRange("A1:E1")
    .setBackground("#9D174D")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  // ── Kolombreedtes ──────────────────────────────────────────────────────────
  sheet.setColumnWidth(1, 180); // NAAM
  sheet.setColumnWidth(2, 200); // EMAIL
  sheet.setColumnWidth(3, 130); // TELEFOON
  sheet.setColumnWidth(4, 130); // BEDRAG
  sheet.setColumnWidth(5, 100); // BETAALD

  // ── BEDRAG opmaak ──────────────────────────────────────────────────────────
  sheet.getRange("D2:D200").setNumberFormat('€#,##0.00');

  // ── BETAALD dropdown + voorwaardelijke opmaak ──────────────────────────────
  var betaaldRange = sheet.getRange("E2:E200");
  betaaldRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Ja", "Nee"], true)
      .build()
  );
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Ja")
      .setBackground("#d1fae5").setFontColor("#065f46")
      .setRanges([betaaldRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Nee")
      .setBackground("#fee2e2").setFontColor("#991b1b")
      .setRanges([betaaldRange])
      .build()
  ]);

  // ── Totaalrij (rij 202, vast onder datagebied E2:E200) ────────────────────
  sheet.getRange("A202").setValue("TOTAAL OPEN");
  sheet.getRange("D202").setFormula('=SUMIF(E2:E200,"Nee",D2:D200)');
  sheet.getRange("A202:E202")
    .setBackground("#fdf2f8")
    .setFontWeight("bold");
  sheet.getRange("D202").setNumberFormat('€#,##0.00');

  SpreadsheetApp.getUi().alert("Eenmalige Sponsors-tabblad aangemaakt.");
}
```

- [ ] **Stap 2: Handmatig testen in Google Sheets**

  1. Open het Google Sheet (ID: `1OFt91SSoiKGjSYIfT_mmaTUGJ2yKZSAH55oXfFvBwR8`).
  2. Ga naar Extensions > Apps Script, plak de bijgewerkte `Code.gs` en sla op.
  3. Herlaad de spreadsheet (F5).
  4. Klik op menu "Birdie Vrienden" → controleer dat "Setup Eenmalige Sponsors" zichtbaar is.
  5. Klik op "Setup Eenmalige Sponsors" → tabblad "Eenmalige Sponsors" verschijnt.
  6. Controleer:
     - Rij 1: NAAM, EMAIL, TELEFOON, BEDRAG (€), BETAALD — paarse achtergrond, witte vette tekst.
     - Kolom D: euro-opmaak bij invoer van een getal.
     - Kolom E: dropdown met Ja/Nee.
     - Cel E2 = "Ja" → groene achtergrond; cel E3 = "Nee" → rode achtergrond.
  7. Klik nogmaals op "Setup Eenmalige Sponsors" → bevestigingsdialoog verschijnt. Klik "Nee" → tabblad ongewijzigd. Klik nogmaals en kies "Ja" → tabblad wordt gereset.
  8. Controleer rij 202: cel A202 = "TOTAAL OPEN", roze achtergrond, vet. Voer in D2 = 50, E2 = "Nee" → D202 toont €50,00. Zet E2 op "Ja" → D202 toont €0,00.

- [ ] **Stap 3: Commit**

```bash
git add google-apps-script/Code.gs
git commit -m "feat: implement setupEenmaligSponsors function"
```
