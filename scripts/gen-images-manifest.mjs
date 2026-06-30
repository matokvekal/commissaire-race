// Scans public/images/ and writes public/images/manifest.json
// Run: npm run gen-images
import { readdir, writeFile } from "fs/promises";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = join(ROOT, "public", "images");
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const files = (await readdir(IMG_DIR))
  .filter(f => EXTS.has(extname(f).toLowerCase()) && f !== "manifest.json")
  .sort();

const manifest = JSON.stringify({ images: files }, null, 2) + "\n";
await writeFile(join(IMG_DIR, "manifest.json"), manifest, "utf8");
console.log(`manifest.json updated: ${files.join(", ")}`);
