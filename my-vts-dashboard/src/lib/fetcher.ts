export interface ShipData {
  NO: string;
  QSO: string;
  Remark_2DBA: string;
  "NAME_OF_SHIP/_CALL_SIGN": string;
  Type_of_Cargo_On_Board: string;
  Quantity_of_Cargo_on_Board: string;
  FLAG: string;
  Cargo_On_Board: string;
  Last_Port: string;
  Gross_Tonnage: string;
  Other_Related_Information: string;
  Present_Position: string;
  "ETA_/_ETD_(LT)": string;
  REMARK: string;
  ACTION_FROM_VTS: string;
  Tanggal_Log: string;
}

let hasWarnedAboutApiUrl = false;

export async function getShipData(): Promise<ShipData[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    if (!hasWarnedAboutApiUrl) {
      console.error("Warning: NEXT_PUBLIC_API_URL is not defined in environment variables!");
      hasWarnedAboutApiUrl = true;
    }
    return [];
  }

  try {
    // Gunakan cache: 'no-store' agar selalu mendapatkan data ter-update
    // Tambahkan timestamp untuk menghindari cache di browser client
    const timestamp = new Date().getTime();
    const separator = apiUrl.includes("?") ? "&" : "?";
    const urlWithTimestamp = `${apiUrl}${separator}_t=${timestamp}`;

    const response = await fetch(urlWithTimestamp, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ship data: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => {
        // Cek jika field ETA / ETD (LT) adalah format ISO tanggal, bersihkan
        let etaVal = item.KOLOM_12 !== undefined ? String(item.KOLOM_12) : (item["ETA_/_ETD_(LT)"] || "");
        if (etaVal && etaVal.includes("T") && etaVal.includes("Z")) {
          try {
            const dateObj = new Date(etaVal);
            if (!isNaN(dateObj.getTime())) {
              const day = String(dateObj.getUTCDate()).padStart(2, '0');
              const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
              const year = dateObj.getUTCFullYear();
              const hours = String(dateObj.getUTCHours()).padStart(2, '0');
              const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
              etaVal = `${day}/${month}/${year} ${hours}:${minutes} (LT)`;
            }
          } catch {
            // Abaikan jika gagal parse
          }
        }

        return {
          "NO": item.KOLOM_0 !== undefined ? String(item.KOLOM_0) : (item.NO || ""),
          "QSO": item.KOLOM_1 !== undefined ? String(item.KOLOM_1) : (item.QSO || ""),
          "Remark_2DBA": item.KOLOM_2 !== undefined ? String(item.KOLOM_2) : (item.Remark_2DBA || ""),
          "NAME_OF_SHIP/_CALL_SIGN": item.KOLOM_3 !== undefined ? String(item.KOLOM_3) : (item["NAME_OF_SHIP/_CALL_SIGN"] || ""),
          "Type_of_Cargo_On_Board": item.KOLOM_4 !== undefined ? String(item.KOLOM_4) : (item.Type_of_Cargo_On_Board || ""),
          "Quantity_of_Cargo_on_Board": item.KOLOM_5 !== undefined ? String(item.KOLOM_5) : (item.Quantity_of_Cargo_on_Board || ""),
          "FLAG": item.KOLOM_6 !== undefined ? String(item.KOLOM_6) : (item.FLAG || ""),
          "Cargo_On_Board": item.KOLOM_7 !== undefined ? String(item.KOLOM_7) : (item.Cargo_On_Board || ""),
          "Last_Port": item.KOLOM_8 !== undefined ? String(item.KOLOM_8) : (item.Last_Port || ""),
          "Gross_Tonnage": item.KOLOM_9 !== undefined ? String(item.KOLOM_9) : (item.Gross_Tonnage || ""),
          "Other_Related_Information": item.KOLOM_10 !== undefined ? String(item.KOLOM_10) : (item.Other_Related_Information || ""),
          "Present_Position": item.KOLOM_11 !== undefined ? String(item.KOLOM_11) : (item.Present_Position || ""),
          "ETA_/_ETD_(LT)": etaVal,
          "REMARK": item.KOLOM_13 !== undefined ? String(item.KOLOM_13) : (item.REMARK || ""),
          "ACTION_FROM_VTS": item.KOLOM_14 !== undefined ? String(item.KOLOM_14) : (item.ACTION_FROM_VTS || ""),
          "Tanggal_Log": item.Tanggal_Log !== undefined ? String(item.Tanggal_Log) : ""
        };
      }) as ShipData[];
    } else if (data && typeof data === "object" && "error" in data) {
      console.error("API Error:", data.error);
      return [];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching ship data:", error);
    return [];
  }
}
