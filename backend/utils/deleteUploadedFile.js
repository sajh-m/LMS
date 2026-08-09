import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// imagePath looks like "/uploads/<filename>" (what we store on the row).
// Safe to call even if the file is already gone.
export async function deleteUploadedFile(imagePath) {
  if (!imagePath) return;

  const filename = path.basename(imagePath);
  const fullPath = path.join(UPLOADS_DIR, filename);

  try {
    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Failed to delete uploaded file:", fullPath, err);
    }
  }
}
