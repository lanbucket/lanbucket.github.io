// npm run i18n:check [-- de fr] [-- --prune]
// For each locales/<code>.json (or just the languages named): the strings the templates use that it has no
// translation for (they show in English), translations nothing uses any more (usually because the English changed),
// and translations whose HTML tags or {placeholders} don't match the English. --prune drops the unused translations
// and puts the rest in template order. --source writes the English strings, in template order, to stdout as JSON.
import fs from "node:fs";
import path from "node:path";

import { extractKeys, readLocale, localeCodes, LOCALES_DIR, STATUS_SENTENCE } from "./i18n-keys.mjs";

const args = process.argv.slice(2);
const prune = args.includes("--prune");
const only = args.filter((arg) => !arg.startsWith("--"));
const keys = extractKeys();

if (args.includes("--source")) {
    console.log(JSON.stringify(Object.fromEntries([...keys.keys()].map((key) => [key, key])), null, 4));
    process.exit(0);
}

// The tags in a string (with their attributes, which have to come through unchanged) and its {placeholders}
function markup(text) {
    const tags = (text.match(/<\/?[a-z][^>]*>/gi) ?? []).map((tag) => tag.replace(/\s+/g, " "));
    const placeholders = text.match(/\{\w+\}/g) ?? [];
    return [...tags, ...placeholders].sort().join(" ");
}

let problems = 0;
for (const code of only.length ? only : localeCodes()) {
    const translations = readLocale(code);
    const missing = [...keys.keys()].filter((key) => !(key in translations));
    const unused = Object.keys(translations).filter((key) => !keys.has(key));
    const mismatched = Object.entries(translations)
        .filter(([key, value]) => keys.has(key) && markup(key) !== markup(value))
        .map(([key]) => key);

    // "No." and "Partial." table cells: each must start with a status sentence, the same one throughout
    const statusProblems = [];
    for (const status of ["No", "Partial"]) {
        const cells = [...keys.keys()].filter((key) => key.startsWith(`${status}. `) && key in translations);
        const words = new Set();
        for (const key of cells) {
            const word = translations[key].match(STATUS_SENTENCE)?.[0];
            if (word) words.add(word);
            else statusProblems.push(`no short status word and full stop at the start: ${JSON.stringify(translations[key].slice(0, 60))}`);
        }
        if (words.size > 1) statusProblems.push(`"${status}." cells use different status words: ${[...words].join(" / ")}`);
    }

    console.log(`\n${code}: ${keys.size - missing.length}/${keys.size} translated` +
        (unused.length ? `, ${unused.length} unused` : "") +
        (mismatched.length ? `, ${mismatched.length} with mismatched tags or placeholders` : "") +
        (statusProblems.length ? `, ${statusProblems.length} table status problems` : ""));
    for (const key of missing) console.log(`  missing:    ${JSON.stringify(key)}`);
    for (const key of unused) console.log(`  unused:     ${JSON.stringify(key)}`);
    for (const key of mismatched) {
        console.log(`  mismatched: ${JSON.stringify(key)}\n          ->  ${JSON.stringify(translations[key])}`);
    }
    for (const problem of statusProblems) console.log(`  status:     ${problem}`);
    problems += missing.length + mismatched.length + statusProblems.length;

    if (prune) {
        const ordered = {};
        for (const key of keys.keys()) if (key in translations) ordered[key] = translations[key];
        fs.writeFileSync(path.join(LOCALES_DIR, `${code}.json`), JSON.stringify(ordered, null, 4) + "\n");
    }
}

console.log(`\n${keys.size} strings in the templates.` + (prune ? " Unused translations removed." : ""));
process.exitCode = problems ? 1 : 0;
