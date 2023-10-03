import { YoutubeService } from './src/youtube-service'

export { YoutubeService } from './src/youtube-service'

const youtube = new YoutubeService()
const single = await youtube.listChannels(['1', '2', '3'])

console.log(single)
