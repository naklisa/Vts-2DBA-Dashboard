function doGet(e) {
  // Buka Spreadsheet. Gunakan getActiveSpreadsheet() jika script terikat ke sheet,
  // atau gunakan openById("ID_SPREADSHEET_LO_DI_SINI") jika standalone script.
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var sheet = ss.getSheetByName("01-30 JUNI 2026");
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ 
      error: "Sheet '01-30 JUNI 2026' gak ditemukan, bre!" 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var rows = sheet.getDataRange().getValues();
  var result = [];
  var currentDate = "";
  
  // Looping mulai dari baris ke-5 (index 4), karena baris 1-2 kosong/meta, baris 3 header Inggris, baris 4 sub-header Indo
  for (var i = 4; i < rows.length; i++) {
    var row = rows[i];
    
    // 1. Cek apakah ini baris pembatas tanggal
    // Kolom B (index 1) berisi kata "Tggl/Bln/thn" atau sejenisnya
    var colBVal = row[1] ? row[1].toString().trim() : "";
    if (colBVal.toLowerCase().indexOf("tggl") !== -1 || colBVal.toLowerCase().indexOf("tanggal") !== -1) {
      var dateRaw = row[2] ? row[2].toString().trim() : "";
      // Bersihin separator titik dua ato spasi di depan, contoh: ": 01/JUNI/2026" -> "01/JUNI/2026"
      currentDate = dateRaw.replace(/^:\s*/, "");
      continue; // Skip baris ini, lanjut cari data kapal di bawahnya
    }
    
    // 2. Cek validitas baris data kapal
    // Syarat data valid: Kolom A (No) gak kosong, Kolom D (Name of Ship) gak kosong, dan Kolom A bukan tulisan "NO" (jika ada header duplikat)
    var noVal = row[0] ? row[0].toString().trim() : "";
    var shipNameVal = row[3] ? row[3].toString().trim() : "";
    
    if (noVal !== "" && shipNameVal !== "" && noVal.toLowerCase() !== "no" && noVal.toLowerCase() !== "nomor") {
      
      // Mapping manual ke key JSON yang konsisten & clean sesuai kebutuhan lo
      var shipObj = {
        "NO": noVal,
        "QSO": row[1] ? row[1].toString().trim() : "",
        "Remark_2DBA": row[2] ? row[2].toString().trim() : "",
        "NAME_OF_SHIP/_CALL_SIGN": shipNameVal, // Sesuai filter frontend lo
        "Type_of_Cargo_On_Board": row[4] ? row[4].toString().trim() : "",
        "Quantity_of_Cargo_on_Board": row[5] ? row[5].toString().trim() : "",
        "FLAG": row[6] ? row[6].toString().trim() : "",
        "Cargo_On_Board": row[7] ? row[7].toString().trim() : "",
        "Last_Port": row[8] ? row[8].toString().trim() : "",
        "Gross_Tonnage": row[9] ? row[9].toString().trim() : "",
        "Other_Related_Information": row[10] ? row[10].toString().trim() : "",
        "Present_Position": row[11] ? row[11].toString().trim() : "",
        "ETA_/_ETD_(LT)": row[12] ? row[12].toString().trim() : "",
        "REMARK": row[13] ? row[13].toString().trim() : "",
        "ACTION_FROM_VTS": row[14] ? row[14].toString().trim() : "",
        "Tanggal_Log": currentDate // Tanggal diselipin otomatis dari state terakhir
      };
      
      result.push(shipObj);
    }
  }
  
  // Kembalikan JSON Output
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}
