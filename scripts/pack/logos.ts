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
  logoSmall?: string;
} {
  const iface = isRecord(json.interface) ? json.interface : undefined;

  return {
    logo:
      typeof json.logo === "string"
        ? json.logo
        : typeof iface?.logo === "string"
          ? iface.logo
          : undefined,
    logoSmall:
      typeof json.logoSmall === "string"
        ? json.logoSmall
        : typeof iface?.logoSmall === "string"
          ? iface.logoSmall
          : undefined,
  };
}

export function writeLogoFields(
  json: Record<string, unknown>,
  logo: string,
  logoSmall?: string,
): void {
  json.logo = logo;

  if (isRecord(json.interface)) {
    json.interface.logo = logo;
  }

  if (logoSmall && logoSmall !== logo) {
    json.logoSmall = logoSmall;

    if (isRecord(json.interface)) {
      json.interface.logoSmall = logoSmall;
    }

    return;
  }

  delete json.logoSmall;

  if (isRecord(json.interface)) {
    delete json.interface.logoSmall;
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
  const logoSmall =
    fields.logoSmall && fields.logoSmall !== fields.logo
      ? await materializeLogo(pluginDir, fields.logoSmall, "logo-small")
      : undefined;

  if (!logo) {
    delete json.logo;
    delete json.logoSmall;

    if (isRecord(json.interface)) {
      delete json.interface.logo;
      delete json.interface.logoSmall;
    }

    writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
    return;
  }

  writeLogoFields(json, logo, logoSmall);
  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

function listingBrandFile(name: string, stem: string): string | undefined {
  const dir = join(ROOT, "marketplace/_brand", name);

  if (!existsSync(dir)) {
    return undefined;
  }

  const prefix = `${stem}.`;

  for (const file of readdirSync(dir)) {
    if (file.startsWith(prefix) && LOGO_EXT.has(extOf(file))) {
      return join(dir, file);
    }
  }

  return undefined;
}

function overlayLogo(
  pluginDir: string,
  listingValue: string | undefined,
  name: string,
  stem: string,
): string | undefined {
  const http =
    listingValue && /^https?:\/\//i.test(listingValue)
      ? listingValue
      : undefined;
  const fromListing =
    listingValue && !http ? join(ROOT, listingValue) : undefined;
  const file = fromListing ?? (http ? undefined : listingBrandFile(name, stem));

  if (http) {
    return http;
  }

  if (!file) {
    return undefined;
  }

  if (!existsSync(file)) {
    throw new Error(`overlay ${stem} missing ${file}`);
  }

  const ext = extOf(file);

  if (!LOGO_EXT.has(ext)) {
    throw new Error(`unsupported overlay ${stem} ${file}`);
  }

  const suffix = extname(file).toLowerCase() === ".jpeg" ? ".jpg" : extname(file).toLowerCase();
  const rel = `assets/${stem}${suffix}`;

  mkdirSync(join(pluginDir, "assets"), { recursive: true });
  cpSync(file, join(pluginDir, rel));

  return rel;
}

function stampInterface(
  json: Record<string, unknown>,
  patch: { displayName?: string; brandColor?: string; logo?: string; logoSmall?: string },
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

  if (patch.logoSmall) {
    iface.logoSmall = patch.logoSmall;
  }

  json.interface = iface;
}

/** Overlay display name, description, and logos from marketplace.json / `_brand`. */
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

  const logo = overlayLogo(pluginDir, listing.logo, listing.name, "logo");
  const logoSmall = overlayLogo(
    pluginDir,
    listing.logoSmall,
    listing.name,
    "logo-small",
  );

  if (
    !listing.displayName &&
    !listing.description &&
    !listing.brandColor &&
    !logo &&
    !logoSmall
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

  if (logoSmall) {
    json.logoSmall = logoSmall;
    stampInterface(json, { logoSmall });
  }

  writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
}

