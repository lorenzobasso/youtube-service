import '@total-typescript/ts-reset'

import { google, youtube_v3 } from 'googleapis'
import { raise } from 'ts-helpers'

import { chunkRequests, fetchAllPages } from './pagination-helpers'

const requestChunkSize = 50

export class YoutubeService {
	constructor(
		private readonly _key?: string,
		private readonly youtube = google.youtube('v3'),
	) {}

	private get key() {
		return this._key ?? raise('No API key provided')
	}

	async listChannels(channelId: string | string[]) {
		return chunkRequests(
			(id: string[]) =>
				fetchAllPages((pageToken?: string) =>
					this.youtube.channels.list({
						key: this.key,
						part: ['snippet', 'contentDetails', 'statistics', 'topicDetails'],
						maxResults: 50,
						id,
						pageToken,
					}),
				),
			channelId,
		)
	}

	async listVideos(videoId: string | string[]) {
		return chunkRequests(
			(id: string[]) =>
				fetchAllPages((pageToken?: string) =>
					this.youtube.videos.list({
						key: this.key,
						part: ['snippet', 'contentDetails', 'statistics', 'topicDetails'],
						maxResults: 50,
						id,
						pageToken,
					}),
				),
			videoId,
			requestChunkSize,
		)
	}

	async listPlaylistItems(
		playlistId: string,
		shouldStopEarly: (items: youtube_v3.Schema$PlaylistItem[]) => boolean,
	) {
		return await fetchAllPages(
			(pageToken?: string) =>
				this.youtube.playlistItems.list({
					key: this.key,
					part: ['snippet', 'contentDetails', 'status'],
					maxResults: 50,
					playlistId,
					pageToken,
				}),
			shouldStopEarly,
		)
	}

	async listPlaylistVideos(
		playlistId: string,
		shouldStopEarly: (items: youtube_v3.Schema$PlaylistItem[]) => boolean = () => false,
	) {
		const items = await this.listPlaylistItems(playlistId, shouldStopEarly)
		const videoIds = items.map(item => item?.snippet?.resourceId?.videoId).filter(Boolean)
		return await this.listVideos(videoIds)
	}

	async listNewPlaylistVideos(playlistId: string, oldVideoIds: string[]) {
		return await this.listPlaylistVideos(playlistId, items =>
			items.some(item => oldVideoIds.includes(item.snippet?.resourceId?.videoId ?? '')),
		)
	}

	async listChannelByVideo(videoId: string) {
		const [video] = await this.listVideos([videoId])
		return await this.listChannels(video.snippet?.channelId ?? raise(`No channel for ${videoId}`))
	}
}
