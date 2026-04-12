import { getPost } from '$lib/posts';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';

export function load({ params }) {
	const post = getPost(params.slug);
	if (!post) throw error(404, 'Post not found');

	return {
		...post,
		html: marked(post.body)
	};
}
