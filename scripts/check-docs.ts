import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const WORKSPACE_ROOT = process.cwd();
const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'reports',
  '.auth',
]);

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const headingPattern = /^#{1,6}\s+(.+)$/gm;

function collectMarkdownFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    if (EXCLUDED_DIRECTORIES.has(entry)) continue;

    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      files.push(...collectMarkdownFiles(absolutePath));
    } else if (entry.toLowerCase().endsWith('.md')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function githubHeadingBase(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function collectHeadingFragments(filePath: string): Set<string> {
  const contents = readFileSync(filePath, 'utf8');
  const fragments = new Set<string>();
  const duplicateCounts = new Map<string, number>();

  for (const match of contents.matchAll(headingPattern)) {
    const heading = match[1];
    if (!heading) continue;

    const base = githubHeadingBase(heading);
    const occurrence = duplicateCounts.get(base) ?? 0;
    fragments.add(occurrence === 0 ? base : `${base}-${occurrence}`);
    duplicateCounts.set(base, occurrence + 1);
  }

  return fragments;
}

function decodeLinkPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function lineNumberAt(contents: string, index: number): number {
  return contents.slice(0, index).split(/\r?\n/).length;
}

const markdownFiles = collectMarkdownFiles(WORKSPACE_ROOT);
const failures: string[] = [];
const headingCache = new Map<string, Set<string>>();

for (const sourceFile of markdownFiles) {
  const contents = readFileSync(sourceFile, 'utf8');

  for (const match of contents.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1]?.trim().replace(/^<|>$/g, '');
    if (!rawTarget || /^[a-z][a-z\d+.-]*:/i.test(rawTarget)) continue;

    const [rawPath = '', rawFragment] = rawTarget.split('#', 2);
    const targetFile = rawPath
      ? path.resolve(path.dirname(sourceFile), decodeLinkPart(rawPath))
      : sourceFile;
    const sourceLocation = `${path.relative(WORKSPACE_ROOT, sourceFile)}:${lineNumberAt(contents, match.index)}`;

    if (!existsSync(targetFile)) {
      failures.push(`${sourceLocation} missing local target: ${rawTarget}`);
      continue;
    }

    if (!rawFragment || path.extname(targetFile).toLowerCase() !== '.md') {
      continue;
    }

    let fragments = headingCache.get(targetFile);
    if (!fragments) {
      fragments = collectHeadingFragments(targetFile);
      headingCache.set(targetFile, fragments);
    }

    const fragment = decodeLinkPart(rawFragment).toLowerCase();
    if (!fragments.has(fragment)) {
      failures.push(`${sourceLocation} missing heading fragment: ${rawTarget}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Documentation validation failed:\n${failures.join('\n')}`);
}

console.log(
  `Validated ${markdownFiles.length} Markdown file(s): local targets and heading fragments resolve.`,
);
