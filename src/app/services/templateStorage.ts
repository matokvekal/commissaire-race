import { openDB } from 'idb';
import type { MappingTemplate, ColumnMapping } from '@/types/csv.types';

const DB_NAME = 'csvTemplatesDb';
const DB_VERSION = 1;
const STORE = 'templates';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    }
  });
}

export async function getAllTemplates(): Promise<MappingTemplate[]> {
  const db = await getDB();
  const all = await db.getAll(STORE);
  db.close();
  return all.sort((a, b) => b.lastUsed - a.lastUsed);
}

export async function saveTemplate(
  name: string,
  headers: string[],
  mappings: ColumnMapping[]
): Promise<void> {
  const db = await getDB();
  const template: MappingTemplate = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    headers,
    mappings: mappings.map(m => ({ sourceColumn: m.sourceColumn, targetField: m.targetField })),
    createdAt: Date.now(),
    lastUsed: Date.now(),
    usedCount: 0
  };
  await db.put(STORE, template);
  db.close();
}

export async function touchTemplate(id: string): Promise<void> {
  const db = await getDB();
  const template = await db.get(STORE, id);
  if (template) {
    template.lastUsed = Date.now();
    template.usedCount = (template.usedCount ?? 0) + 1;
    await db.put(STORE, template);
  }
  db.close();
}

export async function removeTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE, id);
  db.close();
}
