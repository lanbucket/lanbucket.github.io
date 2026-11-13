import fs from "node:fs";
import path from "node:path";

import { normalizeKey, LOCALES_DIR } from "./scripts/i18n-keys.mjs";

// Everything that isn't built from a template is copied as-is, the way GitHub Pages published the repo
// before there was a build: anything but names starting with "." or "_", minus the build's own files.
const NOT_PUBLISHED = new Set([
    "node_modules", "_site", "src", "scripts", LOCALES_DIR,
    "package.json", "package-lock.json", "eleventy.config.js",
]);

function addPassthroughFiles(eleventyConfig, dir = ".") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || entry.name.startsWith("_") || NOT_PUBLISHED.has(entry.name)) continue;
        const file = path.posix.join(dir, entry.name).replace(/^\.\//, "");
        if (entry.isDirectory()) addPassthroughFiles(eleventyConfig, file);
        // .html pages are templates (English-only pages, rendered at the same path); .njk are the localized pages
        else if (!/\.(html|njk)$/.test(entry.name)) eleventyConfig.addPassthroughCopy(file);
    }
}

// locales/<code>.json maps each English string, as it appears in the templates, to its translation.
let translations = {};
const missing = new Map();

function loadTranslations() {
    translations = {};
    missing.clear();
    for (const file of fs.readdirSync(LOCALES_DIR)) {
        if (!file.endsWith(".json")) continue;
        translations[path.basename(file, ".json")] = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), "utf8"));
    }
}

const numberFormats = new Map();
function formatNumber(value, code) {
    if (!numberFormats.has(code)) {
        // Western digits everywhere, Arabic included: the chart and its numbers are the same on every page
        numberFormats.set(code, new Intl.NumberFormat(code, { numberingSystem: "latn", maximumFractionDigits: 1 }));
    }
    return numberFormats.get(code).format(value);
}

// {name} in a string is filled in from the object passed to the shortcode, numbers formatted for the page's language
function fillPlaceholders(text, values, code) {
    if (!values) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => {
        if (!(name in values)) return match;
        const value = values[name];
        return typeof value === "number" ? formatNumber(value, code) : String(value);
    });
}

// Placeholders every translated string can use for links, filled in with the page language's version of each page
// ({download} is /download/ in English, /de/download/ in German...). {en} is the hreflang attribute for links to pages
// that are only in English (the changelog and privacy policy), empty on English pages.
const PAGE_LINKS = {
    home: "",
    download: "download/",
    troubleshooting: "troubleshooting.html",
    guide: "lan-party-file-sharing-guide/",
    vslocalsend: "vs-localsend/",
    vsdcpp: "vs-dcpp/",
    vsdlan: "vs-d-lan/",
};

function linkPlaceholders(locale) {
    const base = locale?.path ?? "/";
    const links = Object.fromEntries(Object.entries(PAGE_LINKS).map(([name, subpath]) => [name, base + subpath]));
    links.en = locale && locale.code !== "en" ? ' hreflang="en"' : "";
    // support.microsoft.com's language, for languages it translates its articles into (microsoftSupport in locales.json)
    links.mssupport = locale?.microsoftSupport ?? "en-us";
    return links;
}

// {% t %}English{% endt %} renders the page language's translation of the English between the tags, falling back to
// the English when there isn't one. ta is the same for an attribute value, and tj for text inside a JSON string.
function translator(kind) {
    return function (content, values) {
        const code = this.ctx?.locale?.code ?? "en";
        values = { ...linkPlaceholders(this.ctx?.locale), ...values };
        let text = content;
        if (code !== "en") {
            const key = normalizeKey(content, kind);
            const translated = translations[code]?.[key];
            if (translated === undefined) {
                if (!missing.has(code)) missing.set(code, new Set());
                missing.get(code).add(key);
            } else if (kind === "tj") {
                text = JSON.stringify(translated).slice(1, -1);
            } else if (kind === "ta") {
                text = translated.replace(/"/g, "&quot;");
            } else {
                text = translated;
            }
        }
        return fillPlaceholders(text, values, code);
    };
}

// The language menu's flags: just the ones src/_data/locales.json uses, from the flag-icons package (MIT, its licence
// copied alongside). src/flags/ has lighter versions where the package's is needlessly heavy for a 20px icon.
function addFlags(eleventyConfig) {
    const locales = JSON.parse(fs.readFileSync("src/_data/locales.json", "utf8"));
    for (const flag of new Set(locales.map((l) => l.flag))) {
        const own = `src/flags/${flag}.svg`;
        const source = fs.existsSync(own) ? own : `node_modules/flag-icons/flags/4x3/${flag}.svg`;
        eleventyConfig.addPassthroughCopy({ [source]: `flags/${flag}.svg` });
    }
    eleventyConfig.addPassthroughCopy({ "node_modules/flag-icons/LICENSE": "flags/LICENSE.txt" });
}

export default function (eleventyConfig) {
    addPassthroughFiles(eleventyConfig);
    addFlags(eleventyConfig);

    eleventyConfig.addWatchTarget(`./${LOCALES_DIR}/`);
    eleventyConfig.on("eleventy.before", loadTranslations);
    eleventyConfig.on("eleventy.after", () => {
        for (const [code, keys] of missing) {
            console.warn(`[i18n] ${code}: ${keys.size} string(s) not translated, shown in English. Run npm run i18n:check for the list.`);
        }
    });

    // Pages keep the paths they always had (/changelog.html, not /changelog/); the localized pages set their own
    eleventyConfig.addGlobalData("permalink", () => (data) => `${data.page.filePathStem}.${data.page.outputFileExtension}`);

    for (const kind of ["t", "ta", "tj"]) eleventyConfig.addPairedShortcode(kind, translator(kind));

    // On a right-to-left page "DC++" shows as "++DC", and the ® after "Steam" lands on the wrong side of the word: the
    // plus signs and the mark take the direction of the text around them. An invisible left-to-right mark after each
    // keeps it with the name, in text, attributes and JSON-LD alike.
    eleventyConfig.addTransform("rtl-names", function (content) {
        if (!this.page.outputPath?.endsWith(".html") || !/<html[^>]* dir="rtl"/.test(content)) return content;
        return content
            .replace(/DC\+\+(?!‎)/g, "DC++‎")
            .replace(/(<sup class="tm-mark">&reg;<\/sup>)(?!‎)/g, "$1‎");
    });

    // {{ 5693 | num(locale.code) }}: a number written the way the page's language writes it
    eleventyConfig.addFilter("num", (value, code = "en") => formatNumber(value, code));

    return {
        dir: { input: ".", includes: "src/_includes", data: "src/_data", output: "_site" },
        templateFormats: ["njk", "html"],
        htmlTemplateEngine: "njk",
    };
}
