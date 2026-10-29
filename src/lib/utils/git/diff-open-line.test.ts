// Copyright (C) 2026 Benjamin Bonneton and the Cairn Foundry contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { afterEach, describe, expect, it } from "vitest";
import type { GitDiffHunk } from "$lib/services/git-service";
import { diffOpenLine, firstChangedLine } from "./diff-open-line";

const hunk = (header: string, kinds: string): GitDiffHunk => ({
	header,
	lines: Array.from(kinds, (k) => ({
		kind: k === "+" ? "add" : k === "-" ? "remove" : "context",
		content: "",
	})),
});

describe("firstChangedLine", () => {
	it("points at the first added line, past the leading context", () => {
		expect(firstChangedLine([hunk("@@ -10,5 +10,6 @@", "  +  ")])).toBe(12);
	});

	it("points at the line a deletion left in place", () => {
		expect(firstChangedLine([hunk("@@ -10,5 +10,4 @@", " -   ")])).toBe(11);
	});

	it("reads the first hunk only", () => {
		expect(
			firstChangedLine([
				hunk("@@ -3,2 +3,3 @@", "+  "),
				hunk("@@ -40,2 +41,3 @@", "+  "),
			]),
		).toBe(3);
	});

	it("is null without hunks", () => {
		expect(firstChangedLine([])).toBeNull();
	});
});

describe("diffOpenLine", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	/** Rows stacked 20px high in a list whose top edge sits at `scrollTop`. */
	function mountCard(rows: (number | null)[], scrollTop: number): Element {
		document.body.innerHTML = `<div class="hunks-list"><div class="hunk-card">${rows
			.map(
				(line) =>
					`<div class="diff-row"${line === null ? "" : ` data-line="${line}"`}></div>`,
			)
			.join("")}</div></div>`;
		const list = document.querySelector(".hunks-list") as HTMLElement;
		list.getBoundingClientRect = () => ({ top: scrollTop }) as DOMRect;
		document.querySelectorAll<HTMLElement>(".diff-row").forEach((row, i) => {
			row.getBoundingClientRect = () =>
				({ top: i * 20, bottom: i * 20 + 20 }) as DOMRect;
		});
		return document.querySelector(".hunk-card") as Element;
	}

	const hunks = [hunk("@@ -1,3 +1,4 @@", "+   ")];

	it("returns the first row still visible in the list", () => {
		expect(diffOpenLine(mountCard([1, 2, 3, 4], 45), hunks)).toBe(3);
	});

	it("skips a removed row to the line that follows it", () => {
		expect(diffOpenLine(mountCard([1, null, null, 7], 25), hunks)).toBe(7);
	});

	it("falls back to the first change when no row is visible", () => {
		expect(diffOpenLine(mountCard([1, 2], 500), hunks)).toBe(1);
	});

	it("falls back to the first change without a card", () => {
		expect(diffOpenLine(null, hunks)).toBe(1);
	});
});
