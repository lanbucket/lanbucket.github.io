// How a {% t %}, {% ta %} or {% tj %} block's English becomes its key in locales/<code>.json. Shared by the build
// (eleventy.config.js) and npm run i18n:check, so both always agree on the keys.
import fs from "node:fs";
import path from "node:path";

export const LOCALES_DIR = "locales";
export const TEMPLATE_DIRS = ["src"];

// A comparison table cell whose English starts "No." or "Partial." shows its text as a tooltip minus that first
// sentence, so every translation has to start with a short status word and one of these marks: a full stop (. 。 ．),
// the Devanagari/Bengali danda (।), the Urdu full stop (۔), or a colon (: ：) for languages without a full stop, like
// Thai. src/home.njk's tooltip script uses the same pattern.
export const STATUS_SENTENCE = /^[^.。．।۔:：]{1,20}[.。．।۔:：]/u;

// Line breaks and indentation in the template don't matter: runs of whitespace become one space. A tj block holds
// JSON string text, so its escapes (\" and so on) are decoded first, which lets it share a key with the same text
// shown on the page.
export function normalizeKey(content, kind = "t") {
    let text = content;
    if (kind === "tj") text = JSON.parse(`"${text.replace(/\s+/g, " ")}"`);
    return text.replace(/\s+/g, " ").trim();
}

const BLOCK = /\{%-?\s*(t|ta|tj)\b[^%]*?-?%\}([\s\S]*?)\{%-?\s*end\1\s*-?%\}/g;

function templateFiles(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...templateFiles(file));
        else if (entry.name.endsWith(".njk")) files.push(file);
    }
    return files;
}

// Every key the templates use, in the order they first appear, with the files they appear in
export function extractKeys() {
    const keys = new Map();
    for (const dir of TEMPLATE_DIRS) {
        for (const file of templateFiles(dir).sort()) {
            const source = fs.readFileSync(file, "utf8");
            for (const match of source.matchAll(BLOCK)) {
                const [, kind, content] = match;
                if (/\{\{|\{%/.test(content)) {
                    throw new Error(`${file}: a {% ${kind} %} block can't contain template tags, use {placeholders}: ${content.trim().slice(0, 80)}`);
                }
                const key = normalizeKey(content, kind);
                if (!keys.has(key)) keys.set(key, new Set());
                keys.get(key).add(file.replace(/\\/g, "/"));
            }
        }
    }
    return keys;
}

// The keys of comparison table cells: the blocks that are a cell's screen reader text (<span class="sr-only">), whose
// first sentence the tooltip scripts cut off (see STATUS_SENTENCE)
export function extractCellKeys() {
    const cells = new Set();
    for (const dir of TEMPLATE_DIRS) {
        for (const file of templateFiles(dir)) {
            const source = fs.readFileSync(file, "utf8");
            for (const match of source.matchAll(BLOCK)) {
                if (source.slice(Math.max(0, match.index - 40), match.index).endsWith('class="sr-only">')) {
                    cells.add(normalizeKey(match[2], match[1]));
                }
            }
        }
    }
    return cells;
}

export function readLocale(code) {
    return JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), "utf8"));
}

export function localeCodes() {
    return fs.readdirSync(LOCALES_DIR)
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.basename(file, ".json"))
        .sort();
}
