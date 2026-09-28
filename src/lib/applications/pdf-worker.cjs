// This worker receives only PDF bytes, with an empty environment. QPDF's
// filesystem stays in memory: never mount NODEFS or provide document URLs.
const { parentPort, workerData } = require("node:worker_threads");
const silence = () => {};
let pageCount;
// This pinned build sends stdout to console.log rather than a print callback.
console.log = (line) => { pageCount = Number(String(line).trim()); };
console.error = silence;
console.warn = silence;
console.info = silence;
const createQpdf = require("@neslinesli93/qpdf-wasm");
const path = require("node:path");
const qpdfWasmPath = path.join(path.dirname(require.resolve("@neslinesli93/qpdf-wasm")), "qpdf.wasm");

const MAX_MEMORY = 128 * 1024 * 1024;
const grow = WebAssembly.Memory.prototype.grow;
// This pinned Emscripten build grows its heap through this host method.
WebAssembly.Memory.prototype.grow = function (pages) {
  if (this.buffer.byteLength + pages * 65536 > MAX_MEMORY) throw new RangeError("PDF memory limit");
  return grow.call(this, pages);
};

(async () => {
  let qpdf;
  try {
    qpdf = await createQpdf({ noInitialRun: true, locateFile: () => qpdfWasmPath });
  } catch {
    parentPort.postMessage("initialization");
    return;
  }
  try {
    qpdf.FS.writeFile("/resume.pdf", workerData);
    // Count pages only: do not inspect actions or decode image/content streams.
    const status = qpdf.callMain(["/resume.pdf", "--warning-exit-0", "--show-npages"]);
    parentPort.postMessage(status === 0 && Number.isInteger(pageCount) && pageCount > 0 && pageCount <= 10);
  } catch {
    parentPort.postMessage(false);
  }
})();
