/**
 * Configuration options for RngWithIntention
 */
export interface RngWithIntentionOptions {
	/** Include a timestamp in the seed (default: true) */
	includeTimestamp?: boolean;
	/** Include system entropy in the seed (default: true) */
	includeEntropy?: boolean;
}

/**
 * Result of a single draw
 */
export interface DrawResult {
	/** The drawn index, in the range [0, max) */
	index: number;
	/** ISO 8601 timestamp of when the draw occurred */
	timestamp: string;
}

/**
 * Result of a multiple draw
 */
export interface DrawMultipleResult {
	/** The drawn indices, each in the range [0, max) */
	indices: number[];
	/** ISO 8601 timestamp of when the draw occurred */
	timestamp: string;
}

/**
 * A random number generator seeded by human intention.
 *
 * Combines user intention text, a precise timestamp, and cryptographic
 * system entropy to produce random numbers suitable for divination and
 * contemplative practices.
 */
export declare class RngWithIntention {
	constructor(options?: RngWithIntentionOptions);

	/**
	 * Draw a single random index based on intention.
	 *
	 * @param intention - The user's intention (any non-empty string)
	 * @param max - Upper bound, exclusive — returns an index in [0, max)
	 * @returns A promise resolving to the draw result
	 */
	draw(intention: string, max: number): Promise<DrawResult>;

	/**
	 * Draw multiple random indices with a single intention.
	 *
	 * @param intention - The user's intention (any non-empty string)
	 * @param max - Upper bound, exclusive — each index is in [0, max)
	 * @param count - Number of indices to draw
	 * @param allowDuplicates - Whether the same index may appear more than once (default: true)
	 * @returns A promise resolving to the draw result
	 */
	drawMultiple(
		intention: string,
		max: number,
		count: number,
		allowDuplicates?: boolean
	): Promise<DrawMultipleResult>;
}
