// Copyright (C) 2026 Benjamin Bonneton and the Cairn Foundry contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { compareChangedFiles, isTestFile } from "./file-order";

describe("isTestFile", () => {
	it("recognises the naming conventions of the usual toolchains", () => {
		for (const path of [
			"src/lib/stores/git.test.ts",
			"src/app.spec.tsx",
			"src/lib/utils/x.svelte.test.ts",
			"pkg/parser_test.go",
			"tests_pkg/test_parser.py",
			"app/Models/UserTest.php",
			"Project/UserTests.cs",
			"src/test/git-view.test.ts",
			"src/__tests__/app.ts",
			"spec/models/user_spec.rb",
		]) {
			expect(isTestFile(path), path).toBe(true);
		}
	});

	it("leaves the other files alone", () => {
		for (const path of [
			"src/lib/stores/git.ts",
			"src/lib/utils/git/diff-size.ts",
			"src-tauri/src/commands/tests/mod.rs",
			"docs/testing.md",
			"src/contest.ts",
			"src/latest.ts",
			"src/testimonials.ts",
		]) {
			expect(isTestFile(path), path).toBe(path.includes("/tests/"));
		}
	});
});

describe("compareChangedFiles", () => {
	it("orders by file name, then by path", () => {
		const paths = ["src/b/a.ts", "src/z.ts", "src/a/a.ts"];
		expect(paths.sort(compareChangedFiles)).toEqual([
			"src/a/a.ts",
			"src/b/a.ts",
			"src/z.ts",
		]);
	});

	it("puts the tests after the other files", () => {
		const paths = [
			"src/a.test.ts",
			"src/z.ts",
			"src/test/parcours.test.ts",
			"src/a.ts",
		];
		expect(paths.sort(compareChangedFiles)).toEqual([
			"src/a.ts",
			"src/z.ts",
			"src/a.test.ts",
			"src/test/parcours.test.ts",
		]);
	});
});
