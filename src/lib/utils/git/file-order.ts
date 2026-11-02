// Copyright (C) 2026 Benjamin Bonneton and the Cairn Foundry contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

const TEST_DIRS = new Set(["__tests__", "test", "tests", "spec"]);

/**
 * Whether a path is a test by the conventions of the common toolchains: a
 * `.test.` / `.spec.` segment in the name (JS, TS), `test_` or `_test`
 * (pytest, Go), a `Test` / `Tests` suffix (Java, C#, PHP), or a test directory.
 */
export function isTestFile(path: string): boolean {
	const parts = path.split("/");
	const name = parts.pop() ?? "";
	if (parts.some((dir) => TEST_DIRS.has(dir))) return true;
	const stem = name.replace(/\.[^.]*$/, "");
	return (
		/\.(test|spec)(\.|$)/.test(name) ||
		/^test_|_test$/.test(stem) ||
		/Tests?$/.test(stem)
	);
}

/** Orders changed files by name then path, with the tests after the rest. */
export function compareChangedFiles(a: string, b: string): number {
	const testsLast = Number(isTestFile(a)) - Number(isTestFile(b));
	if (testsLast) return testsLast;
	const nameA = a.slice(a.lastIndexOf("/") + 1);
	const nameB = b.slice(b.lastIndexOf("/") + 1);
	return nameA.localeCompare(nameB) || a.localeCompare(b);
}
