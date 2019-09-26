import { db, DocumentData, DocumentSnapshot } from './firebase_admin'
import { userCollectionPath, UserDisplay } from './user'
import { Option } from './option'

export const channelCollectionPath = (uid: string) => {
  return `${userCollectionPath}/${uid}/channels`
}

const channelCollection = (uid: string) => {
  return db.collection(channelCollectionPath(uid))
}

export class Channel {
  constructor(
    public id: string,
    public otherUser: UserDisplay,
    public slot: number,
    public createdAt: Date,
    public otSessionId: string) { }
  public static from(doc: DocumentSnapshot): Option<Channel> {
    const data: Option<DocumentData> = doc.data()
    const createdAt = doc.createTime
    if (data && data.otherUser && data.slot && createdAt && data.otSessionId) {
      const otherUser = UserDisplay.from(data.otherUser)
      if (!otherUser) return undefined

      return new Channel(
        doc.id,
        otherUser,
        data.slot,
        createdAt.toDate(),
        data.otSessionId
      )
    }

    return undefined
  }
}

export function getChannels(uid: string) {
  return channelCollection(uid).get()
}