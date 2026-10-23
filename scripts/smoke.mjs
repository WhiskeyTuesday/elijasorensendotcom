import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Exercise the built Vercel handler with fake credentials and an in-memory j17.
// No production data or external services are used.
process.env.J17_BASE_URL = 'https://j17.test';
process.env.J17_API_KEY = 'smoke-backend-key';
process.env.PASTE_API_KEY = 'smoke-paste-key';
const pastes = new Map();
let entries = [];
globalThis.fetch = async (input, options) => {
	const request = new Request(input, options);
	const url = new URL(request.url);
	if (url.origin === 'https://site.test' && /^\/photos\/[^/]+\/gallery\.json$/.test(url.pathname)) {
		return new Response(await readFile(`static${url.pathname}`));
	}
	assert.equal(url.origin, process.env.J17_BASE_URL, 'unexpected outbound request');
	assert.equal(request.headers.get('authorization'), 'Bearer smoke-backend-key');
	const [, type, id, event] = url.pathname.split('/');
	if (request.method === 'POST') {
		const { data } = await request.json();
		if (type === 'paste' && event === 'was_created') pastes.set(id, data);
		if (type === 'paste' && event === 'was_deleted') pastes.get(id).deleted = true;
		if (type === 'index' && event === 'entry_added') entries.push(data);
		if (type === 'index' && event === 'entry_removed') entries = entries.filter((p) => p.id !== data.id);
		return Response.json({});
	}
	const data = type === 'index' ? { entries } : pastes.get(id);
	return data ? Response.json({ data }) : new Response(null, { status: 404 });
};

const functionDir = '.vercel/output/functions/![-]/catchall.func';
const config = JSON.parse(await readFile(`${functionDir}/.vc-config.json`, 'utf8'));
assert.equal(config.runtime, 'nodejs22.x');
const { default: handler } = await import(pathToFileURL(`${process.cwd()}/${functionDir}/${config.handler}`));
const call = (path, options) => handler.fetch(new Request(`https://site.test${path}`, options));
const auth = { authorization: 'Bearer smoke-paste-key', 'content-type': 'text/markdown' };

for (const path of ['/', '/blog', '/photos', '/blog/frike-origin', '/feed.xml']) {
	const response = await call(path);
	assert.equal(response.status, 200, path);
	const body = await response.text();
	assert.ok(body.length > 100, `${path} has content`);
	assert.ok(!body.includes('smoke-backend-key') && !body.includes('smoke-paste-key'), 'secrets stay private');
}
assert.equal((await call('/blog/missing-post')).status, 404);
for (const [path, method] of [['/paste', 'GET'], ['/paste', 'POST'], ['/paste/123456789', 'DELETE']]) {
	assert.equal((await call(path, { method, headers: { 'content-type': 'text/markdown' } })).status, 401);
}
assert.equal((await call('/paste', { headers: { authorization: 'Bearer wrong-key' } })).status, 401);
assert.equal((await call('/paste', { method: 'POST', headers: auth, body: ' ' })).status, 400);
assert.equal((await call('/paste?ttl=invalid', { method: 'POST', headers: auth, body: '# Hello' })).status, 400);

const created = await call('/paste?ttl=60', { method: 'POST', headers: auth, body: '# Smoke test' });
assert.equal(created.status, 201);
const pasteUrl = new URL((await created.text()).trim());
const id = pasteUrl.pathname.split('/').at(-1);
assert.match(id, /^[0-9A-HJKMNP-TV-Z]{9}$/);
const rendered = await call(pasteUrl.pathname);
assert.equal(rendered.status, 200);
assert.equal(rendered.headers.get('cache-control'), 'no-store');
assert.match(await rendered.text(), /<h1>Smoke test<\/h1>/);
const listed = await call('/paste', { headers: { 'x-api-key': 'smoke-paste-key' } });
assert.equal(listed.status, 200);
assert.equal((await listed.json())[0].id, id);
assert.equal((await call(pasteUrl.pathname, { method: 'DELETE', headers: auth })).status, 200);
assert.equal((await call(pasteUrl.pathname)).status, 404);
assert.equal((await call('/paste', { headers: auth })).status, 200);

const expiring = await call('/paste?ttl=60', { method: 'POST', headers: auth, body: 'Expiring' });
assert.equal(expiring.status, 201);
const expiredPath = new URL((await expiring.text()).trim()).pathname;
pastes.get(expiredPath.split('/').at(-1)).expires_at = 1;
assert.equal((await call(expiredPath)).status, 404);
assert.equal((await call('/paste/000000000')).status, 404);
console.info('Smoke checks passed: pages, feed, private env, paste auth/create/list/render/delete/expiry, and Vercel runtime target.');
process.exit(0);
