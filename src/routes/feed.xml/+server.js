const posts = import.meta.glob('/posts/*.md', { eager: true, query: '?raw', import: 'default' });

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) frontmatter[m[1]] = m[2];
  }

  return { ...frontmatter, content: match[2].trim() };
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const items = Object.entries(posts)
    .map(([path, raw]) => {
      const parsed = parseFrontmatter(raw);
      if (!parsed) return null;

      const slug = path.replace('/posts/', '').replace('.md', '');
      return { slug, ...parsed };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Elija Sorensen</title>
  <subtitle>blog posts from elijasorensen.com</subtitle>
  <link href="https://www.elijasorensen.com/feed.xml" rel="self"/>
  <link href="https://www.elijasorensen.com"/>
  <id>https://www.elijasorensen.com/</id>
  <updated>${items.length ? new Date(items[0].date).toISOString() : new Date().toISOString()}</updated>
  <author>
    <name>Elija Sorensen</name>
    <email>hello@elijasorensen.com</email>
  </author>
${items.map(post => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="https://www.elijasorensen.com/blog/${post.slug}"/>
    <id>https://www.elijasorensen.com/blog/${post.slug}</id>
    <updated>${new Date(post.date).toISOString()}</updated>
    <summary>${escapeXml(post.description)}</summary>
    <content type="text">${escapeXml(post.content.slice(0, 500))}</content>
  </entry>`).join('\n')}
</feed>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml',
      'Cache-Control': 'max-age=3600',
    },
  });
}
