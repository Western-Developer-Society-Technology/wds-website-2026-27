// This worker receives only PDF bytes, with an empty environment. QPDF's
// filesystem stays in memory: never mount NODEFS or provide document URLs.
const { parentPort, workerData } = require("node:worker_threads");
const silence = () => {};
console.log = silence;
console.error = silence;
console.warn = silence;
console.info = silence;
const createQpdf = require("@neslinesli93/qpdf-wasm");
const path = require("node:path");
const qpdfWasmPath = path.join(path.dirname(require.resolve("@neslinesli93/qpdf-wasm")), "qpdf.wasm");

const MAX_MEMORY = 128 * 1024 * 1024;
const MAX_OUTPUT = 8 * 1024 * 1024;
const grow = WebAssembly.Memory.prototype.grow;
// This pinned Emscripten build grows its heap through this host method.
WebAssembly.Memory.prototype.grow = function (pages) {
  if (this.buffer.byteLength + pages * 65536 > MAX_MEMORY) throw new RangeError("PDF memory limit");
  return grow.call(this, pages);
};

const forbiddenKeys = new Set([
  "/JS", "/JavaScript", "/AA", "/OpenAction", "/AcroForm", "/XFA",
  "/EmbeddedFiles", "/EF", "/AF", "/RichMediaContent", "/RichMediaSettings",
  "/Collection", "/Launch", "/PA", "/PresSteps",
]);
const forbiddenTypes = new Set(["/EmbeddedFile", "/Filespec"]);
const forbiddenAnnotations = new Set(["/FileAttachment", "/RichMedia", "/Movie", "/Sound", "/Screen", "/3D", "/Widget"]);
const forbiddenActions = new Set(["/JavaScript", "/Launch", "/GoToR", "/GoToE", "/SubmitForm", "/ImportData", "/Rendition", "/Movie", "/Sound"]);

function inspect(document) {
  if (document.encrypt?.encrypted || !document.pages?.length || document.pages.length > 10) return false;
  const objects = document.qpdf?.[1];
  if (!objects || Object.keys(objects).length > 10_000) return false;
  const resolve = (value) => {
    // Follow indirect scalar/dictionary references, but reject cycles.
    const seen = new Set();
    while (typeof value === "string" && /^\d+ \d+ R$/.test(value)) {
      if (seen.has(value) || seen.size > 32) throw new Error("Invalid reference");
      seen.add(value);
      const object = objects[`obj:${value}`];
      if (!object || object.stream) throw new Error("Invalid reference");
      value = object.value;
    }
    return value;
  };
  const pending = [{ value: objects, depth: 0 }];
  let visited = 0;
  while (pending.length) {
    const { value, depth } = pending.pop();
    if (++visited > 100_000 || depth > 64) return false;
    if (!value || typeof value !== "object") continue;
    if (!Array.isArray(value)) {
      if (Object.keys(value).some((key) => forbiddenKeys.has(key))) return false;
      if (forbiddenTypes.has(resolve(value["/Type"])) || forbiddenAnnotations.has(resolve(value["/Subtype"]))) return false;
      if (forbiddenActions.has(resolve(value["/S"]))) return false;
      // /S also occurs in non-action dictionaries; check actual action entries.
      if (value["/A"] !== undefined || resolve(value["/Type"]) === "/Action") {
        const action = resolve(value["/A"] ?? value);
        const kind = resolve(action?.["/S"]);
        if (!["/URI", "/GoTo"].includes(kind)) return false;
      }
      if (value["/URI"] !== undefined) {
        const uri = resolve(value["/URI"]);
        if (typeof uri !== "string" || !uri.startsWith("u:")) return false;
        const url = new URL(uri.slice(2));
        if (!["https:", "http:", "mailto:"].includes(url.protocol) || url.username || url.password) return false;
      }
      // External stream sources can make readers access other files.
      if (value.stream?.dict?.["/F"] !== undefined) return false;
    }
    for (const child of Object.values(value)) pending.push({ value: child, depth: depth + 1 });
  }
  return true;
}

(async () => {
  try {
    const qpdf = await createQpdf({ noInitialRun: true, locateFile: () => qpdfWasmPath });
    const write = qpdf.FS.write;
    qpdf.FS.write = function (stream, buffer, offset, length, position, ...rest) {
      if ((position ?? stream.position) + length > MAX_OUTPUT) throw new Error("PDF output limit");
      return write.call(this, stream, buffer, offset, length, position, ...rest);
    };
    qpdf.FS.writeFile("/resume.pdf", workerData);
    if (qpdf.callMain(["/resume.pdf", "--suppress-recovery", "--check"]) !== 0) {
      parentPort.postMessage(false);
      return;
    }
    const status = qpdf.callMain([
      // Include decoded streams so the output cap also catches compression bombs.
      "/resume.pdf", "--suppress-recovery", "--json=2", "--json-stream-data=inline", "--decode-level=generalized",
      "--json-key=qpdf", "--json-key=pages", "--json-key=encrypt", "/document.json",
    ]);
    parentPort.postMessage(status === 0 && inspect(JSON.parse(qpdf.FS.readFile("/document.json", { encoding: "utf8" }))));
  } catch {
    parentPort.postMessage(false);
  }
})();
