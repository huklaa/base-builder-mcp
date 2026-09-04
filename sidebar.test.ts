import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchAndUpdateSidebar,
  formatDocsNavigation,
  getSidebar,
} from "./sidebar.js";

test("uses a resolvable Base docs page for the initial fallback", () => {
  assert.equal(
    getSidebar(),
    [
      "Base docs navigation is temporarily unavailable.",
      "- https://docs.base.org/get-started/base",
    ].join("\n"),
  );
});

test("formats nested Base docs navigation", () => {
  const navigation = {
    tabs: [
      {
        tab: "Build",
        groups: [
          {
            group: "Get Started",
            pages: ["get-started/docs-mcp", "get-started/quickstart"],
          },
        ],
      },
    ],
  };

  assert.equal(
    formatDocsNavigation(navigation),
    [
      "Build",
      "  Get Started",
      "    - https://docs.base.org/get-started/docs-mcp",
      "    - https://docs.base.org/get-started/quickstart",
    ].join("\n"),
  );
});

test("normalizes root-relative and absolute Base docs page entries", () => {
  assert.equal(
    formatDocsNavigation([
      "/privacy-policy",
      "https://docs.base.org/terms-of-service",
      "https://example.com/not-docs",
    ]),
    [
      "- https://docs.base.org/privacy-policy",
      "- https://docs.base.org/terms-of-service",
    ].join("\n"),
  );
});

test("formats nested groups embedded inside pages", () => {
  const navigation = {
    tabs: [
      {
        tab: "Chain",
        groups: [
          {
            group: "Network Reference",
            pages: [
              "base-chain/quickstart/connecting-to-base",
              {
                group: "Bridges",
                pages: [
                  "base-chain/network-information/base-solana-bridge",
                  "base-chain/network-information/ecosystem-bridges",
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(
    formatDocsNavigation(navigation),
    [
      "Chain",
      "  Network Reference",
      "    - https://docs.base.org/base-chain/quickstart/connecting-to-base",
      "    Bridges",
      "      - https://docs.base.org/base-chain/network-information/base-solana-bridge",
      "      - https://docs.base.org/base-chain/network-information/ecosystem-bridges",
    ].join("\n"),
  );
});

test("keeps docs anchors and excludes unsupported external anchors", () => {
  const navigation = {
    tabs: [
      {
        tab: "Get Started",
        groups: [],
        global: {
          anchors: [
            {
              anchor: "Status",
              href: "https://status.base.org/",
            },
            {
              anchor: "Faucet",
              href: "https://docs.base.org/base-chain/network-information/network-faucets",
            },
          ],
        },
      },
    ],
  };

  assert.equal(
    formatDocsNavigation(navigation),
    [
      "Get Started",
      "  Faucet  https://docs.base.org/base-chain/network-information/network-faucets",
    ].join("\n"),
  );
});

test("keeps labeled docs links and excludes labeled external links", () => {
  const navigation = {
    global: {
      anchors: [
        {
          label: "Cookie Policy",
          href: "https://docs.base.org/cookie-policy",
        },
        {
          label: "GitHub",
          href: "https://github.com/base",
        },
      ],
    },
  };

  assert.equal(
    formatDocsNavigation(navigation),
    "Cookie Policy  https://docs.base.org/cookie-policy",
  );
});

test("ignores malformed nodes", () => {
  const navigation = [
    {
      group: "Tools",
      pages: ["tools/example", null, 42],
    },
  ];

  assert.equal(
    formatDocsNavigation(navigation),
    [
      "Tools",
      "  - https://docs.base.org/tools/example",
    ].join("\n"),
  );
});

test("returns an empty string when navigation is missing", () => {
  assert.equal(formatDocsNavigation(undefined), "");
});

test("refreshes sidebar content from the current docs config", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        navigation: {
          tabs: [
            {
              tab: "Build",
              groups: [
                {
                  group: "Quickstart",
                  pages: ["get-started/base"],
                },
              ],
            },
          ],
        },
      }),
      { status: 200 },
    );

  try {
    await fetchAndUpdateSidebar();
    assert.equal(
      getSidebar(),
      [
        "Build",
        "  Quickstart",
        "    - https://docs.base.org/get-started/base",
      ].join("\n"),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("restores the resolvable fallback when docs refresh fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("", { status: 500, statusText: "Internal Server Error" });

  try {
    await fetchAndUpdateSidebar();
    assert.equal(
      getSidebar(),
      [
        "Base docs navigation is temporarily unavailable.",
        "- https://docs.base.org/get-started/base",
      ].join("\n"),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
