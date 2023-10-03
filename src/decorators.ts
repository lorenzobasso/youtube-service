import { invariant, raise } from 'ts-helpers'

import { chunkRequests } from './pagination-helpers'
import { ChunkableRequest } from './types'

export function chunk<T, R>(chunkSize: number) {
	invariant(chunkSize > 0, 'Chunk size must be greater than 0')

	function wrapper(
		target: Object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<ChunkableRequest<T, R>>,
	) {
		const originalMethod = descriptor.value ?? raise(`Method ${propertyKey} not found`)

		descriptor.value = async function (args: T | T[]): Promise<R[]> {
			const result = await chunkRequests(originalMethod, args, chunkSize)
			return result
		}

		return descriptor
	}

	return wrapper
}
