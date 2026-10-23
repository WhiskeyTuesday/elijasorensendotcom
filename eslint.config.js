import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    // Keep the existing rules while upgrading the plugin. The site has no base path,
    // and changing list identity is separate from this dependency security update.
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/require-each-key': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
    }
  },
  {
    languageOptions: {
	  globals: {
	    ...globals.browser,
	    ...globals.node
	  }
	}
  }
];
