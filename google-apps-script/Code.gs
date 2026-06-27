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

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
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
