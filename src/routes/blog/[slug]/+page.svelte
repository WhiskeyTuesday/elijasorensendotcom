<script>
	import { ArrowLeft, Calendar, Tag, Rss } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} — elija sorensen</title>
	{#if data.description}
		<meta name="description" content={data.description} />
	{/if}
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-4 font-mono">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between">
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

	<!-- Post Window -->
	<div class="bg-stone-50 border-2 border-stone-400 shadow-lg max-w-3xl mx-auto">
		<!-- Title Bar -->
		<div class="bg-gradient-to-r from-stone-300 to-stone-400 border-b-2 border-stone-500 px-4 py-2">
			<span class="text-sm font-bold text-stone-800">{data.title}</span>
		</div>

		<!-- Meta Bar -->
		<div class="bg-stone-200 border-b border-stone-300 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
			{#if data.date}
				<span class="flex items-center space-x-1">
					<Calendar size={11} />
					<span>{data.date}</span>
				</span>
			{/if}
			{#if data.tags}
				<span class="flex items-center space-x-1">
					<Tag size={11} />
					<span>{Array.isArray(data.tags) ? data.tags.join(', ') : data.tags}</span>
				</span>
			{/if}
		</div>

		{#if data.description}
			<div class="bg-stone-100 border-b border-stone-300 px-4 py-2">
				<p class="text-xs text-stone-500 italic">{data.description}</p>
			</div>
		{/if}

		<!-- Post Body -->
		<div class="p-6 prose prose-stone prose-sm max-w-none font-sans
			prose-headings:font-mono prose-headings:text-stone-800
			prose-a:text-stone-700 prose-a:underline hover:prose-a:text-stone-900
			prose-code:text-stone-700 prose-code:bg-stone-200 prose-code:px-1 prose-code:rounded
			prose-pre:bg-stone-200 prose-pre:border prose-pre:border-stone-300">
			{@html data.html}
		</div>
	</div>
</div>
