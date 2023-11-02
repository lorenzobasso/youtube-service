import { GaxiosPromise } from 'gaxios'
import { chunk } from 'lodash'
import { invariant, listify } from 'ts-helpers'
import { raise } from 'ts-helpers'

import { ChunkableRequest } from './types'

export const chunkRequests = async <T, R>(
	request: ChunkableRequest<T, R>,
	args: T | T[],
	chunkSize = 50,
) => {
	invariant(chunkSize > 0, 'Chunk size must be greater than 0')
	let responses: R[] = []

	for (const argChunk of chunk(listify(args), chunkSize)) {
		responses = responses.concat(await request(argChunk))
	}

	return responses
}

export const unwrapRequest = async <T>(request: () => GaxiosPromise<T>) => {
	try {
		const response = await request()

		if (response.status !== 200) {
			raise(`The request failed with ${response.statusText}`)
		}

		return response.data
	} catch (error) {
		throw error
	}
}

export const fetchAllPages = async <T>(
	request: (pageToken?: string) => GaxiosPromise<{ items?: T[]; nextPageToken?: string | null }>,
	shouldStopEarly: (items: T[]) => boolean = () => false,
) => {
	let pageToken: string | undefined = undefined
	let results = []

	while (true) {
		const { items, nextPageToken } = await unwrapRequest(() => request(pageToken))

		results.push(...(items ?? []))
		pageToken = nextPageToken ?? undefined
		if (!nextPageToken || shouldStopEarly(items ?? [])) break
	}

	return results
}
