<script>
	import {
		ChevronLeft, ChevronRight, ArrowLeft, X,
		Minimize2, Image, Layers
	} from 'lucide-svelte';
	import { getWindowState, setWindowState } from '$lib/windowState';
	import { browser } from '$app/environment';

	let { data } = $props();

	let galleryStates = $state(
		Object.fromEntries(data.galleries.map((g) => [g.slug, getWindowState(`gallery-${g.slug}`, false)]))
	);

	function toggleGallery(slug) {
		galleryStates[slug] = !galleryStates[slug];
		setWindowState(`gallery-${slug}`, galleryStates[slug]);
	}

	// --- Responsive page size ---
	let cols = $state(2);

	function updateCols() {
		if (!browser) return;
		if (window.matchMedia('(min-width: 1024px)').matches) cols = 4;
		else if (window.matchMedia('(min-width: 768px)').matches) cols = 3;
		else cols = 2;
	}

	$effect(() => {
		if (!browser) return;
		updateCols();
		const mql1 = window.matchMedia('(min-width: 768px)');
		const mql2 = window.matchMedia('(min-width: 1024px)');
		const handler = () => updateCols();
		mql1.addEventListener('change', handler);
		mql2.addEventListener('change', handler);
		return () => {
			mql1.removeEventListener('change', handler);
			mql2.removeEventListener('change', handler);
		};
	});

	let pageSize = $derived(Math.max(4, cols * cols));

	// Per-gallery page tracking
	let galleryPages = $state(
		Object.fromEntries(data.galleries.map((g) => [g.slug, 0]))
	);

	function totalPages(gallery) {
		return Math.max(1, Math.ceil(gallery.photos.length / pageSize));
	}

	function setPage(slug, page) {
		galleryPages[slug] = page;
	}

	// Preload images for upcoming pages
	$effect(() => {
		if (!browser) return;
		for (const gallery of data.galleries) {
			const page = galleryPages[gallery.slug] ?? 0;
			const preloadStart = (page + 1) * pageSize;
			const preloadEnd = Math.min((page + 3) * pageSize, gallery.photos.length);
			for (let i = preloadStart; i < preloadEnd; i++) {
				const photo = gallery.photos[i];
				if (!photo) continue;
				const img = new window.Image();
				img.src = getImagePath(gallery.slug, photo, 0);
			}
		}
	});

	// --- Viewer ---
	let viewerGallery = $state(null);
	let currentFrameIndex = $state(0);

	let frames = $derived.by(() => {
		if (!viewerGallery) return [];
		const result = [];
		for (const photo of viewerGallery.photos) {
			const count = photo.images || 1;
			for (let i = 0; i < count; i++) {
				result.push({ photo, imageIndex: i, groupTotal: count });
			}
		}
		return result;
	});

	let currentFrame = $derived(frames[currentFrameIndex] ?? null);

	function getImagePath(gallerySlug, photo, imageIndex = 0) {
		const count = photo.images || 1;
		if (count === 1) {
			return `/photos/${gallerySlug}/${photo.id}.${photo.ext}`;
		}
		return `/photos/${gallerySlug}/${photo.id}-${imageIndex + 1}.${photo.ext}`;
	}

	function openViewer(gallery, photoIndex) {
		viewerGallery = gallery;
		let idx = 0;
		for (let i = 0; i < photoIndex; i++) {
			idx += (gallery.photos[i].images || 1);
		}
		currentFrameIndex = idx;
	}

	function closeViewer() {
		viewerGallery = null;
		currentFrameIndex = 0;
	}

	function navigate(delta) {
		const newIndex = currentFrameIndex + delta;
		if (newIndex >= 0 && newIndex < frames.length) {
			currentFrameIndex = newIndex;
		}
	}

	function handleKeydown(e) {
		if (!viewerGallery) return;
		if (e.key === 'ArrowLeft') { navigate(-1); e.preventDefault(); }
		if (e.key === 'ArrowRight') { navigate(1); e.preventDefault(); }
		if (e.key === 'Escape') { closeViewer(); e.preventDefault(); }
	}

	let currentPhotoIndex = $derived.by(() => {
		if (!viewerGallery || !currentFrame) return -1;
		return viewerGallery.photos.indexOf(currentFrame.photo);
	});
</script>

