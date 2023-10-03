export type ChunkableRequest<T, R> = (args: T | T[]) => Promise<R[]>
