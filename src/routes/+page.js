import { getAllPosts } from '$lib/posts';

export async function load({ fetch }) {
	let featuredPhoto = null;

	try {
		const res = await fetch('/photos/original-instagram/gallery.json');
		if (res.ok) {
			const gallery = await res.json();
			const singleImagePhotos = gallery.photos.filter((p) => !p.images || p.images === 1);
			if (singleImagePhotos.length > 0) {
				const photo = singleImagePhotos[Math.floor(Math.random() * singleImagePhotos.length)];
				featuredPhoto = {
					...photo,
					src: `/photos/original-instagram/${photo.id}.${photo.ext}`,
					galleryTitle: gallery.title,
				};
			}
		}
	} catch {
		// no featured photo, that's fine
	}

	return { posts: getAllPosts(), featuredPhoto };
}
