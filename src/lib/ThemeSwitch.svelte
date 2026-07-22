<script>
	import { Sun, Monitor, Moon } from 'lucide-svelte';
	import { themeState, setTheme } from '$lib/theme.svelte.js';

	const opts = [
		{ v: 'light', icon: Sun, label: 'light theme' },
		{ v: 'system', icon: Monitor, label: 'system theme' },
		{ v: 'dark', icon: Moon, label: 'dark theme' }
	];
</script>

<div
	class="inline-flex border-2 border-stone-400 bg-stone-100 font-mono shadow-sm"
	role="group"
	aria-label="color theme"
>
	{#each opts as o, i}
		<button
			onclick={() => setTheme(o.v)}
			title={o.label}
			aria-label={o.label}
			aria-pressed={themeState.choice === o.v}
			class="p-1.5 transition-colors hover:bg-stone-200 hover:text-stone-800
				{i > 0 ? 'border-l-2 border-stone-400' : ''}
				{themeState.choice === o.v ? 'bg-stone-300 text-stone-800' : 'text-stone-500'}"
		>
			<o.icon size={14} />
		</button>
	{/each}
</div>
