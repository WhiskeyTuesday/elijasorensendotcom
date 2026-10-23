import { getAllPosts } from '#lib/posts.js';

export function load() {
	return { posts: getAllPosts() };
}
