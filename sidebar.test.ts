import assert from "node:assert/strict";
import test from "node:test";

import { formatDocsNavigation } from "./sidebar.js";

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