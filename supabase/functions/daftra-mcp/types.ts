export type Dict = Record<string, unknown>;
export interface Operation { id:string; m:string; p:string; s:string; t:string; module:string; params:Array<{n:string; in:string; r:boolean; d:string; schema?:unknown}>; body?:unknown }
export type ToolResult = { content: Array<{type:"text";text:string}>; isError:boolean };
export const toolResult = (value:unknown,isError=false): ToolResult => ({content:[{type:"text",text:typeof value==="string"?value:JSON.stringify(value)}],isError});
export const isObject = (v:unknown):v is Dict => v !== null && typeof v === "object" && !Array.isArray(v);
/** Hand-written tool shape used by the older modules (clients.ts, hr.ts, ...). */
// deno-lint-ignore no-explicit-any
export type LegacyArgs = Record<string, any>;
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Dict;
  handler: (args: LegacyArgs) => Promise<ToolResult>;
}
