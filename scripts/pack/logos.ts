import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { extname, join } from "node:path";
import {
  findManifestPath,
  isRecord,
  ROOT,
  type MarketplaceListing,
} from "./shared.ts";

export const LOGO_EXT = new Set(["svg", "png", "webp", "jpg", "jpeg"]);
export const LOGO_MAX_BYTES = 512 * 1024;

export function extOf(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

export function logoExtFromDownload(
  contentType: string | null,
  urlPath: string,
): string {
  const fromPath = extOf(urlPath.split("?")[0] ?? "");

  if (LOGO_EXT.has(fromPath)) {
    return fromPath === "jpeg" ? "jpg" : fromPath;
  }

  const mime = (contentType ?? "").split(";")[0]?.trim().toLowerCase() ?? "";

  if (mime === "image/svg+xml") {
    return "svg";
  }

  if (mime === "image/png") {
    return "png";
  }

  if (mime === "image/webp") {
    return "webp";
  }

  if (mime === "image/jpeg") {
    return "jpg";
  }

  throw new Error(`unsupported logo type ${mime || fromPath || "unknown"}`);
}

export async function materializeLogo(
  pluginDir: string,
  value: string,
  destStem: string,
): Promise<string | undefined> {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    const res = await fetch(trimmed);

    if (!res.ok) {
      throw new Error(`logo download failed ${trimmed} (${res.status})`);
    }

    const buf = Buffer.from(await res.arrayBuffer());

    if (buf.length > LOGO_MAX_BYTES) {
      console.warn(`  skip oversized logo ${trimmed}`);
      return undefined;
    }

    const ext = logoExtFromDownload(
      res.headers.get("content-type"),
      new URL(trimmed).pathname,
    );
    const rel = `assets/${destStem}.${ext}`;

    mkdirSync(join(pluginDir, "assets"), { recursive: true });
    writeFileSync(join(pluginDir, rel), buf);

    return rel;
  }

  const rel = trimmed.replace(/^\.\//, "");
  const abs = join(pluginDir, rel);

  if (!existsSync(abs)) {
    console.warn(`  skip missing logo ${rel}`);
    return undefined;
  }

  const ext = extOf(rel);

  if (!LOGO_EXT.has(ext)) {
    throw new Error(`unsupported logo ${rel}`);
  }

  if (statSync(abs).size > LOGO_MAX_BYTES) {
    console.warn(`  skip oversized logo ${rel}`);
    unlinkSync(abs);
    return undefined;
  }

  return rel;
}

export function readLogoFields(json: Record<string, unknown>): {
  logo?: string;
  logoDark?: string;
} {
  const iface = isRecord(json.interface) ? json.interface : undefined;

  return {
    logo:
      typeof json.logo === "string"
        ? json.logo
        : typeof iface?.logo === "string"
          ? iface.logo
          : undefined,
    logoDark:
      typeof json.logoDark === "string"
        ? json.logoDark
        : typeof iface?.logoDark === "string"
          ? iface.logoDark
          : undefined,
  };
}

export function writeLogoFields(
  json: Record<string, unknown>,
  logo: string,
  logoDark: string,
): void {
  json.logo = logo;
  json.logoDark = logoDark;

  if (isRecord(json.interface)) {
    json.interface.logo = logo;
    json.interface.logoDark = logoDark;
  }
}

export async function normalizePluginLogos(pluginDir: string): Promise<void> {
  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    throw new Error(`no plugin.json in ${pluginDir}`);
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    throw new Error(`invalid plugin.json ${manifestPath}`);
  }

  const fields = readLogoFields(json);

  if (!fields.logo) {
    return;
  }

  const logo = await materializeLogo(pluginDir, fields.logo, "logo");
  const logoDark =
    fields.logoDark && fields.logoDark !== fields.logo
      ? await materializeLogo(pluginDir, fields.logoDark, "logo-dark")
      : logo;

  if (!logo) {
    delete json.logo;
    delete json.logoDark;

    if (isRecord(json.interface)) {
      delete json.interface.logo;
      delete json.interface.logoDark;
    }

    writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
    return;
  }

  writeLogoFields(json, logo, logoDark ?? logo);
  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

function listingBrandLogo(name: string): string | undefined {
  const dir = join(ROOT, "marketplace/_brand", name);

  if (!existsSync(dir)) {
    return undefined;
  }

  for (const file of readdirSync(dir)) {
    if (file.startsWith("logo.") && LOGO_EXT.has(extOf(file))) {
      return join(dir, file);
    }
  }

  return undefined;
}

function stampInterface(
  json: Record<string, unknown>,
  patch: { displayName?: string; brandColor?: string; logo?: string },
): void {
  const iface = isRecord(json.interface) ? json.interface : {};

  if (patch.displayName) {
    iface.displayName = patch.displayName;
  }

  if (patch.brandColor) {
    iface.brandColor = patch.brandColor;
  }

  if (patch.logo) {
    iface.logo = patch.logo;
  }

  json.interface = iface;
}

/** Overlay display name, description, and logo from marketplace.json / `_brand`. */
export function applyCatalogOverlay(
  pluginDir: string,
  listing: MarketplaceListing,
): void {
  const manifestPath = findManifestPath(pluginDir);

  if (!manifestPath) {
    throw new Error(`no plugin.json in ${pluginDir}`);
  }

  const json = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

  if (!isRecord(json)) {
    throw new Error(`invalid plugin.json ${manifestPath}`);
  }

  const httpLogo =
    listing.logo && /^https?:\/\//i.test(listing.logo)
      ? listing.logo
      : undefined;
  const fromListing =
    listing.logo && !httpLogo ? join(ROOT, listing.logo) : undefined;
  const file = fromListing ?? (httpLogo ? undefined : listingBrandLogo(listing.name));
  let logo = httpLogo;

  if (file) {
    if (!existsSync(file)) {
      throw new Error(`overlay logo missing ${file}`);
    }

    const ext = extOf(file);

    if (!LOGO_EXT.has(ext)) {
      throw new Error(`unsupported overlay logo ${file}`);
    }

    const rel = `assets/logo${extname(file).toLowerCase() === ".jpeg" ? ".jpg" : extname(file).toLowerCase()}`;

    mkdirSync(join(pluginDir, "assets"), { recursive: true });
    cpSync(file, join(pluginDir, rel));
    logo = rel;
  }

  if (
    !listing.displayName &&
    !listing.description &&
    !listing.brandColor &&
    !logo
  ) {
    return;
  }

  if (listing.displayName) {
    stampInterface(json, { displayName: listing.displayName });
  }

  if (listing.description) {
    json.description = listing.description;
  }

  if (listing.brandColor) {
    stampInterface(json, { brandColor: listing.brandColor });
  }

  if (logo) {
    json.logo = logo;
    stampInterface(json, { logo });
  }

  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

