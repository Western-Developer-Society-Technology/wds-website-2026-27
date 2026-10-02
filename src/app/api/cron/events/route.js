import { revalidatePath, revalidateTag } from "next/cache";
import { EVENT_CACHE_TAG } from "@/lib/events/config";
import { syncUpcomingEvents } from "@/lib/events/upcoming";

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
    const events = await syncUpcomingEvents();
    revalidateTag(EVENT_CACHE_TAG, { expire: 0 });
    revalidatePath("/events");
    return Response.json({ ok: true, eventCount: events.length }, { headers });
  } catch {
    console.error("Daily Luma refresh failed; the previous upcoming-event snapshot is retained.");
    return Response.json({ error: "Event refresh failed" }, { status: 503, headers });
  }
}
