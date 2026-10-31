/**
 * The editor's side of the conversation with the website's edit bridge
 * (src/components/dev/bridge-core.ts in the site). Pure, so it can be tested.
 */
import { resolve, type Cand, type Entry, type Resolved } from "./inspect";

export interface BridgeMessage {
  source: "lnx-bridge";
  type: "ready" | "path" | "hover" | "click";
  id?: number;
  path?: string;
  cands?: Cand[];
}

export type Outcome =
  | { kind: "path"; path: string; ready: boolean }
  | { kind: "hover"; reply: Record<string, unknown> }
  | { kind: "hit"; resolved: Resolved; reply: Record<string, unknown> }
  | { kind: "miss"; reply: Record<string, unknown> }
  | { kind: "ignore" };

export const isBridgeMessage = (d: unknown): d is BridgeMessage => !!d && typeof d === "object" && (d as BridgeMessage).source === "lnx-bridge";

const tagFor = (r: Resolved) => `Edit · ${r.entry.label}`;

export function onBridgeMessage(m: BridgeMessage, env: { index: Entry[]; pageRoute: string | null }): Outcome {
  switch (m.type) {
    case "ready":
    case "path":
      return m.path ? { kind: "path", path: m.path, ready: m.type === "ready" } : { kind: "ignore" };
    case "hover": {
      const r = resolve(env.index, m.cands || [], env.pageRoute);
      return { kind: "hover", reply: { target: "lnx-bridge", type: "highlight", id: m.id, index: r ? r.candIndex : -1, label: r ? tagFor(r) : "" } };
    }
    case "click": {
      const r = resolve(env.index, m.cands || [], env.pageRoute);
      if (!r) return { kind: "miss", reply: { target: "lnx-bridge", type: "select", index: -1 } };
      return { kind: "hit", resolved: r, reply: { target: "lnx-bridge", type: "select", index: r.candIndex, label: tagFor(r) } };
    }
  }
}
