import { UI_HTML } from "./generated/ui-inline";

type ScopeMode = "selection" | "page";
type FrameLikeNode = BaseNode & {
  id: string;
  type: "FRAME";
};

type FontFamilyInventory = {
  family: string;
  count: number;
  styles: Array<{
    style: string;
    count: number;
  }>;
};

type AvailableFontFamily = {
  family: string;
  styles: string[];
};

type ScopeStats = {
  textNodeCount: number;
  segmentCount: number;
  fontCount: number;
};

type PluginStatePayload = {
  availableFonts: AvailableFontFamily[];
  inventoryFonts: FontFamilyInventory[];
  scopeStats: ScopeStats;
};

type PluginMessage =
  | {
      type: "get-state";
    }
  | {
      type: "replace-fonts";
      sourceFamily: string;
      targetFamily: string;
    };

const UI_WIDTH = 360;
const UI_HEIGHT = 720;
figma.showUI(UI_HTML, {
  width: UI_WIDTH,
  height: UI_HEIGHT,
  themeColors: true
});

function postState(payload: PluginStatePayload) {
  figma.ui.postMessage({
    type: "state-loaded",
    payload
  });
}

function postError(message: string) {
  figma.ui.postMessage({
    type: "error",
    message
  });
}

async function buildEmptyPluginState(): Promise<PluginStatePayload> {
  let availableFonts: AvailableFontFamily[] = [];
  try {
    availableFonts = await getAvailableFonts();
  } catch (error) {
    void error;
    availableFonts = [];
  }

  return {
    availableFonts,
    inventoryFonts: [],
    scopeStats: {
      textNodeCount: 0,
      segmentCount: 0,
      fontCount: 0
    }
  };
}

function asFontName(fontName: FontName | PluginAPI["mixed"]): FontName | null {
  return fontName === figma.mixed ? null : fontName;
}

function sortFamilies<T extends { family: string }>(families: T[]) {
  return families.sort((left, right) => left.family.localeCompare(right.family, "zh-Hans-CN"));
}

async function getAvailableFonts() {
  const fonts = await figma.listAvailableFontsAsync();
  const fontMap = new Map<string, Set<string>>();

  for (const item of fonts) {
    const { family, style } = item.fontName;
    if (!fontMap.has(family)) {
      fontMap.set(family, new Set());
    }
    fontMap.get(family)?.add(style);
  }

  return sortFamilies(
    Array.from(fontMap.entries()).map(([family, styles]) => ({
      family,
      styles: Array.from(styles).sort((left, right) => left.localeCompare(right, "en"))
    }))
  );
}

function getScopeRoots(scope: ScopeMode) {
  if (scope === "selection") {
    if (!figma.currentPage.selection.length) {
      throw new Error("Select at least one frame, or select any layer inside a frame.");
    }

    const frameMap = new Map<string, FrameLikeNode>();

    for (const selectedNode of figma.currentPage.selection) {
      let currentNode: BaseNode | null = selectedNode;

      while (currentNode) {
        if (currentNode.type === "FRAME") {
          frameMap.set(currentNode.id, currentNode as FrameLikeNode);
          break;
        }

        currentNode = currentNode.parent;
      }
    }

    if (!frameMap.size) {
      throw new Error("The current selection is not inside a frame. Select at least one frame, or any layer inside a frame.");
    }

    return Array.from(frameMap.values());
  }

  return [figma.currentPage];
}

