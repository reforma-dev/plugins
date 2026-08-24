/**
 * Resolve marketplace.json into dist/catalog/<name>/ and dist/catalog.tar.gz.
 */
import { spawnSync } from 'node:child_process';
import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'dist', 'catalog');
const TAR = join(ROOT, 'dist', 'catalog.tar.gz');
const GITHUB_SHA = /^[0-9a-f]{7,40}$/i;

type Marketplace = {
    categories: unknown;
    plugins: Array<{ name: string; source: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseGithubTree(url: string): { owner: string; repo: string; ref: string; path: string } | undefined {
    const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/?(.*)$/i.exec(url);

    if (!match) {
        return undefined;
    }

    return { owner: match[1], repo: match[2], ref: match[3], path: match[4].replace(/\/+$/, '') };
}

async function resolveCommitSha(owner: string, repo: string, ref: string): Promise<string> {
    if (GITHUB_SHA.test(ref) && ref.length >= 40) {
        return ref;
    }

    const res = await fetch(`https://api.github.com/repos/${ owner }/${ repo }/commits/${ ref }`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'reforma-plugins' },
    });

    if (!res.ok) {
        throw new Error(`Could not resolve ${ owner }/${ repo }@${ ref } (${ res.status })`);
    }

    const body = await res.json() as { sha?: string };

    if (typeof body.sha !== 'string') {
        throw new Error(`No sha for ${ owner }/${ repo }@${ ref }`);
    }

    return body.sha;
}

async function fetchGithubTree(source: string, dest: string): Promise<void> {
    const parsed = parseGithubTree(source);

    if (!parsed) {
        throw new Error(`Remote source must be a GitHub tree URL: ${ source }`);
    }

    const sha = await resolveCommitSha(parsed.owner, parsed.repo, parsed.ref);
    const treeRes = await fetch(
        `https://api.github.com/repos/${ parsed.owner }/${ parsed.repo }/git/trees/${ sha }?recursive=1`,
        { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'reforma-plugins' } }
    );

    if (!treeRes.ok) {
        throw new Error(`Could not list tree ${ source } (${ treeRes.status })`);
    }

    const tree = await treeRes.json() as { truncated?: boolean; tree?: Array<{ path?: string; type?: string }> };

    if (tree.truncated) {
        throw new Error(`GitHub tree ${ source } is too large`);
    }

    const prefix = parsed.path;
    const blobs = (tree.tree ?? []).filter((entry): entry is { path: string; type: string } => {
        return entry.type === 'blob'
          && typeof entry.path === 'string'
          && (prefix.length === 0 || entry.path === prefix || entry.path.startsWith(`${ prefix }/`));
    });

    if (blobs.length === 0) {
        throw new Error(`GitHub tree ${ source } has no files`);
    }

    mkdirSync(dest, { recursive: true });

    for (const entry of blobs) {
        const rel = prefix.length === 0 || entry.path === prefix
            ? (entry.path.slice(prefix.length).replace(/^\/+/, '') || entry.path.split('/').at(-1) || 'file')
            : entry.path.slice(prefix.length + 1);
        const raw = await fetch(
            `https://raw.githubusercontent.com/${ parsed.owner }/${ parsed.repo }/${ sha }/${ entry.path }`
        );

        if (!raw.ok) {
            throw new Error(`Could not fetch ${ entry.path } (${ raw.status })`);
        }

        const abs = join(dest, rel);

        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, Buffer.from(await raw.arrayBuffer()));
    }
}

const REFORMA_PLUGIN_DIR = '.reforma-plugin';
const VENDOR_PLUGIN_DIRS = ['.codex-plugin', '.cursor-plugin', '.claude-plugin'] as const;

const LOGO_EXT = new Set(['svg', 'png', 'webp', 'jpg', 'jpeg']);
const LOGO_MAX_BYTES = 512 * 1024;

function pluginManifestPath(pluginDir: string): string {
    return join(pluginDir, REFORMA_PLUGIN_DIR, 'plugin.json');
}

function findManifestPath(pluginDir: string): string | undefined {
    const path = pluginManifestPath(pluginDir);

    return existsSync(path) ? path : undefined;
}

/** Cursor / Codex / Claude folder → `.reforma-plugin`. Root `plugin.json` moves in. */
function normalizePluginLayout(pluginDir: string): void {
    if (findManifestPath(pluginDir)) {
        return;
    }

    const dest = join(pluginDir, REFORMA_PLUGIN_DIR);

    for (const vendor of VENDOR_PLUGIN_DIRS) {
        const vendorDir = join(pluginDir, vendor);

        if (!existsSync(join(vendorDir, 'plugin.json'))) {
            continue;
        }

        renameSync(vendorDir, dest);

        return;
    }

    const root = join(pluginDir, 'plugin.json');

    if (!existsSync(root)) {
        return;
    }

    mkdirSync(dest, { recursive: true });
    renameSync(root, pluginManifestPath(pluginDir));
}

