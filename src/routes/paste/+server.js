import { json, text, error } from '@sveltejs/kit';
import { createPaste, listPastes, authed } from './j17.js';

// POST /paste  — create a paste. Body is raw markdown.
//   auth: Authorization: Bearer <key>  (or x-api-key)
//   ttl:  ?ttl=<seconds>  (optional; not served past that time)
// send a non-form Content-Type (e.g. text/markdown) so SvelteKit's CSRF
// guard doesn't reject the POST. returns the paste URL as plain text.
export async function POST({ request, url }) {
	if (!authed(request)) throw error(401, 'bad or missing api key');

	const md = await request.text();
	if (!md.trim()) throw error(400, 'empty body');

	const ttlRaw = url.searchParams.get('ttl');
	const ttl = ttlRaw ? Number.parseInt(ttlRaw, 10) : undefined;
	if (ttlRaw && (!Number.isFinite(ttl) || ttl <= 0)) throw error(400, 'bad ttl');

	const id = await createPaste(md, ttl);
	return text(`${url.origin}/paste/${id}\n`, { status: 201 });
}

// GET /paste — list all known pastes (authed).
export async function GET({ request, url }) {
	if (!authed(request)) throw error(401, 'bad or missing api key');
	const pastes = await listPastes();
	return json(pastes.map((p) => ({ ...p, url: `${url.origin}/paste/${p.id}` })));
}
