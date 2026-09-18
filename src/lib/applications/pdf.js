import { Worker } from "node:worker_threads";
import path from "node:path";
import { MAX_RESUME_BYTES } from "./resume.js";
import { ApplicationError } from "./request.js";

const INVALID_PDF = "Please upload a valid, unencrypted PDF with up to 10 pages and no scripts, forms, or attachments. Try exporting your resume as a new PDF.";
// Run the traced source file: bundling this worker breaks QPDF's require.resolve.
const WORKER_PATH = path.join(process.cwd(), "src/lib/applications/pdf-worker.cjs");
export const MAX_PDF_WORKERS = 2;
let activeWorkers = 0;

export async function validatePdf(bytes) {
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES ||
      !/^%PDF-(1\.[0-7]|2\.0)[\r\n]/.test(bytes.subarray(0, 16).toString("latin1")) ||
      !/%%EOF[\t\r\n ]*$/.test(bytes.subarray(-1024).toString("latin1"))) {
    throw new ApplicationError(INVALID_PDF, 400, { resume: INVALID_PDF });
  }
  if (activeWorkers >= MAX_PDF_WORKERS) {
    throw new ApplicationError("PDF validation is busy. Please try again.", 503, {
      resume: "PDF validation is busy. Please try again.",
    });
  }

  activeWorkers += 1;
  try {
    const valid = await new Promise((resolve) => {
      let worker;
      let timer;
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const terminated = worker?.terminate();
        if (terminated) {
          terminated.then(
            () => resolve(result === true),
            () => resolve(false),
          );
        } else {
          resolve(result === true);
        }
      };
      try {
        worker = new Worker(`require(${JSON.stringify(WORKER_PATH)})`, {
          eval: true,
          workerData: bytes,
          env: {},
          execArgv: [],
          resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 },
        });
        timer = setTimeout(() => finish(false), 5000);
        worker.once("message", finish);
        worker.once("error", () => finish(false));
        worker.once("exit", () => finish(false));
      } catch {
        finish(false);
      }
    });
    if (!valid) throw new ApplicationError(INVALID_PDF, 400, { resume: INVALID_PDF });
  } finally {
    activeWorkers -= 1;
  }
}
