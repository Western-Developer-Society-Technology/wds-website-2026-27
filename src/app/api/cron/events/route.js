import { revalidatePath, revalidateTag } from "next/cache";
import { EVENT_CACHE_TAG } from "@/lib/events/config";
import { syncLumaEvents } from "@/lib/events/directory";
import { splitLumaEvents } from "@/lib/events/timeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const headers = { "Cache-Control": "no-store" };

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { events, archiveStatus } = await syncLumaEvents({
      onSaved() {
        revalidateTag(EVENT_CACHE_TAG, { expire: 0 });
        revalidatePath("/events");
      },
    });
    const { upcomingEvents, pastEvents } = splitLumaEvents(events);
    return Response.json({
      ok: true, eventCount: events.length,
      upcomingCount: upcomingEvents.length, pastCount: pastEvents.length,
      archiveStatus,
    }, { headers });
  } catch {
    console.error("Daily Luma refresh failed; the last successful event snapshot remains available.");
    return Response.json({ error: "Event refresh failed" }, { status: 503, headers });
  }
}
