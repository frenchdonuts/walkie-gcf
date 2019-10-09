import { db, DocumentData, DocumentSnapshot } from './firebase_admin'
import { Option } from './option'

export const channelCollectionPath = () => {
  return `/channels`
}

const channelCollection = () => {
  return db.collection(channelCollectionPath())
}

export class Channel {
  constructor(
    public id: string,
    public creatorId: string,
    public participantsIds: string[],
    public otSessionId: string,
    public createdAt: Date) { }
  public static from(doc: DocumentSnapshot): Option<Channel> {
    const data: Option<DocumentData> = doc.data()
    const createdAt = doc.createTime
    if (data && data.creatorId && data.participantsIds && data.otSessionId && createdAt) {
      return new Channel(
        doc.id,
        data.creatorId,
        data.participantsIds,
        data.otSessionId,
        createdAt.toDate()
      )
    }

    return undefined
  }
}

export function getChannels(uid: string) {
  return channelCollection()
    .where('participantsIds', 'array-contains', uid)
    .get()
}

export function getChannel(id: string): Promise<Option<Channel>> {
  return channelCollection()
    .doc(id)
    .get()
    .then(Channel.from)
}