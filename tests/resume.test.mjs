import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const resume = JSON.parse(readFileSync(new URL('../src/data/resume.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../dist/resume/index.html', import.meta.url), 'utf8');
const person = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);

test('built Person metadata uses the resume source and required Schema.org properties', () => {
  assert.equal(person['@context'], 'https://schema.org');
  assert.equal(person['@type'], 'Person');
  assert.equal(person.name, resume.name);
  assert.equal(person.url, resume.url);
  assert.equal(person.email, `mailto:${resume.email}`);
  assert.deepEqual(person.sameAs, resume.profiles.map(profile => profile.url));
  assert.deepEqual(person.address, { '@type': 'PostalAddress', addressLocality: 'Newton', addressRegion: 'IA' });
  assert.equal(person.description, resume.headline);
  assert.equal(person.jobTitle, undefined); // A sentence is not a job title.
});

test('unverified dates and roles stay explicitly marked; every role has 2–4 bullets', () => {
  assert.equal(resume.experience.length, 7);
  for (const job of resume.experience) {
    assert.ok(job.highlights.length >= 2 && job.highlights.length <= 4);
    if (!job.current) {
      assert.match(job.start, /\[Placeholder\]/);
      assert.match(job.end, /\[Placeholder\]/);
    }
    assert.match(job.highlights.at(-1), /\[Placeholder\]/);
  }
  for (const company of ['American Red Cross', 'Aetna/iTriage', 'Bloomberg']) {
    assert.match(resume.experience.find(job => job.company === company).role, /\[Placeholder\]/);
  }
  assert.match(resume.targetRole, /\[Placeholder\]/);
  assert.match(html, /\[Placeholder\]/);
});
