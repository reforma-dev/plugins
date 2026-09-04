/**
 * Upload packed logo files to the public CDN and stamp https URLs into plugin.json.
 * Local pack without S3_URL skips this; CI requires it.
 */
import { S3Client } from "bun";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  extOf,
  readLogoFields,
  writeLogoFields,
} from "./logos.ts";
import {
  findManifestPath,
  isRecord,
  parseMarketplace,
} from "./shared.ts";

export const CATALOG_LOGO_BUCKET = "reforma-public";

export type LogoObjectStore = {
  exists: (key: string) => Promise<boolean>;
  put: (key: string, body: Buffer, contentType: string) => Promise<void>;
};

export function catalogLogoKey(buffer: Buffer, ext: string): string {
  const keyExt = ext === "jpeg" ? "jpg" : ext;

  return `plugins/${createHash("sha256").update(buffer).digest("hex")}.${keyExt}`;
}

function logoMime(ext: string): string | undefined {
  if (ext === "svg") {
    return "image/svg+xml";
  }

  if (ext === "png") {
    return "image/png";
  }

  if (ext === "webp") {
    return "image/webp";
  }

  if (ext === "jpg" || ext === "jpeg") {
    return "image/jpeg";
  }

  return undefined;
}

async function publishLogoFile(
  pluginDir: string,
  rel: string,
  store: LogoObjectStore,
  publicEndpoint: string,
): Promise<string> {
  if (/^https:\/\//i.test(rel)) {
    return rel;
  }

  const abs = join(pluginDir, rel.replace(/^\.\//, ""));
  const buffer = readFileSync(abs);
  const ext = extOf(rel);
  const mime = logoMime(ext);

  if (!mime) {
    throw new Error(`unsupported catalog logo ${rel}`);
  }

  const key = catalogLogoKey(buffer, ext);

  if (!(await store.exists(key))) {
    await store.put(key, buffer, mime);
  }

  return `${publicEndpoint}/${key}`;
}

export async function publishCatalogLogos(
  catalogDir: string,
  options: { store: LogoObjectStore; publicEndpoint: string },
): Promise<{ uploaded: number; cached: number }> {
  const publicEndpoint = options.publicEndpoint.replace(/\/$/, "");
  const marketplacePath = join(catalogDir, "marketplace.json");
  const marketplace = parseMarketplace(
    JSON.parse(readFileSync(marketplacePath, "utf8")) as unknown,
  );
  let uploaded = 0;
  let cached = 0;
  const store: LogoObjectStore = {
    exists: async (key) => {
      const hit = await options.store.exists(key);

      if (hit) {
        cached += 1;
      } else {
        uploaded += 1;
      }

      return hit;
    },
    put: options.store.put,
  };

  await Promise.all(
    marketplace.plugins.map(async (plugin) => {
      const pluginDir = join(catalogDir, plugin.name);
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

      const logo = await publishLogoFile(
        pluginDir,
        fields.logo,
        store,
        publicEndpoint,
      );
      const logoSmall =
        fields.logoSmall && fields.logoSmall !== fields.logo
          ? await publishLogoFile(
              pluginDir,
              fields.logoSmall,
              store,
              publicEndpoint,
            )
          : undefined;

      writeLogoFields(json, logo, logoSmall);
      writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
    }),
  );

  return { uploaded, cached };
}

function parseS3Url(raw: string): {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
} {
  const url = new URL(raw);

  if (!url.username || !url.password) {
    throw new Error("S3_URL must include access key and secret");
  }

  return {
    endpoint: url.origin,
    accessKeyId: decodeURIComponent(url.username),
    secretAccessKey: decodeURIComponent(url.password),
  };
}

function bunStore(s3Url: string): LogoObjectStore {
  const parsed = parseS3Url(s3Url);
  const client = new S3Client({
    accessKeyId: parsed.accessKeyId,
    secretAccessKey: parsed.secretAccessKey,
    bucket: CATALOG_LOGO_BUCKET,
    endpoint: parsed.endpoint,
    region: "auto",
  });

  return {
    exists: (key) => client.file(key).exists(),
    put: async (key, body, contentType) => {
      await client.file(key).write(body, { type: contentType });
    },
  };
}

/** Upload + stamp when S3_URL is set. CI must set it; local pack may skip. */
export async function publishCatalogLogosFromEnv(
  catalogDir: string,
): Promise<boolean> {
  const s3Url = process.env.S3_URL?.trim();
  const publicEndpoint = process.env.S3_PUBLIC_URL?.trim();
  const inCi = process.env.GITHUB_ACTIONS === "true";

  if (!s3Url || !publicEndpoint) {
    if (inCi) {
      throw new Error(
        "S3_URL and S3_PUBLIC_URL are required in CI to publish catalog logos",
      );
    }

    if (!existsSync(join(catalogDir, "marketplace.json"))) {
      return false;
    }

    console.warn("catalog logos: skip publish (no S3_URL / S3_PUBLIC_URL)");

    return false;
  }

  const { uploaded, cached } = await publishCatalogLogos(catalogDir, {
    store: bunStore(s3Url),
    publicEndpoint,
  });

  console.warn(`catalog logos  uploaded×${uploaded}  cached×${cached}`);

  return true;
}
