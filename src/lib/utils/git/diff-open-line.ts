// Copyright (C) 2026 Benjamin Bonneton and the Cairn Foundry contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { GitDiffHunk } from "$lib/services/git-service";
import { parseHunkRange } from "./diff-context";

/**
 * The line of the file's current version where the first change starts: the
 * first added line, or the line a deletion left in place. Null without hunks.
 */
export function firstChangedLine(hunks: GitDiffHunk[]): number | null {
	const hunk = hunks[0];
	if (!hunk) return null;
	let newNo = parseHunkRange(hunk.header)?.newFirst ?? 1;
	for (const line of hunk.lines) {
		if (line.kind !== "context") return newNo;
		newNo++;
	}
	return newNo;
}

/**
 * The line being read in a diff card: the first row still visible in the
 * scrolled list, or the first change when the rows are folded or offscreen. A
 * removed row has no line of its own, so the row after it answers for it.
 */
export function diffOpenLine(
	card: Element | null,
	hunks: GitDiffHunk[],
): number | null {
	if (card) {
		const viewport = card.closest(".hunks-list") ?? card;
		const top = viewport.getBoundingClientRect().top;
		let reached = false;
		for (const row of card.querySelectorAll<HTMLElement>(".diff-row")) {
			reached ||= row.getBoundingClientRect().bottom > top;
			const line = reached ? Number(row.dataset.line) : 0;
			if (line > 0) return line;
		}
	}
	return firstChangedLine(hunks);
}
