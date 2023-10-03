import '@total-typescript/ts-reset'

import { google, youtube_v3 } from 'googleapis'
import { raise } from 'ts-helpers'

import { chunk } from './decorators'

const Resource = {
	Video: 'videos',
	Channel: 'channels',
	PlaylistItems: 'playlistItems',
} as const

const requestChunkSize = 0

export class YoutubeService {
	constructor(
		private readonly _key?: string,
		private readonly youtube = google.youtube('v3'),
	) {}

	private get key() {
		return this._key ?? raise('No API key provided')
	}

	@chunk(requestChunkSize)
	async listChannels(channelId: string | string[]) {
		return []
	}

	@chunk(requestChunkSize)
	async listVideos(videoId: string | string[]) {
		return []
	}

	listPlaylistItems(playlistId: string, shouldStopEarly = () => false) {}
}
