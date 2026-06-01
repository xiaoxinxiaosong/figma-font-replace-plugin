import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const code = await readFile(resolve(root, "dist/code.js"), "utf8");

function makeTextNode(id, segments) {
  let currentSegments = segments.map((segment) => ({ ...segment }));
  return {
    id,
    type: "TEXT",
    name: id,
    visible: true,
    characters: currentSegments.map((segment) => segment.characters).join(""),
    getStyledTextSegments(fields, start, end) {
      void fields;
      void start;
      void end;
      let cursor = 0;
      return currentSegments.map((segment) => {
        const from = cursor;
        cursor += segment.characters.length;
        return {
          start: from,
          end: cursor,
          characters: segment.characters,
          fontName: segment.fontName
        };
      });
    },
    async getRangeAllFontNames(start, end) {
      void start;
      void end;
      return currentSegments.map((segment) => segment.fontName);
    },
    setRangeFontName(start, end, fontName) {
      let cursor = 0;
      currentSegments = currentSegments.map((segment) => {
        const from = cursor;
        cursor += segment.characters.length;
        if (start <= from && end >= cursor) {
          return { ...segment, fontName };
        }
        return segment;
      });
    }
  };
}

const textNode = makeTextNode("title-text", [
  { characters: "Hello", fontName: { family: "Inter", style: "Regular" } },
  { characters: " World", fontName: { family: "Inter", style: "Bold" } }
]);

const frameNode = {
  id: "frame-1",
  type: "FRAME",
  name: "Frame 1",
  visible: true,
  children: [textNode]
};

textNode.parent = frameNode;

const pageNode = {
  id: "page-1",
  name: "Page 1",
  children: [frameNode],
  selection: [frameNode]
};

frameNode.parent = pageNode;

const availableFonts = [
  { fontName: { family: "Inter", style: "Regular" } },
  { fontName: { family: "Inter", style: "Bold" } },
  { fontName: { family: "PingFang SC", style: "Regular" } }
];

const notifications = [];
const postedMessages = [];
const loadedFonts = [];
const eventHandlers = new Map();

const figma = {
  showUI() {},
  closePlugin() {},
  notify(message) {
    notifications.push(message);
    return { cancel() {} };
  },
  on(eventName, handler) {
    eventHandlers.set(eventName, handler);
  },
  listAvailableFontsAsync: async () => availableFonts,
  loadFontAsync: async (fontName) => {
    loadedFonts.push(`${fontName.family}/${fontName.style}`);
  },
  currentPage: pageNode,
  ui: {
    postMessage(message) {
      postedMessages.push(message);
    },
    onmessage: null
  }
};

const context = {
  figma,
  console,
  setTimeout,
  clearTimeout
};

vm.createContext(context);
vm.runInContext(code, context);

if (typeof figma.ui.onmessage !== "function") {
  throw new Error("figma.ui.onmessage was not initialized");
}

await figma.ui.onmessage({ type: "get-state" });
await figma.ui.onmessage({
  type: "replace-fonts",
  sourceFamily: "Inter",
  targetFamily: "PingFang SC"
});

const refreshMessage = postedMessages.find((message) => message.type === "state-loaded");
const successMessage = postedMessages.find((message) => message.type === "replace-success");

if (!refreshMessage) {
  throw new Error("state-loaded was not posted");
}

if (!successMessage) {
  throw new Error("replace-success was not posted");
}

const replacedFonts = await textNode.getRangeAllFontNames(0, textNode.characters.length);

if (!replacedFonts.every((font) => font.family === "PingFang SC" && font.style === "Regular")) {
  throw new Error("text segments were not fully replaced");
}

if (loadedFonts.length !== 2) {
  throw new Error(`expected to load target font twice, received ${loadedFonts.length}`);
}

console.log("plugin runtime smoke ok");
