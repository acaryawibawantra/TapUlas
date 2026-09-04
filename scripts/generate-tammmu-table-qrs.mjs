import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ratey.site";
const TOTAL_TABLES = 20;

const outputDir = path.join(process.cwd(), "public", "tammmu", "qr-tables");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateTableQRs() {
  console.log(`Generating QR Codes for Tammmu Tables (1 to ${TOTAL_TABLES})...`);

  for (let i = 1; i <= TOTAL_TABLES; i++) {
    const tableNum = String(i).padStart(2, "0");
    const tableUrl = `${BASE_URL}/tammmu?table=${tableNum}`;
    const filename = `qr-meja-${tableNum}.png`;
    const filePath = path.join(outputDir, filename);

    await QRCode.toFile(filePath, tableUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: "#26231E",
        light: "#FAF8F5",
      },
    });

    console.log(`[✓] Generated: Meja ${tableNum} -> ${tableUrl}`);
  }

  console.log(`\nAll ${TOTAL_TABLES} Table QR codes saved in public/tammmu/qr-tables/ !`);
}

generateTableQRs().catch(console.error);
