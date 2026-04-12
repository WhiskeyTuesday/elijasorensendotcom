import { browser } from '$app/environment';

const STORAGE_KEY = 'es-window-states';

function loadAll() {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
	} catch {
		return {};
	}
}

function saveAll(states) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
	} catch {
		// storage full or unavailable
	}
}

export function getWindowState(key, defaultValue) {
	const all = loadAll();
	return key in all ? all[key] : defaultValue;
}

export function setWindowState(key, value) {
	const all = loadAll();
	all[key] = value;
	saveAll(all);
}
