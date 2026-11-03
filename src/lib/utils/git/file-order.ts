// Copyright (C) 2026 Benjamin Bonneton and the Cairn Foundry contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

const TEST_DIRS = new Set([
	"__tests__",
	"test",
	"tests",
	"spec",
	"e2e",
	"cypress",
]);

/** `MyApp.Tests`, `MyApp.UnitTests`: the test project of a .NET solution. */
const DOTNET_TEST_DIR = /(\.|[a-z])Tests$/;

/** `UserSpec.kt`, `UserSuite.scala`, `UserIT.java`: Kotest, ScalaTest, Spock and Maven failsafe. */
const JVM_SOURCE = /\.(java|kt|kts|scala|groovy)$/;

/**
 * Whether a path is a test by the conventions of the common toolchains: a
 * `.test.` / `.spec.` / `.cy.` segment in the name (JS, TS), `test_` or
 * `_test` / `_spec` / `_unittest` (pytest, Go, Ruby, Google Test), a `Test` /
 * `Tests` suffix (Java, C#, PHP, Swift), the JVM suffixes above, `conftest.py`,
 * or a test directory anywhere on the way.
 */
export function isTestFile(path: string): boolean {
	const parts = path.split("/");
	const name = parts.pop() ?? "";
	if (
		parts.some(
			(dir) => TEST_DIRS.has(dir.toLowerCase()) || DOTNET_TEST_DIR.test(dir),
		)
	) {
		return true;
	}
	if (name === "conftest.py") return true;
	const stem = name.replace(/\.[^.]*$/, "");
	return (
		/\.(test|spec|cy)(\.|$)/.test(name) ||
		/^test_|_(test|spec|unittest)$/.test(stem) ||
		/Tests?$/.test(stem) ||
		(JVM_SOURCE.test(name) && /(Spec|Suite|[a-z]IT)$/.test(stem))
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
