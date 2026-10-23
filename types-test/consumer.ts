// Consumer-side check of the public types. Nothing here runs.
//
// scripts/check-package.sh compiles this file against the packed tarball, installed
// as a dependency, under several module resolution modes. It guards what neither
// publint nor attw can: that the hand-written src/index.d.ts still says what the
// implementation does (promises returned, argument shapes, result shapes).
//
// Two kinds of check:
//   - `Expect<Equal<...>>` fails to compile when a type changes.
//   - `@ts-expect-error` fails to compile when the line below it stops being an error.

import { RngWithIntention } from 'rng-with-intention';
import type { RngWithIntentionOptions, DrawResult, DrawMultipleResult } from 'rng-with-intention';

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

export type Checks = [
	Expect<Equal<ReturnType<RngWithIntention['draw']>, Promise<DrawResult>>>,
	Expect<Equal<ReturnType<RngWithIntention['drawMultiple']>, Promise<DrawMultipleResult>>>,
	Expect<Equal<Parameters<RngWithIntention['draw']>, [intention: string, max: number]>>,
	Expect<
		Equal<
			Parameters<RngWithIntention['drawMultiple']>,
			[intention: string, max: number, count: number, allowDuplicates?: boolean]
		>
	>,
	Expect<Equal<DrawResult, { index: number; timestamp: string }>>,
	Expect<Equal<DrawMultipleResult, { indices: number[]; timestamp: string }>>,
	Expect<Equal<RngWithIntentionOptions, { includeTimestamp?: boolean; includeEntropy?: boolean }>>
];

// Construction
export const defaults = new RngWithIntention();
export const empty = new RngWithIntention({});
export const deterministic = new RngWithIntention({ includeTimestamp: false, includeEntropy: false });
// @ts-expect-error unknown option
export const unknownOption = new RngWithIntention({ includeSalt: true });

// Calls
export async function usage(): Promise<void> {
	const one = await defaults.draw('intention', 78);
	const index: number = one.index;
	const when: string = one.timestamp;

	const many = await defaults.drawMultiple('intention', 78, 3);
	const unique = await defaults.drawMultiple('intention', 78, 3, false);
	const first: number | undefined = unique.indices[0];

	void [index, when, many, first];

	// @ts-expect-error draw returns a promise, so the result is not readable without await
	void defaults.draw('intention', 78).index;
	// @ts-expect-error max is required
	await defaults.draw('intention');
	// @ts-expect-error intention must be a string
	await defaults.draw(42, 78);
	// @ts-expect-error count is required
	await defaults.drawMultiple('intention', 78);
}
