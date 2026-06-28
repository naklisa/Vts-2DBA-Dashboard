import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Tentukan path penyimpanan file database
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "arrived-ships.json");

interface DataSchema {
  arrivedKeys: string[];
  undockedKeys: string[];
}

// Fungsi helper untuk membaca database lokal
async function readData(): Promise<DataSchema> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return {
      arrivedKeys: Array.isArray(parsed.arrivedKeys) ? parsed.arrivedKeys : [],
      undockedKeys: Array.isArray(parsed.undockedKeys) ? parsed.undockedKeys : [],
    };
  } catch {
    // Jika file tidak ada atau gagal parsing, kembalikan schema kosong
    return { arrivedKeys: [], undockedKeys: [] };
  }
}

// Fungsi helper untuk menulis ke database lokal
async function writeData(data: DataSchema): Promise<void> {
  try {
    // Pastikan direktori folder 'data' telah dibuat
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write ship status database:", error);
  }
}

// Endpoint GET: Mengambil status arrived & undocked
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

// Endpoint POST: Memperbarui status arrived & undocked
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shipKey, action } = body;

    if (!shipKey) {
      return NextResponse.json({ error: "shipKey is required" }, { status: 400 });
    }

    const data = await readData();
    const arrivedSet = new Set(data.arrivedKeys);
    const undockedSet = new Set(data.undockedKeys);

    if (action === "check") {
      // Ceklis manual kapal (tiba)
      arrivedSet.add(shipKey);
      undockedSet.delete(shipKey);
    } else if (action === "uncheck_manual") {
      // Uncheck manual kapal yang belum terlewati ETA-nya
      arrivedSet.delete(shipKey);
      undockedSet.delete(shipKey);
    } else if (action === "uncheck_override") {
      // Uncheck manual kapal yang sudah lewat ETA (dimasukkan ke daftar delay/override)
      arrivedSet.delete(shipKey);
      undockedSet.add(shipKey);
    } else if (action === "reset_override") {
      // Mengembalikan kapal yang lewat ETA ke status tercentang (menghapus override delay)
      arrivedSet.delete(shipKey);
      undockedSet.delete(shipKey);
    }

    const updatedData: DataSchema = {
      arrivedKeys: Array.from(arrivedSet),
      undockedKeys: Array.from(undockedSet),
    };

    await writeData(updatedData);

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error in API POST arrived:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
