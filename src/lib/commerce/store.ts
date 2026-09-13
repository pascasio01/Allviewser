import fs from "node:fs/promises";
import path from "node:path";
import { getDataRoot } from "../paths";
import type { CommerceState } from "./types";
import { demoBusiness, demoProducts, demoStaff } from "./seed";

export function commerceDir(dataRoot?: string): string {
  return path.join(getDataRoot(dataRoot), "commerce");
}

function stateFile(dataRoot?: string): string {
  return path.join(commerceDir(dataRoot), "state.json");
}

export function createInitialState(): CommerceState {
  return {
    businesses: [structuredClone(demoBusiness)],
    products: structuredClone(demoProducts),
    staff: structuredClone(demoStaff),
    carts: [],
    orders: [],
    audit: [],
    processedIdempotencyKeys: [],
    processedWebhookEvents: [],
  };
}

export async function loadCommerceState(dataRoot?: string): Promise<CommerceState> {
  const file = stateFile(dataRoot);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as CommerceState;
  } catch {
    const initial = createInitialState();
    await saveCommerceState(initial, dataRoot);
    return initial;
  }
}

export async function saveCommerceState(state: CommerceState, dataRoot?: string): Promise<void> {
  const dir = commerceDir(dataRoot);
  await fs.mkdir(dir, { recursive: true });
  const file = stateFile(dataRoot);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function resetCommerceDemo(dataRoot?: string): Promise<CommerceState> {
  const state = createInitialState();
  await saveCommerceState(state, dataRoot);
  return state;
}
