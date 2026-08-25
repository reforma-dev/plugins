import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  findManifestPath,
  isRecord,
  sameRelPath,
  stripPath,
} from "./shared.ts";

export const VENDOR_PLUGIN_ROOTS = [
  "${CLAUDE_PLUGIN_ROOT}",
  "${CODEX_PLUGIN_ROOT}",
  "${CURSOR_PLUGIN_ROOT}",
] as const;
export const REFORMA_PLUGIN_DIR_PLACEHOLDER = "${REFORMA_PLUGIN_DIR}";

export function normalizeHookCommand(command: string): string {
  let out = command;

  for (const vendor of VENDOR_PLUGIN_ROOTS) {
    out = out.split(vendor).join(REFORMA_PLUGIN_DIR_PLACEHOLDER);
  }

  return out.replace(/\$\{REFORMA_PLUGIN_DIR\}\/(.+)/g, "./$1");
}

export const CANONICAL_HOOKS_PATH = "./hooks/hooks.json";
export const HOOK_EVENT_NAMES = new Set([
  "SessionStart",
  "SessionEnd",
  "UserPromptSubmit",
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Stop",
]);

export type HookOffer = { name: string; description?: string };

export function readHooksJson(file: string): Record<string, unknown> | undefined {
  if (!existsSync(file)) {
    return undefined;
  }

  const parsed = JSON.parse(readFileSync(file, "utf8")) as unknown;

  return isRecord(parsed) ? parsed : undefined;
}

export function loadHooksSource(
  pluginDir: string,
  manifestPath: string | undefined,
): Record<string, unknown> | undefined {
  const defaultPath = join(pluginDir, "hooks", "hooks.json");

  if (!manifestPath) {
    return readHooksJson(defaultPath);
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    return undefined;
  }

  const hooksField = json.hooks;

  if (hooksField === undefined) {
    return readHooksJson(defaultPath);
  }

  if (typeof hooksField === "string") {
    const filePath = join(pluginDir, stripPath(hooksField));

    if (!existsSync(filePath)) {
      throw new Error(`hooks file missing: ${hooksField}`);
    }

    return readHooksJson(filePath);
  }

  if (isRecord(hooksField)) {
    return isRecord(hooksField.hooks) ? hooksField : { hooks: hooksField };
  }

  throw new Error("invalid hooks field in plugin.json");
}

export function normalizeHooksConfig(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const bag = isRecord(raw.hooks) ? raw.hooks : undefined;

  if (!bag) {
    return { hooks: {} };
  }

  const hooks: Record<string, unknown> = {};

  for (const [event, groups] of Object.entries(bag)) {
    if (!HOOK_EVENT_NAMES.has(event) || !Array.isArray(groups)) {
      continue;
    }

    const normalizedGroups: unknown[] = [];

    for (const group of groups) {
      if (!isRecord(group) || !Array.isArray(group.hooks)) {
        continue;
      }

      const handlers: unknown[] = [];

      for (const handler of group.hooks) {
        if (
          !isRecord(handler) ||
          handler.type !== "command" ||
          typeof handler.command !== "string"
        ) {
          continue;
        }

        const normalized: Record<string, unknown> = {
          type: "command",
          command: normalizeHookCommand(handler.command),
        };

        if (typeof handler.timeout === "number") {
          normalized.timeout = handler.timeout;
        }

        handlers.push(normalized);
      }

      if (handlers.length === 0) {
        continue;
      }

      const normalizedGroup: Record<string, unknown> = { hooks: handlers };

      if (typeof group.matcher === "string" && group.matcher.trim()) {
        normalizedGroup.matcher = group.matcher;
      }

      normalizedGroups.push(normalizedGroup);
    }

    if (normalizedGroups.length > 0) {
      hooks[event] = normalizedGroups;
    }
  }

  return { hooks };
}

export function buildHookOffers(
  config: Record<string, unknown>,
): HookOffer[] | undefined {
  const bag = isRecord(config.hooks) ? config.hooks : undefined;

  if (!bag) {
    return undefined;
  }

  const offers: HookOffer[] = [];

  for (const [event, groups] of Object.entries(bag)) {
    if (!HOOK_EVENT_NAMES.has(event) || !Array.isArray(groups)) {
      continue;
    }

    let handlerCount = 0;
    let matcher: string | undefined;

    for (const group of groups) {
      if (!isRecord(group)) {
        continue;
      }

      if (typeof group.matcher === "string" && group.matcher.trim()) {
        matcher = group.matcher;
      }

      if (Array.isArray(group.hooks)) {
        handlerCount += group.hooks.length;
      }
    }

    if (handlerCount === 0) {
      continue;
    }

    const matcherNote = matcher ? `, matcher: ${matcher}` : "";
    const handlers = `${handlerCount} ${handlerCount === 1 ? "handler" : "handlers"}`;

    offers.push({
      name: event,
      description: `${handlers}${matcherNote}`,
    });
  }

  return offers.length > 0
    ? offers.sort((left, right) => left.name.localeCompare(right.name))
    : undefined;
}

/** Vendor / inline hooks → canonical Reforma hooks.json + manifest path + hookOffers. */
export function normalizePluginHooks(pluginDir: string): void {
  const manifestPath = findManifestPath(pluginDir);
  const source = loadHooksSource(pluginDir, manifestPath);

  if (!source) {
    return;
  }

  const canonical = normalizeHooksConfig(source);
  const hookOffers = buildHookOffers(canonical);

  if (!isRecord(canonical.hooks) || Object.keys(canonical.hooks).length === 0) {
    return;
  }

  const hooksDir = join(pluginDir, "hooks");

  mkdirSync(hooksDir, { recursive: true });
  writeFileSync(
    join(hooksDir, "hooks.json"),
    `${JSON.stringify(canonical, null, 4)}\n`,
  );

  if (!manifestPath) {
    return;
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    return;
  }

  json.hooks = CANONICAL_HOOKS_PATH;

  if (hookOffers) {
    json.hookOffers = hookOffers;
  } else {
    delete json.hookOffers;
  }

  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

