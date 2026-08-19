const CURRENT_DOCS_CONFIG_URL =
  "https://raw.githubusercontent.com/base/docs/refs/heads/master/docs/docs.json";

// Avoid silently serving the legacy embedded base/web navigation when the live
// Base docs configuration cannot be fetched.
let sidebarContent =
  "Base docs navigation is temporarily unavailable. Use https://docs.base.org directly.";

export async function fetchAndUpdateSidebar() {
  try {
    const response = await fetch(CURRENT_DOCS_CONFIG_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Base docs config: ${response.status} ${response.statusText}`);
    }

    const docsConfig = await response.json();
    if (!docsConfig?.navigation) {
      throw new Error("Base docs config does not contain a navigation section");
    }

    // The prompt only needs the current navigation tree. Keeping the rest of
    // docs.json out avoids feeding redirects/theme configuration to the model.
    sidebarContent = JSON.stringify(docsConfig.navigation, null, 2);
    console.log("Successfully fetched current Base docs navigation");
  } catch (error) {
    console.error("Error fetching Base docs navigation:", error);
  }
}

export function getSidebar() {
  return sidebarContent;
}
