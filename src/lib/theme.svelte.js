// Theme: 'light' | 'dark' | 'system'. Persisted to localStorage; applies the
// `.dark` class on <html> (which drives the palette inversion in app.css).
// The no-FOUC script in app.html sets the class pre-paint; this keeps the
// in-app state in sync and reacts to OS changes while on 'system'.
const KEY = 'theme';

export const themeState = $state({ choice: 'system' });

function prefersDark() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme() {
	const dark = themeState.choice === 'dark' || (themeState.choice === 'system' && prefersDark());
	document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(choice) {
	themeState.choice = choice;
	try {
		localStorage.setItem(KEY, choice);
	} catch {
		/* ignore */
	}
	applyTheme();
}

export function initTheme() {
	try {
		themeState.choice = localStorage.getItem(KEY) || 'system';
	} catch {
		/* ignore */
	}
	applyTheme();
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', () => {
			if (themeState.choice === 'system') applyTheme();
		});
}
