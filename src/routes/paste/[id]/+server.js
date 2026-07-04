import { error, text } from '@sveltejs/kit';
import { marked } from 'marked';
import { getPaste, deletePaste, authed } from '../j17.js';

function escapeHtml(s) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function page(id, bodyHtml) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(id)} — paste</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    background: linear-gradient(to bottom right, #f5f5f4, #e7e5e4);
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #292524;
    padding: 1rem;
  }
  .window {
    max-width: 48rem;
    margin: 0 auto;
    background: #fafaf9;
    border: 2px solid #a8a29e;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  .titlebar {
    background: linear-gradient(to right, #d6d3d1, #a8a29e);
    border-bottom: 2px solid #78716c;
    padding: 0.5rem 1rem;
    font-family: ui-monospace, monospace;
    font-weight: 700;
    font-size: 0.85rem;
    color: #292524;
  }
  .content { padding: 1.5rem; line-height: 1.6; overflow-wrap: break-word; }
  .content h1, .content h2, .content h3, .content h4 {
    font-family: ui-monospace, monospace; color: #292524; margin-top: 1.4em;
  }
  .content a { color: #44403c; text-decoration: underline; }
  .content a:hover { color: #1c1917; }
  .content code {
    font-family: ui-monospace, monospace; background: #e7e5e4;
    padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em;
  }
  .content pre {
    background: #e7e5e4; border: 1px solid #d6d3d1; border-radius: 4px;
    padding: 1rem; overflow-x: auto;
  }
  .content pre code { background: none; padding: 0; }
  .content blockquote {
    border-left: 3px solid #a8a29e; margin-left: 0; padding-left: 1rem; color: #57534e;
  }
  .content img { max-width: 100%; }
  .content table { border-collapse: collapse; }
  .content th, .content td { border: 1px solid #d6d3d1; padding: 0.4rem 0.6rem; }
</style>
</head>
<body>
  <div class="window">
    <div class="titlebar">${escapeHtml(id)}</div>
    <div class="content">${bodyHtml}</div>
  </div>
</body>
</html>`;
}

// GET /paste/:id — render the markdown for a reader. Public, no auth.
export async function GET({ params }) {
	const doc = await getPaste(params.id);
	if (!doc) throw error(404, 'no such paste (expired, deleted, or never existed)');

	const html = page(params.id, marked(doc.md));
	return new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
	});
}

// DELETE /paste/:id — take it down now (append a tombstone; authed).
export async function DELETE({ params, request }) {
	if (!authed(request)) throw error(401, 'bad or missing api key');
	const existed = await deletePaste(params.id);
	if (!existed) throw error(404, 'no such paste');
	return text(`deleted ${params.id}\n`);
}
