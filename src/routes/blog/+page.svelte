<script>
	import { ArrowLeft, Calendar, Rss } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>blog — elija sorensen</title>
	<meta name="description" content="Writing by Elija Sorensen" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-4 font-mono">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between max-w-3xl mx-auto">
		<a href="/" class="inline-flex items-center space-x-1 text-stone-600 hover:text-stone-800 text-sm">
			<ArrowLeft size={14} />
			<span>back</span>
		</a>
		<a
			href="/feed.xml"
			target="_blank"
			class="inline-flex items-center space-x-1 text-stone-500 hover:text-orange-600 text-sm"
			title="RSS Feed"
		>
			<Rss size={14} />
		</a>
	</div>

	<!-- Blog Window -->
	<div class="bg-stone-50 border-2 border-stone-400 shadow-lg max-w-3xl mx-auto">
		<div class="bg-gradient-to-r from-stone-300 to-stone-400 border-b-2 border-stone-500 px-4 py-2 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<span class="text-stone-800 font-bold text-lg">blog</span>
			</div>
			<a
				href="/feed.xml"
				target="_blank"
				class="w-6 h-6 bg-stone-200 border border-stone-400 hover:bg-orange-200 hover:border-orange-400 flex items-center justify-center transition-colors"
				title="RSS Feed"
			>
				<Rss size={12} />
			</a>
		</div>

		<div class="p-4">
			{#if data.posts.length === 0}
				<p class="text-stone-400 text-sm italic">No posts yet.</p>
			{:else}
				<div class="space-y-2">
					{#each data.posts as post}
						<a
							href="/blog/{post.slug}"
							class="block bg-stone-100 border-2 border-stone-300 hover:border-stone-500 hover:bg-stone-50 p-3"
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<span class="text-sm font-bold text-stone-800">{post.title}</span>
									{#if post.description}
										<p class="text-xs text-stone-500 mt-0.5">{post.description}</p>
									{/if}
								</div>
								{#if post.date}
									<span class="text-xs text-stone-400 shrink-0 flex items-center space-x-1">
										<Calendar size={11} />
										<span>{post.date}</span>
									</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
