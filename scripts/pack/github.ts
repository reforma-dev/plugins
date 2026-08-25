import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const GITHUB_SHA = /^[0-9a-f]{7,40}$/i;

export function parseGithubTree(
  url: string,
): { owner: string; repo: string; ref: string; path: string } | undefined {
  const match =
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/?(.*)$/i.exec(
      url,
    );

  if (!match) {
    return undefined;
  }

  return {
    owner: match[1],
    repo: match[2],
    ref: match[3],
    path: match[4].replace(/\/+$/, ""),
  };
}

export async function resolveCommitSha(
  owner: string,
  repo: string,
  ref: string,
): Promise<string> {
  if (GITHUB_SHA.test(ref) && ref.length >= 40) {
    return ref;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "reforma-plugins",
      },
    },
  );

  if (!res.ok) {
    throw new Error(
      `Could not resolve ${owner}/${repo}@${ref} (${res.status})`,
    );
  }

  const body = (await res.json()) as { sha?: string };

  if (typeof body.sha !== "string") {
    throw new Error(`No sha for ${owner}/${repo}@${ref}`);
  }

  return body.sha;
}

export async function fetchGithubTree(source: string, dest: string): Promise<void> {
  const parsed = parseGithubTree(source);

  if (!parsed) {
    throw new Error(`Remote source must be a GitHub tree URL: ${source}`);
  }

  const sha = await resolveCommitSha(parsed.owner, parsed.repo, parsed.ref);
  const treeRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${sha}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "reforma-plugins",
      },
    },
  );

  if (!treeRes.ok) {
    throw new Error(`Could not list tree ${source} (${treeRes.status})`);
  }

  const tree = (await treeRes.json()) as {
    truncated?: boolean;
    tree?: Array<{ path?: string; type?: string }>;
  };

  if (tree.truncated) {
    throw new Error(`GitHub tree ${source} is too large`);
  }

  const prefix = parsed.path;
  const blobs = (tree.tree ?? []).filter(
    (entry): entry is { path: string; type: string } => {
      return (
        entry.type === "blob" &&
        typeof entry.path === "string" &&
        (prefix.length === 0 ||
          entry.path === prefix ||
          entry.path.startsWith(`${prefix}/`))
      );
    },
  );

  if (blobs.length === 0) {
    throw new Error(`GitHub tree ${source} has no files`);
  }

  mkdirSync(dest, { recursive: true });

  for (const entry of blobs) {
    const rel =
      prefix.length === 0 || entry.path === prefix
        ? entry.path.slice(prefix.length).replace(/^\/+/, "") ||
          entry.path.split("/").at(-1) ||
          "file"
        : entry.path.slice(prefix.length + 1);
    const raw = await fetch(
      `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${sha}/${entry.path}`,
    );

    if (!raw.ok) {
      throw new Error(`Could not fetch ${entry.path} (${raw.status})`);
    }

    const abs = join(dest, rel);

    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, Buffer.from(await raw.arrayBuffer()));
  }
}

