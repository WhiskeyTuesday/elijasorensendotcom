import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

// --- ids -------------------------------------------------------------------
// 9-char Crockford base32 to match j17's "humane code" id format.
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ID_LEN = 9;

export function makeId() {
	const bytes = crypto.getRandomValues(new Uint8Array(ID_LEN));
	let id = '';
	for (let i = 0; i < ID_LEN; i++) id += CROCKFORD[bytes[i] & 31];
	return id;
}

// The paste list is a single aggregate we append to on every create/delete —
// j17 has no "list all aggregates" query, so we keep our own projection.
// Fixed v4-shaped id + a fixed system actor (both required by j17).
const INDEX_ID = '00000000-0000-4000-8000-000000000001';
const SYSTEM_ACTOR = { type: 'service', id: '00000000-0000-4000-8000-000000000000' };

// --- j17 transport ---------------------------------------------------------
function base() {
	const url = env.J17_BASE_URL; // e.g. https://espaste.j17.dev
	if (!url) throw error(500, 'J17_BASE_URL not configured');
	return url.replace(/\/$/, '');
}

async function write(aggType, aggId, eventType, data) {
	const key = env.J17_API_KEY;
	if (!key) throw error(500, 'J17_API_KEY not configured');

	const res = await fetch(`${base()}/${aggType}/${aggId}/${eventType}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data, metadata: { actor: SYSTEM_ACTOR } })
	});

	if (!res.ok) {
		// surface j17's status (413 too large, 422 validation, 429 rate limit, …)
		const body = await res.text();
		throw error(res.status, `j17 write failed: ${body.slice(0, 200)}`);
	}
	return res.json();
}

async function readAggregate(aggType, aggId) {
	const key = env.J17_API_KEY;
	if (!key) throw error(500, 'J17_API_KEY not configured');

	const res = await fetch(`${base()}/${aggType}/${aggId}`, {
		headers: { Authorization: `Bearer ${key}` }
	});

	if (res.status === 404) return null; // no events written yet
	if (!res.ok) {
		const body = await res.text();
		throw error(res.status, `j17 read failed: ${body.slice(0, 200)}`);
	}
	const json = await res.json();
	return json.data ?? null;
}

// --- paste operations ------------------------------------------------------
export async function createPaste(md, ttlSeconds) {
	const id = makeId();
	const createdAt = Math.floor(Date.now() / 1000);
	const expiresAt = ttlSeconds && ttlSeconds > 0 ? createdAt + ttlSeconds : null;

	await write('paste', id, 'was_created', { md, expires_at: expiresAt });
	await write('index', INDEX_ID, 'entry_added', {
		id,
		created_at: createdAt,
		expires_at: expiresAt
	});
	return id;
}

function isExpired(expiresAt) {
	return expiresAt != null && expiresAt <= Math.floor(Date.now() / 1000);
}

// returns { md } for a live paste, or null if missing / deleted / expired.
export async function getPaste(id) {
	const state = await readAggregate('paste', id);
	if (!state || state.deleted) return null;
	if (isExpired(state.expires_at)) return null;
	return { md: state.md };
}

// returns true if a live paste existed and was tombstoned, false otherwise.
export async function deletePaste(id) {
	const state = await readAggregate('paste', id);
	if (!state || state.deleted) return false;

	await write('paste', id, 'was_deleted', {});
	await write('index', INDEX_ID, 'entry_removed', { id });
	return true;
}

export async function listPastes() {
	const state = await readAggregate('index', INDEX_ID);
	const entries = state?.entries ?? [];
	return entries
		.filter((e) => !isExpired(e.expires_at))
		.map((e) => ({ id: e.id, createdAt: e.created_at, expiresAt: e.expires_at }));
}

// --- auth for our own endpoints (PASTE_API_KEY deploy env) -----------------
export function authed(request) {
	const key = env.PASTE_API_KEY;
	if (!key) return false; // fail closed if unset
	const auth = request.headers.get('authorization');
	const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
	const provided = bearer ?? request.headers.get('x-api-key');
	return provided === key;
}
