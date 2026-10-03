import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

const origin = 'https://joshrobinson.com';

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }))).flat();
}

export async function checkLinks(directory) {
  const root = resolve(directory);
  const files = await filesIn(root);
  const errors = [];
  const documents = new Map();
  let checked = 0;
  const exists = async (path) => {
    try { return (await stat(path)).isFile(); } catch { return false; }
  };
  for (const file of files.filter((path) => /\.(html|xml|css)$/.test(path))) {
    const text = await readFile(file, 'utf8');
    const name = relative(root, file).split(sep).join('/');
    const page = new URL('/' + name.replace(/index\.html$/, ''), origin);
    const refs = [];
    if (file.endsWith('.css')) {
      for (const match of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) refs.push(match[1]);
    } else {
      const $ = load(text, { xmlMode: file.endsWith('.xml') });
      documents.set(file, $);
      $('[href], [src], [poster]').each((_, element) => {
        for (const attr of ['href', 'src', 'poster']) {
          const value = $(element).attr(attr);
          if (value) refs.push(value);
        }
      });
      $('[srcset]').each((_, element) => {
        const value = $(element).attr('srcset');
        if (!value.startsWith('data:')) refs.push(...value.split(',').map((part) => part.trim().split(/\s+/)[0]));
      });
      if (file.endsWith('.xml')) $('loc, link').each((_, element) => refs.push($(element).text().trim()));
    }
    for (const ref of refs.filter(Boolean)) {
      let url;
      try { url = new URL(ref, page); } catch {
        errors.push(`${name}: invalid URL ${ref}`);
        continue;
      }
      if (url.origin !== origin) continue;
      checked++;
      let path;
      try { path = resolve(root, '.' + decodeURIComponent(url.pathname)); } catch {
        errors.push(`${name}: invalid encoding ${ref}`);
        continue;
      }
      if (path !== root && !path.startsWith(root + sep)) {
        errors.push(`${name}: path escapes build ${ref}`);
        continue;
      }
      const candidates = [path, resolve(path, 'index.html'), path + '.html'];
      let target;
      for (const candidate of candidates) if (await exists(candidate)) { target = candidate; break; }
      if (!target) { errors.push(`${name}: missing ${ref}`); continue; }
      if (url.hash && target.endsWith('.html')) {
        let $ = documents.get(target);
        if (!$) { $ = load(await readFile(target, 'utf8')); documents.set(target, $); }
        let fragment;
        try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = url.hash.slice(1); }
        // Text fragments are resolved by browsers rather than HTML element IDs.
        fragment = fragment.split(':~:text=')[0];
        if (fragment && !$('[id], a[name]').toArray().some((el) => $(el).attr('id') === fragment || $(el).attr('name') === fragment)) {
          errors.push(`${name}: missing fragment ${ref}`);
        }
      }
    }
  }
  return { checked, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkLinks(process.argv[2] ?? 'dist');
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else console.log(`Checked ${result.checked} internal page, feed, sitemap and asset references.`);
}
