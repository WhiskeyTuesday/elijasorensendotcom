const raw = import.meta.glob('/posts/*.md', { eager: true, query: '?raw', import: 'default' });

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return null;

	const frontmatter = {};
	let currentKey = null;
	let inArray = false;
	let arrayValues = [];

	for (const line of match[1].split('\n')) {
		const arrayItem = line.match(/^\s+-\s+(.+)$/);
		if (arrayItem && currentKey) {
			arrayValues.push(arrayItem[1]);
			frontmatter[currentKey] = arrayValues;
			continue;
		}

		if (inArray && currentKey) {
			inArray = false;
		}

		const kv = line.match(/^(\w+):\s*(.*)$/);
		if (kv) {
			currentKey = kv[1];
			if (kv[2]) {
				frontmatter[currentKey] = kv[2];
				inArray = false;
			} else {
				inArray = true;
				arrayValues = [];
			}
		}
	}

	return { ...frontmatter, body: match[2].trim() };
}

export function getAllPosts() {
	return Object.entries(raw)
		.map(([path, content]) => {
			const parsed = parseFrontmatter(content);
			if (!parsed) return null;
			const slug = path.replace('/posts/', '').replace('.md', '');
			return { slug, ...parsed };
		})
		.filter(Boolean)
		.filter((p) => p.draft !== 'true')
		.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPost(slug) {
	return getAllPosts().find((p) => p.slug === slug) ?? null;
}
