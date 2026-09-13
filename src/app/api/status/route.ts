import { NextResponse } from "next/server";
import { probeMediaModules } from "@/lib/media/modules";
import { remoteStatus, remoteServiceContract } from "@/lib/remote/continuity";
import { loadConfig } from "@/lib/config/store";
import { evolutionProcess, listIssues } from "@/lib/evolution/process";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json({
    brand,
    media: probeMediaModules(),
    remote: {
      ...remoteServiceContract,
      status: remoteStatus(config.remoteContinuity.enabled, config.remoteContinuity.endpoint),
    },
    evolution: { process: evolutionProcess, issues: await listIssues() },
    offlineCapable: true,
  });
}
