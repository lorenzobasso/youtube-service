import { describe, expect, it, mock } from 'bun:test'
import { listify } from 'ts-helpers'

import { chunkRequests } from './pagination-helpers'

describe('pagination helpers', () => {
	describe('chunkRequests', () => {
		const chunkSize = 1

		const testCases: [number | number[], number[], number][] = [
			[[], [], 0],
			[0, [0], 1],
			[[0], [0], 1],
			[[0, 1], [0, 2], 2],
			[[0, 1, 2, 3], [0, 2, 4, 6], 4],
		]

		it.each(testCases)('chunking %s should return %s', async (args, expected, _) => {
			const request = (args: number | number[]) => Promise.resolve([listify(args)[0] * 2])
			const actual = await chunkRequests(request, args, chunkSize)
			expect(actual).toEqual(expected)
		})

		it.each(testCases)(
			'chunking %s to %s should make %s requests',
			async (args, _, expectedCallCount) => {
				const request = mock((args: number | number[]) => Promise.resolve([]))
				await chunkRequests(request, args, chunkSize)
				expect(request).toHaveBeenCalledTimes(expectedCallCount)
			},
		)
	})
})
