export type ChunkableRequest<T, R> = (args: T[]) => Promise<R[]>