function collectTextNodes(scope: ScopeMode) {
  const roots = getScopeRoots(scope);
  const nodes: TextNode[] = [];

  function visit(node: BaseNode) {
    if ("visible" in node && node.visible === false) {
      return;
    }

    if (node.type === "TEXT") {
      nodes.push(node);
      return;
    }

    if ("children" in node) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  for (const root of roots) {
    visit(root);
  }

  return nodes;
}

async function collectFontInventory(textNodes: TextNode[]) {
  const familyMap = new Map<string, Map<string, number>>();
  let segmentCount = 0;

  for (const node of textNodes) {
    const segments = node.getStyledTextSegments(["fontName"]);
    for (const segment of segments) {
      const fontName = asFontName(segment.fontName);
      if (!fontName) {
        continue;
      }

      segmentCount += 1;
      if (!familyMap.has(fontName.family)) {
        familyMap.set(fontName.family, new Map());
      }

      const styleMap = familyMap.get(fontName.family)!;
      styleMap.set(fontName.style, (styleMap.get(fontName.style) || 0) + 1);
    }
  }

  const inventoryFonts = sortFamilies(
    Array.from(familyMap.entries()).map(([family, styleMap]) => ({
      family,
      count: Array.from(styleMap.values()).reduce((sum, count) => sum + count, 0),
      styles: Array.from(styleMap.entries())
        .map(([style, count]) => ({ style, count }))
        .sort((left, right) => left.style.localeCompare(right.style, "en"))
    }))
  );

  return {
    inventoryFonts,
    scopeStats: {
      textNodeCount: textNodes.length,
      segmentCount,
      fontCount: inventoryFonts.length
    }
  };
}

async function buildPluginState(scope: ScopeMode): Promise<PluginStatePayload> {
  const [availableFonts, textNodes] = await Promise.all([getAvailableFonts(), Promise.resolve(collectTextNodes(scope))]);
  const inventory = await collectFontInventory(textNodes);

  return {
    availableFonts,
    inventoryFonts: inventory.inventoryFonts,
    scopeStats: inventory.scopeStats
  };
}

function chooseTargetFont(
  availableFonts: AvailableFontFamily[],
  sourceFont: FontName,
  targetFamily: string
) {
  const family = availableFonts.find((item) => item.family === targetFamily);
  if (!family || !family.styles.length) {
    return null;
  }

  if (family.styles.includes(sourceFont.style)) {
    return {
      family: targetFamily,
      style: sourceFont.style
    };
  }

  if (family.styles.includes("Regular")) {
    return {
      family: targetFamily,
      style: "Regular"
    };
  }

  return {
    family: targetFamily,
    style: family.styles[0]
  };
}

async function replaceFonts(message: Extract<PluginMessage, { type: "replace-fonts" }>) {
  const textNodes = collectTextNodes("selection");
  if (!textNodes.length) {
    throw new Error("No replaceable text nodes were found in the selected frame range.");
  }

  const availableFonts = await getAvailableFonts();
  if (!availableFonts.some((item) => item.family === message.targetFamily)) {
    throw new Error("The target font does not exist. Select an available font from the list.");
  }

  let replacedSegmentCount = 0;
  let updatedTextNodeCount = 0;

  for (const node of textNodes) {
    const segments = node.getStyledTextSegments(["fontName"]);
    let nodeUpdated = false;

    for (const segment of segments) {
      const fontName = asFontName(segment.fontName);
      if (!fontName) {
        continue;
      }

      if (!message.sourceFamily || fontName.family !== message.sourceFamily) {
        continue;
      }

      const targetFont = chooseTargetFont(availableFonts, fontName, message.targetFamily);
      if (!targetFont) {
        continue;
      }

      await figma.loadFontAsync(targetFont);
      node.setRangeFontName(segment.start, segment.end, targetFont);
      replacedSegmentCount += 1;
      nodeUpdated = true;
    }

    if (nodeUpdated) {
      updatedTextNodeCount += 1;
    }
  }

  if (!replacedSegmentCount) {
    throw new Error("The selected frame range does not contain the source font you chose, or the target font has no compatible style.");
  }

  figma.notify(`Replaced ${replacedSegmentCount} font segments`);
  figma.ui.postMessage({
    type: "replace-success",
    payload: {
      replacedSegmentCount,
      updatedTextNodeCount
    }
  });
}

async function syncSelectionState() {
  try {
    const payload = await buildPluginState("selection");
    postState(payload);
  } catch (error) {
    const fallback = await buildEmptyPluginState();
    postState(fallback);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    postError(errorMessage);
  }
}

figma.on("selectionchange", () => {
  void syncSelectionState();
});

figma.ui.onmessage = async (message: PluginMessage) => {
  try {
    if (!message || typeof message !== "object" || !("type" in message)) {
      return;
    }

    if (message.type === "get-state") {
      await syncSelectionState();
      return;
    }

    if (message.type === "replace-fonts") {
      await replaceFonts(message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    figma.notify(errorMessage, { error: true });
    postError(errorMessage);
  }
};
