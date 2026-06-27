// ─────────────────────────────────────────────────────────────────────────────
// Birdie Vrienden – Google Apps Script webhook
//
// Deployment:
//   1. Open het Google Sheet waarin je data wilt opslaan.
//   2. Kies Extensions > Apps Script.
//   3. Vervang de inhoud van Code.gs door deze code.
//   4. Sla op (Ctrl+S).
//   5. Klik op Deploy > New deployment.
//   6. Kies Type: Web App.
//   7. Stel in:
//        Execute as: Me
//        Who has access: Anyone
//   8. Klik Deploy en kopieer de Web App URL.
//   9. Plak die URL in index.html bij APPS_SCRIPT_URL.
// ─────────────────────────────────────────────────────────────────────────────

// Naam van het tabblad in je Google Sheet
var SHEET_NAME = "Aanmeldingen";

// Kolomvolgorde in de sheet (pas aan als je kolommen wilt herordenen)
var COLUMNS = ["timestamp", "naam", "email", "telefoon", "bedrijf", "per_birdie", "max_seizoen", "whatsapp"];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss    = SpreadsheetApp.openById("1OFt91SSoiKGjSYIfT_mmaTUGJ2yKZSAH55oXfFvBwR8");
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Maak het tabblad aan als het nog niet bestaat
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Schrijf kolomkoppen
      sheet.appendRow(COLUMNS.map(function(c) { return c.toUpperCase(); }));
      sheet.setFrozenRows(1);
    }

    // Schrijf een nieuwe rij
    var row = [
      new Date(),                                          // timestamp
      data.naam        || "",
      data.email       || "",
      data.telefoon    || "",
      data.bedrijf     || "",
      data.per_birdie  != null ? data.per_birdie : "",
      data.max_seizoen != null ? data.max_seizoen : "",
      data.whatsapp    ? "Ja" : "Nee",
    ];

    sheet.appendRow(row);

    return buildResponse({ status: "ok", message: "Aanmelding opgeslagen." });

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() }, true);
  }
}

// Antwoord op OPTIONS preflight (browsers sturen dit soms vooraf)
function doGet(e) {
  return buildResponse({ status: "ok", message: "Birdie Vrienden webhook actief." });
}