<svelte:head>
	<title>photos — elija sorensen</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-4 font-mono">
	<!-- Header -->
	<div class="mb-4">
		<a href="/" class="inline-flex items-center space-x-1 text-stone-600 hover:text-stone-800 text-sm">
			<ArrowLeft size={14} />
			<span>back</span>
		</a>
	</div>

	<!-- Gallery Windows -->
	{#each data.galleries as gallery}
		{@const page = galleryPages[gallery.slug] ?? 0}
		{@const pages = totalPages(gallery)}
		{@const start = page * pageSize}
		{@const visiblePhotos = gallery.photos.slice(start, start + pageSize)}
		<div class="mb-4 bg-stone-50 border-2 border-stone-400 shadow-md">
			<!-- Window Title Bar -->
			<button
				class="w-full bg-gradient-to-r from-stone-300 to-stone-400 border-b-2 border-stone-500 px-4 py-2 flex items-center justify-between cursor-pointer"
				onclick={() => toggleGallery(gallery.slug)}
			>
				<div class="flex items-center space-x-2">
					<Image size={14} class="text-stone-700" />
					<span class="text-sm font-bold text-stone-800">{gallery.title}</span>
					{#if gallery.description}
						<span class="text-xs text-stone-600">— {gallery.description}</span>
					{/if}
				</div>
				<div class="flex items-center space-x-1">
					<div class="w-6 h-6 bg-stone-200 border border-stone-400 flex items-center justify-center hover:bg-stone-300">
						<Minimize2 size={12} />
					</div>
				</div>
			</button>

			<!-- Gallery Content -->
			{#if galleryStates[gallery.slug]}
				<div class="p-4">
					{#if gallery.photos.length === 0}
						<p class="text-stone-400 text-sm italic">No photos yet.</p>
					{:else}
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{#each visiblePhotos as photo, i}
								<button
									class="relative bg-stone-200 border-2 border-stone-300 hover:border-stone-500 aspect-square overflow-hidden cursor-pointer group"
									onclick={() => openViewer(gallery, start + i)}
								>
									<img
										src={getImagePath(gallery.slug, photo, 0)}
										alt={photo.caption || photo.id}
										class="w-full h-full object-cover"
										loading="lazy"
									/>
									{#if (photo.images || 1) > 1}
										<div class="absolute top-1 right-1 bg-stone-800 text-stone-100 text-xs px-1.5 py-0.5 border border-stone-600 flex items-center space-x-1">
											<Layers size={10} />
											<span>{photo.images}</span>
										</div>
									{/if}
									{#if photo.caption}
										<div class="absolute bottom-0 left-0 right-0 bg-stone-800/80 text-stone-100 text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
											{photo.caption}
										</div>
									{/if}
								</button>
							{/each}
						</div>

						<!-- Pagination -->
						{#if pages > 1}
							<div class="mt-3 bg-stone-200 border-t border-stone-300 -mx-4 -mb-4 px-4 py-2 flex items-center justify-between">
								<button
									class="w-6 h-6 bg-stone-100 border border-stone-400 flex items-center justify-center hover:bg-stone-50 cursor-pointer disabled:opacity-30 disabled:cursor-default"
									disabled={page === 0}
									onclick={() => setPage(gallery.slug, page - 1)}
								>
									<ChevronLeft size={12} />
								</button>
								<span class="text-xs text-stone-600">
									{page + 1} / {pages}
								</span>
								<button
									class="w-6 h-6 bg-stone-100 border border-stone-400 flex items-center justify-center hover:bg-stone-50 cursor-pointer disabled:opacity-30 disabled:cursor-default"
									disabled={page >= pages - 1}
									onclick={() => setPage(gallery.slug, page + 1)}
								>
									<ChevronRight size={12} />
								</button>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Footer note -->
	<div class="mt-2 mb-4 px-1">
		<p class="text-xs text-stone-400">
			These images are downscaled and watermarked. If you're my friend or you're in a photo and want the original file, or if you have a concern, get in touch via any of the methods on <a href="/" class="underline hover:text-stone-600">the homepage</a>.
		</p>
	</div>
</div>

<!-- Photo Viewer Overlay -->
{#if viewerGallery && currentFrame}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 bg-stone-900/60 z-40" onclick={closeViewer} onkeydown={() => {}}></div>

	<div class="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none">
		<div class="w-full h-full max-w-5xl bg-stone-50 border-2 border-stone-400 shadow-lg flex flex-col pointer-events-auto">
			<!-- Title Bar -->
			<div class="bg-gradient-to-r from-stone-300 to-stone-400 border-b-2 border-stone-500 px-4 py-2 flex items-center justify-between shrink-0">
				<div class="flex items-center space-x-2">
					<Image size={14} class="text-stone-700" />
					<span class="text-sm font-bold text-stone-800">{viewerGallery.title}</span>
					<span class="text-xs text-stone-600">
						— {currentPhotoIndex + 1}/{viewerGallery.photos.length}
					</span>
				</div>
				<button
					class="w-6 h-6 bg-stone-200 border border-stone-400 flex items-center justify-center hover:bg-stone-300 cursor-pointer"
					onclick={closeViewer}
				>
					<X size={12} />
				</button>
			</div>

			<!-- Image Area -->
			<div class="flex-1 min-h-0 flex items-center justify-center bg-stone-200 relative p-4">
				{#if currentFrameIndex > 0}
					<button
						class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 border-2 border-stone-400 flex items-center justify-center hover:bg-stone-50 cursor-pointer z-10"
						onclick={() => navigate(-1)}
					>
						<ChevronLeft size={16} />
					</button>
				{/if}

				{#if currentFrameIndex < frames.length - 1}
					<button
						class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-100 border-2 border-stone-400 flex items-center justify-center hover:bg-stone-50 cursor-pointer z-10"
						onclick={() => navigate(1)}
					>
						<ChevronRight size={16} />
					</button>
				{/if}

				<img
					src={getImagePath(viewerGallery.slug, currentFrame.photo, currentFrame.imageIndex)}
					alt={currentFrame.photo.caption || currentFrame.photo.id}
					class="max-w-full max-h-full object-contain"
				/>
			</div>

			<!-- Group Indicator -->
			{#if currentFrame.groupTotal > 1}
				<div class="bg-stone-100 border-t border-stone-300 px-4 py-1.5 flex items-center justify-center space-x-1.5 shrink-0">
					{#each Array(currentFrame.groupTotal) as _, i}
						<div
							class="w-2 h-2 border border-stone-400 {i === currentFrame.imageIndex ? 'bg-stone-600' : 'bg-stone-200'}"
						></div>
					{/each}
				</div>
			{/if}

			<!-- Metadata Panel -->
			<div class="bg-stone-100 border-t-2 border-stone-400 p-4 shrink-0">
				{#if currentFrame.photo.caption}
					<p class="text-sm text-stone-800 mb-2">{currentFrame.photo.caption}</p>
				{/if}
				{#if currentFrame.photo.meta && Object.keys(currentFrame.photo.meta).length > 0}
					<div class="border-t border-stone-300 pt-2 mt-1">
						<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
							{#each Object.entries(currentFrame.photo.meta) as [key, value]}
								<span class="text-stone-500">{key}:</span>
								<span class="text-stone-700">{value}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
