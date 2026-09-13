import fs from "node:fs/promises";
import path from "node:path";
import { getDataRoot } from "../paths";
import type { SpaceState } from "./types";
import { createInitialSpaceState } from "./seed";

export function spaceDir(dataRoot?: string): string {
  return path.join(getDataRoot(dataRoot), "space");
}

function stateFile(dataRoot?: string): string {
  return path.join(spaceDir(dataRoot), "state.json");
}

export async function loadSpaceState(dataRoot?: string): Promise<SpaceState> {
  const file = stateFile(dataRoot);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as SpaceState;
  } catch {
    const initial = createInitialSpaceState();
    await saveSpaceState(initial, dataRoot);
    return initial;
  }
}

export async function saveSpaceState(state: SpaceState, dataRoot?: string): Promise<void> {
  const dir = spaceDir(dataRoot);
  await fs.mkdir(dir, { recursive: true });
  const file = stateFile(dataRoot);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function resetSpaceDemo(dataRoot?: string): Promise<SpaceState> {
  const state = createInitialSpaceState();
  await saveSpaceState(state, dataRoot);
  return state;
}
