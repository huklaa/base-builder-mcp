const FALLBACK_NAVIGATION = [
  "Base docs navigation is temporarily unavailable.",
  "- https://docs.base.org/get-started/base",
].join("\n");

let sidebarContent = FALLBACK_NAVIGATION;

type DocsNavigationNode = {
  tab?: string;
  group?: string;
  anchor?: string;
  label?: string;
  href?: string;
  pages?: unknown[];
  groups?: unknown[];
  tabs?: unknown[];
  global?: unknown;
  anchors?: unknown[];
  [key: string]: unknown;
};

function formatNavigation(value: unknown, depth = 0): string[] {
  if (typeof value === "string") {
    return [`${"  ".repeat(depth)}- https://docs.base.org/${value}`];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => formatNavigation(item, depth));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const node = value as DocsNavigationNode;

  // The MCP guideLink parameter only accepts Base documentation URLs. Current
  // Mintlify navigation also contains external destinations such as Status,
  // Blog, Explorer, and GitHub; advertising those as guide choices can make the
  // model select a URL that getGuide cannot resolve.
  if (
    typeof node.href === "string" &&
    !node.href.startsWith("https://docs.base.org/")
  ) {
    return [];
  }

  const label =
    typeof node.tab === "string"
      ? node.tab
      : typeof node.group === "string"
        ? node.group
        : typeof node.anchor === "string"
          ? node.anchor
          : typeof node.label === "string"
            ? node.label
            : null;

  const lines: string[] = [];
  const childDepth = label ? depth + 1 : depth;

  if (label) {
    const suffix = typeof node.href === "string" ? `  ${node.href}` : "";
    lines.push(`${"  ".repeat(depth)}${label}${suffix}`);
  }

  for (const key of ["tabs", "groups", "pages", "global", "anchors"] as const) {
    if (node[key]) {
      lines.push(...formatNavigation(node[key], childDepth));
    }
  }

  return lines;
}

export function formatDocsNavigation(navigation: unknown) {
  return formatNavigation(navigation).join("\n");
}

export async function fetchAndUpdateSidebar() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/base/docs/refs/heads/master/docs/docs.json",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch docs navigation: ${response.statusText}`);
    }

    const config = (await response.json()) as { navigation?: unknown };
    const formatted = formatDocsNavigation(config.navigation);

    if (!formatted.trim()) {
      throw new Error("Base docs navigation is empty");
    }

    sidebarContent = formatted;
    console.error("Successfully refreshed sidebar from base/docs docs.json");
  } catch (error) {
    sidebarContent = FALLBACK_NAVIGATION;
    console.error("Error refreshing Base docs navigation:", error);
  }
}

export function getSidebar() {
  return sidebarContent;
}
