// Collects the hand-written Daftra tools (clients, invoices, finance, HR, ...) so the MCP
// server can expose them next to the generic catalog tools. First definition of a name wins.
import type { McpTool } from "../types.ts";
import { clientTools } from "./clients.ts";
import { invoiceTools } from "./invoices.ts";
import { financeTools } from "./finance.ts";
import { hrTools } from "./hr.ts";
import { inventoryTools } from "./inventory.ts";
import { productsFinanceTools } from "./products-finance.ts";
import { purchaseTools } from "./purchases.ts";
import { workOrderTools } from "./work-orders.ts";

const all = [
  ...clientTools,
  ...invoiceTools,
  ...financeTools,
  ...hrTools,
  ...inventoryTools,
  ...productsFinanceTools,
  ...purchaseTools,
  ...workOrderTools,
] as McpTool[];

const seen = new Set<string>();
export const LEGACY_TOOLS: McpTool[] = all.filter((tool) => {
  if (seen.has(tool.name)) return false;
  seen.add(tool.name);
  return true;
});
