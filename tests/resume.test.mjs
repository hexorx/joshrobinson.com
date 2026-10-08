import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const resume = JSON.parse(
  readFileSync(new URL("../src/data/resume.json", import.meta.url), "utf8"),
);
const html = readFileSync(
  new URL("../dist/track-record/index.html", import.meta.url),
  "utf8",
);
const person = JSON.parse(
  html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (path.endsWith(".html")) files.push(path);
  }
  return files;
}

test("built Person metadata uses the resume source and required Schema.org properties", () => {
  assert.equal(person["@context"], "https://schema.org");
  assert.equal(person["@type"], "Person");
  assert.equal(person.name, resume.name);
  assert.equal(person.url, resume.url);
  assert.equal(person.email, "mailto:hire@joshrobinson.com");
  assert.equal(person.email, `mailto:${resume.email}`);
  assert.deepEqual(
    person.sameAs,
    resume.profiles.map((profile) => profile.url),
  );
  assert.deepEqual(person.address, {
    "@type": "PostalAddress",
    addressLocality: "Newton",
    addressRegion: "IA",
  });
  assert.equal(person.description, resume.headline);
  assert.equal(person.jobTitle, undefined);
});

test("public pages hide unfinished copy and never publish a phone number", () => {
  assert.equal(resume.email, "hire@joshrobinson.com");
  assert.doesNotMatch(resume.targetRole, /Placeholder|TODO/);
  const pages = walk("dist");
  assert.ok(pages.length > 0);
  for (const file of pages) {
    const text = readFileSync(file, "utf8");
    assert.doesNotMatch(text, /\[Placeholder\]/, file);
    assert.doesNotMatch(text, /\[TODO/, file);
    assert.doesNotMatch(text, /303-263-9850/, file);
    assert.doesNotMatch(text, /tel:/, file);
  }
  assert.match(html, /Track record/);
  assert.match(html, /Independent technology consulting/);
  assert.doesNotMatch(html, /Bproto/);
});
