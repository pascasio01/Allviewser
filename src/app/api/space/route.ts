import { NextResponse } from "next/server";
import {
  SAMPLE_CHECKLIST_EXTENSION,
  acquireObjectLock,
  addVisitComment,
  askAssistant,
  assignIncident,
  attachEvidence,
  confirmDraft,
  correctDecision,
  createDraft,
  createIncident,
  deleteDecision,
  discardDraft,
  getObject,
  getSpaceModuleInfo,
  getSpaceSnapshot,
  installExtension,
  issuePassport,
  listActors,
  listIncidents,
  listObjects,
  listPlaces,
  listTimeline,
  recordDecision,
  recordDemoReset,
  releaseObjectLock,
  runMaintenanceDemoFlow,
  spaceFeatureFlags,
  transitionIncident,
  uninstallExtension,
  updateDraftObject,
  upsertPresence,
} from "@/lib/space";
import type { EvidenceKind, ExtensionManifest, IncidentStatus, MutableProps } from "@/lib/space";

export const runtime = "nodejs";

function err(e: unknown, status = 400) {
  return NextResponse.json(
    { error: e instanceof Error ? e.message : String(e) },
    { status },
  );
}

export async function GET(req: Request) {
  try {
    if (!spaceFeatureFlags.enabled) {
      return NextResponse.json({ error: "Módulo de espacio desactivado." }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") ?? "snapshot";

    switch (action) {
      case "info":
        return NextResponse.json({ module: getSpaceModuleInfo() });
      case "snapshot":
        return NextResponse.json(await getSpaceSnapshot());
      case "places":
        return NextResponse.json({ places: await listPlaces() });
      case "objects":
        return NextResponse.json({
          objects: await listObjects(searchParams.get("placeId") ?? undefined),
        });
      case "object": {
        const id = searchParams.get("id");
        if (!id) return err("id requerido");
        return NextResponse.json({ object: await getObject(id) });
      }
      case "actors":
        return NextResponse.json({ actors: await listActors() });
      case "incidents":
        return NextResponse.json({
          incidents: await listIncidents(searchParams.get("placeId") ?? undefined),
        });
      case "timeline":
        return NextResponse.json({
          timeline: await listTimeline(searchParams.get("placeId") ?? undefined),
        });
      case "assistant": {
        const objectId = searchParams.get("objectId");
        const question = searchParams.get("q") ?? "";
        const object = objectId ? await getObject(objectId) : null;
        return NextResponse.json({ reply: askAssistant({ object, question }) });
      }
      case "sample-extension":
        return NextResponse.json({ manifest: SAMPLE_CHECKLIST_EXTENSION });
      default:
        return err(`Acción GET desconocida: ${action}`);
    }
  } catch (e) {
    return err(e, 500);
  }
}

export async function POST(req: Request) {
  try {
    if (!spaceFeatureFlags.enabled) {
      return NextResponse.json({ error: "Módulo de espacio desactivado." }, { status: 503 });
    }
    const body = (await req.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    switch (action) {
      case "create_incident":
        return NextResponse.json({
          incident: await createIncident({
            actorId: String(body.actorId),
            objectId: String(body.objectId),
            title: String(body.title ?? ""),
            description: String(body.description ?? ""),
            idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey) : undefined,
            asDraft: Boolean(body.asDraft),
          }),
        });
      case "assign_incident":
        return NextResponse.json({
          incident: await assignIncident({
            actorId: String(body.actorId),
            incidentId: String(body.incidentId),
            assigneeId: String(body.assigneeId),
            expectedRevision:
              typeof body.expectedRevision === "number" ? body.expectedRevision : undefined,
          }),
        });
      case "attach_evidence":
        return NextResponse.json({
          evidence: await attachEvidence({
            actorId: String(body.actorId),
            incidentId: String(body.incidentId),
            kind: body.kind as EvidenceKind,
            title: String(body.title ?? ""),
            body: String(body.body ?? ""),
            eventAt: body.eventAt ? String(body.eventAt) : undefined,
            capturedAt: body.capturedAt ? String(body.capturedAt) : undefined,
            demoAssetLabel: body.demoAssetLabel ? String(body.demoAssetLabel) : undefined,
          }),
        });
      case "transition_incident":
        return NextResponse.json({
          incident: await transitionIncident({
            actorId: String(body.actorId),
            incidentId: String(body.incidentId),
            to: body.to as IncidentStatus,
            note: body.note ? String(body.note) : undefined,
            expectedRevision:
              typeof body.expectedRevision === "number" ? body.expectedRevision : undefined,
          }),
        });
      case "run_demo_flow":
        return NextResponse.json(
          await runMaintenanceDemoFlow({
            idempotencyKey: body.idempotencyKey ? String(body.idempotencyKey) : undefined,
          }),
        );
      case "create_draft":
        return NextResponse.json({
          draft: await createDraft({
            actorId: String(body.actorId),
            placeId: body.placeId ? String(body.placeId) : undefined,
            name: String(body.name ?? "Borrador"),
          }),
        });
      case "update_draft_object":
        return NextResponse.json({
          draft: await updateDraftObject({
            actorId: String(body.actorId),
            draftId: String(body.draftId),
            objectId: String(body.objectId),
            props: (body.props ?? {}) as MutableProps,
          }),
        });
      case "confirm_draft":
        return NextResponse.json(
          await confirmDraft({
            actorId: String(body.actorId),
            draftId: String(body.draftId),
          }),
        );
      case "discard_draft":
        return NextResponse.json({
          draft: await discardDraft({
            actorId: String(body.actorId),
            draftId: String(body.draftId),
          }),
        });
      case "record_decision":
        return NextResponse.json({
          decision: await recordDecision({
            actorId: String(body.actorId),
            placeId: body.placeId ? String(body.placeId) : undefined,
            objectId: body.objectId ? String(body.objectId) : undefined,
            incidentId: body.incidentId ? String(body.incidentId) : undefined,
            decision: String(body.decision ?? ""),
            rationale: String(body.rationale ?? ""),
            discardedAlternative: body.discardedAlternative
              ? String(body.discardedAlternative)
              : undefined,
            observedOutcome: body.observedOutcome ? String(body.observedOutcome) : undefined,
            source: body.source as "humana_aprobada" | "sugerencia_asistente" | "sistema",
          }),
        });
      case "correct_decision":
        return NextResponse.json({
          decision: await correctDecision({
            actorId: String(body.actorId),
            decisionId: String(body.decisionId),
            decision: body.decision ? String(body.decision) : undefined,
            rationale: body.rationale ? String(body.rationale) : undefined,
            observedOutcome:
              body.observedOutcome !== undefined ? String(body.observedOutcome) : undefined,
          }),
        });
      case "delete_decision":
        return NextResponse.json({
          decision: await deleteDecision({
            actorId: String(body.actorId),
            decisionId: String(body.decisionId),
            retentionNote: body.retentionNote ? String(body.retentionNote) : undefined,
          }),
        });
      case "issue_passport":
        return NextResponse.json({
          passport: await issuePassport({
            actorId: String(body.actorId),
            placeId: String(body.placeId),
            objective: String(body.objective ?? ""),
            modifiedElementIds: (body.modifiedElementIds as string[]) ?? [],
            sourcesUsed: (body.sourcesUsed as string[]) ?? [],
            testsRun: (body.testsRun as string[]) ?? [],
            limitations: (body.limitations as string[]) ?? [],
            acceptanceCriteria: (body.acceptanceCriteria as string[]) ?? [],
            linkedIncidentId: body.linkedIncidentId ? String(body.linkedIncidentId) : undefined,
            markApproved: Boolean(body.markApproved),
          }),
        });
      case "upsert_presence":
        return NextResponse.json({
          visit: await upsertPresence({
            actorId: String(body.actorId),
            x: Number(body.x ?? 50),
            y: Number(body.y ?? 50),
            selectedObjectId: body.selectedObjectId
              ? String(body.selectedObjectId)
              : undefined,
          }),
        });
      case "visit_comment":
        return NextResponse.json({
          comment: await addVisitComment({
            actorId: String(body.actorId),
            body: String(body.body ?? ""),
            objectId: body.objectId ? String(body.objectId) : undefined,
            x: Number(body.x ?? 50),
            y: Number(body.y ?? 50),
          }),
        });
      case "lock_object":
        return NextResponse.json({
          locks: await acquireObjectLock({
            actorId: String(body.actorId),
            objectId: String(body.objectId),
          }),
        });
      case "unlock_object":
        return NextResponse.json({
          locks: await releaseObjectLock({
            actorId: String(body.actorId),
            objectId: String(body.objectId),
          }),
        });
      case "install_extension":
        return NextResponse.json({
          extension: await installExtension({
            actorId: String(body.actorId),
            manifest: (body.manifest as ExtensionManifest) ?? SAMPLE_CHECKLIST_EXTENSION,
            placeId: body.placeId ? String(body.placeId) : undefined,
          }),
        });
      case "uninstall_extension":
        return NextResponse.json({
          extensions: await uninstallExtension({
            actorId: String(body.actorId),
            extensionId: String(body.extensionId),
            placeId: body.placeId ? String(body.placeId) : undefined,
          }),
        });
      case "reset_demo":
        return NextResponse.json({
          state: await recordDemoReset(String(body.actorId ?? "actor-admin")),
        });
      default:
        return err(`Acción POST desconocida: ${action}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(e, /conflicto/i.test(msg) ? 409 : 400);
  }
}