function extOf(path: string): string {
    return path.split('.').pop()?.toLowerCase() ?? '';
}

function logoExtFromDownload(contentType: string | null, urlPath: string): string {
    const fromPath = extOf(urlPath.split('?')[0] ?? '');

    if (LOGO_EXT.has(fromPath)) {
        return fromPath === 'jpeg' ? 'jpg' : fromPath;
    }

    const mime = (contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';

    if (mime === 'image/svg+xml') {
        return 'svg';
    }

    if (mime === 'image/png') {
        return 'png';
    }

    if (mime === 'image/webp') {
        return 'webp';
    }

    if (mime === 'image/jpeg') {
        return 'jpg';
    }

    throw new Error(`unsupported logo type ${ mime || fromPath || 'unknown' }`);
}

async function materializeLogo(pluginDir: string, value: string, destStem: string): Promise<string> {
    const trimmed = value.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        const res = await fetch(trimmed);

        if (!res.ok) {
            throw new Error(`logo download failed ${ trimmed } (${ res.status })`);
        }

        const buf = Buffer.from(await res.arrayBuffer());

        if (buf.length > LOGO_MAX_BYTES) {
            throw new Error(`logo too large ${ trimmed }`);
        }

        const ext = logoExtFromDownload(res.headers.get('content-type'), new URL(trimmed).pathname);
        const rel = `assets/${ destStem }.${ ext }`;

        mkdirSync(join(pluginDir, 'assets'), { recursive: true });
        writeFileSync(join(pluginDir, rel), buf);

        return rel;
    }

    const rel = trimmed.replace(/^\.\//, '');
    const abs = join(pluginDir, rel);

    if (!existsSync(abs)) {
        throw new Error(`logo missing: ${ rel }`);
    }

    const ext = extOf(rel);

    if (!LOGO_EXT.has(ext)) {
        throw new Error(`unsupported logo ${ rel }`);
    }

    if (statSync(abs).size > LOGO_MAX_BYTES) {
        throw new Error(`logo too large ${ rel }`);
    }

    return rel;
}

function readLogoFields(json: Record<string, unknown>): { logo?: string; logoDark?: string } {
    const iface = isRecord(json.interface) ? json.interface : undefined;

    return {
        logo: typeof json.logo === 'string'
            ? json.logo
            : (typeof iface?.logo === 'string' ? iface.logo : undefined),
        logoDark: typeof json.logoDark === 'string'
            ? json.logoDark
            : (typeof iface?.logoDark === 'string' ? iface.logoDark : undefined),
    };
}

function writeLogoFields(json: Record<string, unknown>, logo: string, logoDark: string): void {
    json.logo = logo;
    json.logoDark = logoDark;

    if (isRecord(json.interface)) {
        json.interface.logo = logo;
        json.interface.logoDark = logoDark;
    }
}

async function normalizePluginLogos(pluginDir: string): Promise<void> {
    const manifestPath = findManifestPath(pluginDir);

    if (!manifestPath) {
        throw new Error(`no plugin.json in ${ pluginDir }`);
    }

    const json = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;

    if (!isRecord(json)) {
        throw new Error(`invalid plugin.json ${ manifestPath }`);
    }

    const fields = readLogoFields(json);

    if (!fields.logo) {
        return;
    }

    const logo = await materializeLogo(pluginDir, fields.logo, 'logo');
    const logoDark = (fields.logoDark && fields.logoDark !== fields.logo)
        ? await materializeLogo(pluginDir, fields.logoDark, 'logo-dark')
        : logo;

    writeLogoFields(json, logo, logoDark);
    writeFileSync(manifestPath, `${ JSON.stringify(json, null, 4) }\n`);
}

const MCP_JSON = ['mcp.json', '.mcp.json'] as const;
const PLACEHOLDER = /\$\{[A-Za-z_][A-Za-z0-9_]*\}/;
const MCP_PROBE_MS = 5_000;

function mcpConfigPath(pluginDir: string): string | undefined {
    for (const rel of MCP_JSON) {
        const path = join(pluginDir, rel);

        if (existsSync(path)) {
            return path;
        }
    }

    return undefined;
}

function mcpServerMap(raw: unknown): Record<string, unknown> | undefined {
    if (!isRecord(raw)) {
        return undefined;
    }

    if (isRecord(raw.mcpServers)) {
        return raw.mcpServers;
    }

    const entries = Object.values(raw);

    if (entries.some(entry => isRecord(entry) && (
        typeof entry.url === 'string' || typeof entry.command === 'string'
    ))) {
        return raw;
    }

    return undefined;
}

function httpMcpUrls(raw: unknown): string[] {
    const servers = mcpServerMap(raw);

    if (!servers) {
        return [];
    }

    const urls: string[] = [];

    for (const entry of Object.values(servers)) {
        if (!isRecord(entry)) {
            continue;
        }

        if (typeof entry.command === 'string' && entry.command.trim() !== '') {
            continue;
        }

        const url = typeof entry.url === 'string' ? entry.url.trim() : '';

        if (!url || PLACEHOLDER.test(url) || !/^https?:\/\//i.test(url)) {
            continue;
        }

        urls.push(url);
    }

    return urls;
}

function wwwAuthenticateHasResourceMetadata(header: string | null): boolean {
    return Boolean(header && /resource_metadata\s*=/i.test(header));
}

async function mcpInitializeUnauthorized(url: string): Promise<boolean> {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), MCP_PROBE_MS);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/event-stream',
                'Content-Type': 'application/json',
                'User-Agent': 'reforma-plugins',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2025-03-26',
                    capabilities: {},
                    clientInfo: { name: 'reforma-pack', version: '0' },
                },
            }),
            redirect: 'manual',
            signal: ac.signal,
        });

        return res.status === 401 && wwwAuthenticateHasResourceMetadata(res.headers.get('www-authenticate'));
    }
    catch {
        return false;
    }
    finally {
        clearTimeout(timer);
    }
}

