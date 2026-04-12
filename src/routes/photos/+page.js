import { gallerySlugs } from '$lib/galleries';

export async function load({ fetch }) {
	const galleries = await Promise.all(
		gallerySlugs.map(async (slug) => {
			try {
				const res = await fetch(`/photos/${slug}/gallery.json`);
				if (!res.ok) return null;
				const gallery = await res.json();
				gallery.slug = slug;
				return gallery;
			} catch {
				return null;
			}
		})
	);

	return { galleries: galleries.filter(Boolean) };
}
