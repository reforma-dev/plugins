/**
 * Upload packed logo files to the public CDN and stamp https URLs into plugin.json.
 * Local pack without S3_URL skips this; CI requires it.
 */
import { S3Client } from "bun";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
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
  stripPath,
} from "./shared.ts";

const BUCKET = "reforma-public";

export type LogoObjectStore = {
  exists: (key: string) => Promise<boolean>;
  put: (key: string, body: Buffer, contentType: string) => Promise<void>;
};

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

function catalogLogoKey(buffer: Buffer, ext: string): string {
  const keyExt = ext === "jpeg" ? "jpg" : ext;

  return `plugins/${createHash("sha256").update(buffer).digest("hex")}.${keyExt}`;
}

async function publishLogoFile(
  pluginDir: string,
  rel: string,
  store: LogoObjectStore,
  publicEndpoint: string,
): Promise<{ url: string; status: "public" | "uploaded" | "cached" }> {
  if (/^https:\/\//i.test(rel)) {
    return { url: rel, status: "public" };
  }

  const path = stripPath(rel);
  const ext = extOf(path);
  const mime = logoMime(ext);

  if (!mime) {
    throw new Error(`unsupported catalog logo ${rel}`);
  }

  const buffer = readFileSync(join(pluginDir, path));
  const key = catalogLogoKey(buffer, ext);
  const url = `${publicEndpoint}/${key}`;

  if (await store.exists(key)) {
    return { url, status: "cached" };
  }

  await store.put(key, buffer, mime);

  return { url, status: "uploaded" };
}

export async function publishCatalogLogos(
  catalogDir: string,
  options: { store: LogoObjectStore; publicEndpoint: string },
): Promise<{ uploaded: number; cached: number }> {
  const publicEndpoint = options.publicEndpoint.replace(/\/$/, "");
  const marketplace = parseMarketplace(
    JSON.parse(readFileSync(join(catalogDir, "marketplace.json"), "utf8")) as unknown,
  );
  let uploaded = 0;
  let cached = 0;

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
        options.store,
        publicEndpoint,
      );
      const logoSmall =
        fields.logoSmall && fields.logoSmall !== fields.logo
          ? await publishLogoFile(
              pluginDir,
              fields.logoSmall,
              options.store,
              publicEndpoint,
            )
          : undefined;

      if (logo.status === "uploaded") {
        uploaded += 1;
      } else if (logo.status === "cached") {
        cached += 1;
      }

      if (logoSmall?.status === "uploaded") {
        uploaded += 1;
      } else if (logoSmall?.status === "cached") {
        cached += 1;
      }

      writeLogoFields(json, logo.url, logoSmall?.url);
      writeFileSync(manifestPath, `${JSON.stringify(json, null, 4)}\n`);
    }),
  );

  return { uploaded, cached };
}

function bunStore(s3Url: string): LogoObjectStore {
  const url = new URL(s3Url);

  if (!url.username || !url.password) {
    throw new Error("S3_URL must include access key and secret");
  }

  const client = new S3Client({
    accessKeyId: decodeURIComponent(url.username),
    secretAccessKey: decodeURIComponent(url.password),
    bucket: BUCKET,
    endpoint: url.origin,
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
): Promise<void> {
  const s3Url = process.env.S3_URL?.trim();
  const publicEndpoint = process.env.S3_PUBLIC_URL?.trim();

  if (!s3Url || !publicEndpoint) {
    if (process.env.GITHUB_ACTIONS === "true") {
      throw new Error(
        "S3_URL and S3_PUBLIC_URL are required in CI to publish catalog logos",
      );
    }

    console.warn("catalog logos: skip publish (no S3_URL / S3_PUBLIC_URL)");

    return;
  }

  const { uploaded, cached } = await publishCatalogLogos(catalogDir, {
    store: bunStore(s3Url),
    publicEndpoint,
  });

  console.warn(`catalog logos  uploaded×${uploaded}  cached×${cached}`);
}
