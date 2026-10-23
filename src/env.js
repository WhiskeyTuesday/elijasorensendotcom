import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	// Paste routes check configuration at request time; public pages also work without it.
	J17_BASE_URL: { schema: (value) => value ?? '' },
	J17_API_KEY: { schema: (value) => value ?? '' },
	PASTE_API_KEY: { schema: (value) => value ?? '' }
});
