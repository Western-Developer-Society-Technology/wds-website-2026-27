import { submitApplication } from "@/lib/applications/submit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  return submitApplication(request);
}
