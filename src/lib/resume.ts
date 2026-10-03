import { z } from 'astro/zod';
import raw from '../data/resume.json';

// Schema for src/data/resume.json. A bad edit fails the build instead of shipping a broken resume.
const Resume = z.object({
	name: z.string(),
	headline: z.string(),
	targetRole: z.string(),
	address: z.object({ locality: z.string(), region: z.string() }),
	location: z.string().default(''),
	email: z.string().default(''),
	url: z.string().url(),
	summary: z.string(),
	profiles: z.array(z.object({ network: z.string(), url: z.string().url() })).default([]),
	experience: z
		.array(
			z.object({
				ref: z.string(),
				current: z.boolean(),
				company: z.string(),
				role: z.string(),
				start: z.string(),
				end: z.string(),
				location: z.string().default(''),
				highlights: z.array(z.string()).min(2).max(4),
			}),
		)
		.default([]),
	projects: z.array(z.object({ name: z.string(), url: z.string().default(''), description: z.string() })).default([]),
	skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })).default([]),
	community: z.array(z.string()),
	education: z.array(z.object({ school: z.string(), credential: z.string(), year: z.string().default('') })).default([]),
});

export type ResumeData = z.infer<typeof Resume>;
export const resume: ResumeData = Resume.parse(raw);

/** schema.org Person JSON-LD built from the resume data. */
export function personJsonLd(r: ResumeData) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: r.name,
		url: r.url,
		description: r.headline,
		address: {
			'@type': 'PostalAddress',
			addressLocality: r.address.locality,
			addressRegion: r.address.region,
		},
		...(r.email ? { email: `mailto:${r.email}` } : {}),
		sameAs: r.profiles.map((p) => p.url),
	};
}
