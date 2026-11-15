import "server-only";
import { config, demo } from "../config";
import { MemoryStore } from "./memory";
import { SupabaseStore } from "./supabase";
import type { Store } from "./types";

// Next.js bundles each route separately, so a module-level variable would give
// every route its own copy. Keep one instance per process on globalThis.
const g = globalThis as typeof globalThis & { __jobfitStore?: Store };

export function getStore(): Store {
  if (!g.__jobfitStore) {
    g.__jobfitStore = demo.db
      ? new MemoryStore()
      : new SupabaseStore(config.supabaseUrl!, config.supabaseServiceKey!);
  }
  return g.__jobfitStore;
}

export type { Store } from "./types";
