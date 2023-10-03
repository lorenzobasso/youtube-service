import { chunk } from 'lodash'
import { listify } from 'ts-helpers'

import { ChunkableRequest } from './types'

export const chunkRequests = async <T, R>(
	request: ChunkableRequest<T, R>,
	args: T | T[],
	chunkSize = 50,
) => {
	let responses: R[] = []

	for (const argChunk of chunk(listify(args), chunkSize)) {
		responses = responses.concat(await request(argChunk))
	}

	return responses
}
