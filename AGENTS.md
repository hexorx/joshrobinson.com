## Project

joshrobinson.com: Josh Robinson's personal site, blog, and online resume (personal brand). Static Astro site. Tracked in Paperclip (Hexorx › joshrobinson.com). Framework decision: HEX-148. Designs: HEX-147.

- Keep it static (no SSR adapter) unless a ticket says otherwise.
- Resume content lives only in `src/data/resume.json`.
- Never invent facts about Josh; leave `[Placeholder]` text until he supplies copy.
- No deploys or Cloudflare/DNS changes without Josh's approval.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
