<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { initTheme } from '$lib/theme.svelte.js';
  import ThemeSwitch from '$lib/ThemeSwitch.svelte';

  let { children } = $props();

  onMount(() => initTheme());
</script>

<div class="fixed bottom-3 right-3 z-50">
  <ThemeSwitch />
</div>

{@render children()}
