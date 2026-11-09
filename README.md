# LANBucket Website

Official website for LANBucket - Simple Local Network File Sharing

**Live Site:** [https://lanbucket.com](https://lanbucket.com)

## About

This is the static website for LANBucket, a Windows application that enables easy file sharing between devices on your local network using peer-to-peer technology.

## Building and previewing

The site is built with [Eleventy](https://www.11ty.dev/). The deploy workflow builds it on every push to `main`.

```sh
npm install
npm start          # builds into _site/ and serves it at http://localhost:8080, rebuilding on changes
npm run build      # just builds _site/
```

- `src/home.njk` and `src/download.njk` are the homepage and download page. Each is built once per language in
  `src/_data/locales.json`, at that language's path (`/`, `/zh/`, `/de/download/`, ...).
- `src/_includes/` holds the parts the pages share: the header with its language menu, the footer, the head tags.
- `src/sitemap.njk` builds `sitemap.xml`, listing every language's version of each localized page. Update a page's
  `lastmod` there when it changes.
- The English-only pages (`troubleshooting.html`, `changelog.html`, `vs-*/`, ...) stay plain HTML files at the same
  paths. They go through Nunjucks too, so they can include the shared header, which means `{{`, `{%` and `{#` have to be
  avoided in them (or wrapped in `{% raw %}`).
- Everything else (images, `style.css`, `app/`, ...) is copied as-is.

## Translations

English is written directly in the templates, and each translatable piece is wrapped in a tag:

```njk
<h2>{% t %}Frequently Asked Questions{% endt %}</h2>        {# HTML text #}
<img alt="{% ta %}LANBucket Logo{% endta %}">               {# an attribute value #}
"name": "{% tj %}Is LANBucket free?{% endtj %}"             {# text inside a JSON-LD string #}
<td>{% t row %}{seconds} seconds{% endt %}</td>            {# {placeholders} filled from an object #}
```

`locales/<code>.json` maps each English string to its translation. Line breaks and indentation in the template don't
matter (whitespace is collapsed to single spaces). A string without a translation shows in English, and the build
prints how many there are per language.

**Changing English text** changes its key, so every language falls back to English for that string until it's
translated again. To see what needs doing:

```sh
npm run i18n:check            # every language: missing, unused and mismatched translations
npm run i18n:check -- de      # just German
npm run i18n:check -- --prune # also drop translations nothing uses any more
```

Add the new translations to each `locales/<code>.json`, then run `npm run i18n:check -- --prune` to clear out the old
ones. The check also flags translations whose HTML tags or `{placeholders}` differ from the English.

**Adding a language:** add it to `src/_data/locales.json` (`code` is the language tag used for `lang` and `hreflang`,
`path` its URL folder, `dir: "rtl"` for right-to-left scripts, `video` for its demo video), then add
`locales/<code>.json`. The language menu, `hreflang` tags and sitemap pick it up automatically.

The demo videos come from the LANBucketDemoVideos repo (`SimpleIntroVideo/mk4/videos`). A language needs
`lanbucket-demo_<video>.webm` and `.mp4` copied here, plus a WebP poster made from its PNG:
`magick lanbucket-demo-poster_<video>.png -quality 90 lanbucket-demo-poster_<video>.webp`.

Some things to keep in mind when translating:

- In the comparison table, a `No.` / `Partial.` cell's tooltip is its text minus the first sentence, so translations of
  those must start with a short status word and the language's full stop (`.`, `。`, `।`, `۔`, or `:` in Thai), the same
  word in every cell. `npm run i18n:check` enforces this.
- Page titles, descriptions and keyword lists are written for each language's search market rather than translated
  word for word.
- Product names (LANBucket, DC++, Steam, Windows...) stay in English, and terminology should match the app's own
  translations in the LANBucket repo (`LanBucket/Strings/<language>/Resources.resw`).

## License

Copyright (c) 2026 Justin Becker. All Rights Reserved.