function buildResponse(obj, isError) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// Eenmalig uitvoeren via de Apps Script editor: selecteer setupOverzicht en
// klik op "Uitvoeren". Maakt de tabbladen "Birdies" en "Overzicht" aan.
// ─────────────────────────────────────────────────────────────────────────────
function setupOverzicht() {
  var ss = SpreadsheetApp.openById("1OFt91SSoiKGjSYIfT_mmaTUGJ2yKZSAH55oXfFvBwR8");

  // ── Tabblad "Birdies" ──────────────────────────────────────────────────────
  var birdiesSheet = ss.getSheetByName("Birdies");
  if (!birdiesSheet) {
    birdiesSheet = ss.insertSheet("Birdies");
  } else {
    birdiesSheet.clear();
  }

  birdiesSheet.appendRow(["DATUM", "RONDE / OMSCHRIJVING", "AANTAL BIRDIES"]);
  birdiesSheet.setFrozenRows(1);

  // Kolombreedte
  birdiesSheet.setColumnWidth(1, 120);
  birdiesSheet.setColumnWidth(2, 220);
  birdiesSheet.setColumnWidth(3, 160);

  // Opmaak kolomkop
  birdiesSheet.getRange("A1:C1")
    .setBackground("#1e1b2e")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  // Datumnotatie kolom A (rij 2 t/m 200)
  birdiesSheet.getRange("A2:A200")
    .setNumberFormat("dd-mm-yyyy");

  // ── Tabblad "Overzicht" ───────────────────────────────────────────────────
  var overzichtSheet = ss.getSheetByName("Overzicht");
  if (!overzichtSheet) {
    overzichtSheet = ss.insertSheet("Overzicht");
  } else {
    overzichtSheet.clear();
  }

  // Kolomkoppen
  var headers = [
    "NAAM", "EMAIL", "BEDRIJF", "PER BIRDIE (€)",
    "MAX SEIZOEN (€)", "TOTAAL BIRDIES", "BEREKEND BEDRAG (€)", "CAP BEREIKT?"
  ];
  overzichtSheet.appendRow(headers);
  overzichtSheet.setFrozenRows(1);

  // Kolombreedte
  [140, 200, 160, 130, 130, 120, 160, 110].forEach(function(w, i) {
    overzichtSheet.setColumnWidth(i + 1, w);
  });

  // Opmaak kolomkop
  overzichtSheet.getRange("A1:H1")
    .setBackground("#9D174D")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  // Formules voor rijen 2 t/m 200 (trekken data uit Aanmeldingen + Birdies)
  //
  // Aanmeldingen kolommen:
  //   B=naam  C=email  E=bedrijf  F=per_birdie  G=max_seizoen
  //
  // Totaal birdies = SOM van Birdies!C:C (dezelfde waarde voor iedereen)
  // Berekend bedrag = per_birdie * totaal_birdies, afgetopt op max_seizoen
  var formulas = [];
  for (var r = 2; r <= 200; r++) {
    var aanmRow = r; // Aanmeldingen en Overzicht lopen gelijk op
    formulas.push([
      // A: naam
      '=IF(Aanmeldingen!B' + aanmRow + '="";"";Aanmeldingen!B' + aanmRow + ')',
      // B: email
      '=IF(Aanmeldingen!C' + aanmRow + '="";"";Aanmeldingen!C' + aanmRow + ')',
      // C: bedrijf
      '=IF(Aanmeldingen!E' + aanmRow + '="";"";Aanmeldingen!E' + aanmRow + ')',
      // D: per_birdie
      '=IF(Aanmeldingen!F' + aanmRow + '="";"";Aanmeldingen!F' + aanmRow + ')',
      // E: max_seizoen
      '=IF(Aanmeldingen!G' + aanmRow + '="";"–";Aanmeldingen!G' + aanmRow + ')',
      // F: totaal birdies (som van het Birdies-tabblad, zelfde voor iedereen)
      '=IF(Aanmeldingen!B' + aanmRow + '="";"";SUM(Birdies!C:C))',
      // G: berekend bedrag
      '=IF(Aanmeldingen!B' + aanmRow + '="";"";' +
        'IF(Aanmeldingen!G' + aanmRow + '="";Aanmeldingen!F' + aanmRow + '*SUM(Birdies!C:C);' +
        'MIN(Aanmeldingen!F' + aanmRow + '*SUM(Birdies!C:C);Aanmeldingen!G' + aanmRow + ')))',
      // H: cap bereikt?
      '=IF(Aanmeldingen!B' + aanmRow + '="";"";' +
        'IF(Aanmeldingen!G' + aanmRow + '="";"–";' +
        'IF(Aanmeldingen!F' + aanmRow + '*SUM(Birdies!C:C)>=Aanmeldingen!G' + aanmRow + ';"✓ Ja";"Nee")))',
    ]);
  }

  overzichtSheet.getRange(2, 1, 199, 8).setFormulas(formulas);

  // Getalnotatie voor bedragen
  overzichtSheet.getRange("D2:E200").setNumberFormat('€#,##0.00');
  overzichtSheet.getRange("G2:G200").setNumberFormat('€#,##0.00');

  // Voorwaardelijke opmaak: cap bereikt → groene achtergrond
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("Ja")
    .setBackground("#d1fae5")
    .setFontColor("#065f46")
    .setRanges([overzichtSheet.getRange("H2:H200")])
    .build();
  overzichtSheet.setConditionalFormatRules([rule]);

  SpreadsheetApp.getUi().alert("Klaar! Tabbladen 'Birdies' en 'Overzicht' zijn aangemaakt.");
}
