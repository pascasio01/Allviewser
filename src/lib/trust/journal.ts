import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";
import { logActivity } from "../activity/log";

export type TrustClaimKind =
  | "hecho"
  | "accion"
  | "limite"
  | "pendiente"
  | "rol"
  | "evidencia"
  | "sesion";

export type TrustClaim = {
  kind: TrustClaimKind;
  text: string;
};

export type TrustJournalEntry = {
  id: string;
  at: string;
  projectId?: string;
  actorId?: string;
  actorRole?: string;
  title: string;
  summary: string;
  did: TrustClaim[];
  didNotClaim: TrustClaim[];
  pending: TrustClaim[];
  signedByRole?: string;
  source: "espacio" | "memoria" | "comercio" | "sistema" | "usuario";
  meta?: Record<string, unknown>;
};

async function journalFile(dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.trust, "journal.json");
}

export async function listTrustJournal(
  limit = 50,
  dataRoot?: string,
): Promise<TrustJournalEntry[]> {
  const file = await journalFile(dataRoot);
  const all = await readJsonFile<TrustJournalEntry[]>(file, []);
  return all.slice(0, limit);
}

export async function appendTrustEntry(
  input: Omit<TrustJournalEntry, "id" | "at"> & { at?: string },
  dataRoot?: string,
): Promise<TrustJournalEntry> {
  const file = await journalFile(dataRoot);
  const all = await readJsonFile<TrustJournalEntry[]>(file, []);
  const entry: TrustJournalEntry = {
    id: uuid(),
    at: input.at ?? new Date().toISOString(),
    projectId: input.projectId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    title: input.title,
    summary: input.summary,
    did: input.did,
    didNotClaim: input.didNotClaim,
    pending: input.pending,
    signedByRole: input.signedByRole,
    source: input.source,
    meta: input.meta,
  };
  all.unshift(entry);
  await writeJsonFile(file, all.slice(0, 500));
  await logActivity(
    {
      type: "trust.journal",
      projectId: entry.projectId,
      message: entry.title,
      meta: { entryId: entry.id, source: entry.source },
    },
    dataRoot,
  );
  return entry;
}

export async function exportTrustJournal(dataRoot?: string): Promise<TrustJournalEntry[]> {
  return listTrustJournal(500, dataRoot);
}


export { spaceActionContract, type ActionContract } from "./contracts";
