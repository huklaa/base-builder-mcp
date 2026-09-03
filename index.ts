import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import "dotenv/config";
import { getGuide} from "./tools.js";
import { getGuideParams } from "./params.js";
import { fetchAndUpdateSidebar } from "./sidebar.js";

// Initialize the server
const server = new McpServer({
  name: "docs-mcp",
  version: "1.0.0",
});

// Fetch sidebar before starting the server
await fetchAndUpdateSidebar();

server.tool(
  "BuildOnBase",
  "If the user tells you I want to build on Base, this means that the user wants to use this tool which connects the user to Base docs. If you run this tool and you get an error because the guide is not found, try other guides from the sidebar.",
  getGuideParams.shape,
  getGuide
);
const transport = new StdioServerTransport();
server.connect(transport);