async function normalizePluginAuth(pluginDir: string): Promise<void> {
    const manifestPath = findManifestPath(pluginDir);

    if (!manifestPath) {
        throw new Error(`no plugin.json in ${ pluginDir }`);
    }

    const json = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;

    if (!isRecord(json)) {
        throw new Error(`invalid plugin.json ${ manifestPath }`);
    }

    if (json.auth === 'oauth') {
        return;
    }

    const mcpPath = mcpConfigPath(pluginDir);

    if (!mcpPath) {
        return;
    }

    const urls = httpMcpUrls(JSON.parse(readFileSync(mcpPath, 'utf8')) as unknown);

    for (const url of urls) {
        if (await mcpInitializeUnauthorized(url)) {
            json.auth = 'oauth';
            writeFileSync(manifestPath, `${ JSON.stringify(json, null, 4) }\n`);
            console.log(`  auth oauth ← ${ url }`);

            return;
        }
    }
}

async function packPlugin(name: string, source: string): Promise<void> {
    const dest = join(OUT, name);

    if (/^https?:\/\//i.test(source)) {
        await fetchGithubTree(source, dest);
        normalizePluginLayout(dest);
        await normalizePluginLogos(dest);
        await normalizePluginAuth(dest);

        return;
    }

    const from = resolve(ROOT, source);

    if (!existsSync(from)) {
        throw new Error(`Plugin source missing: ${ source }`);
    }

    mkdirSync(dest, { recursive: true });
    cpSync(from, dest, { recursive: true });
    normalizePluginLayout(dest);
    await normalizePluginLogos(dest);
    await normalizePluginAuth(dest);
}

const raw = JSON.parse(readFileSync(join(ROOT, 'marketplace.json'), 'utf8')) as unknown;

if (!isRecord(raw) || !Array.isArray(raw.categories) || !Array.isArray(raw.plugins)) {
    throw new Error('marketplace.json needs categories[] and plugins[]');
}

const marketplace = raw as Marketplace;
const names = new Set<string>();

rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const plugin of marketplace.plugins) {
    if (typeof plugin.name !== 'string' || typeof plugin.source !== 'string') {
        throw new Error('plugins[] needs name and source');
    }

    if (names.has(plugin.name)) {
        throw new Error(`Duplicate plugin name: ${ plugin.name }`);
    }

    names.add(plugin.name);
    console.log(`pack ${ plugin.name } ← ${ plugin.source }`);
    await packPlugin(plugin.name, plugin.source);
}

writeFileSync(join(OUT, 'marketplace.json'), `${ JSON.stringify(marketplace, null, 4) }\n`);

mkdirSync(dirname(TAR), { recursive: true });
const tar = spawnSync('tar', ['-czf', TAR, '-C', join(ROOT, 'dist'), 'catalog'], { stdio: 'inherit' });

if (tar.status !== 0) {
    throw new Error('tar failed');
}

console.log(`wrote ${ TAR }`);
