import { db, DocumentData, DocumentSnapshot } from './firebase_admin'
import { Option } from './option'
import { notUndefined } from './utils'
import { URL } from 'url'

export const userCollectionPath = `/users`

export class User {
  constructor(
    public id: string,
    public username: string,
    public avatarURL: URL,
    public channelsCount: number,
    public createdAt: Date,
    public externalIdTag: string,
    public externalIdPayload: any,
    public oneSignalPlayerId?: string
  ) { }
  public static from(doc: DocumentSnapshot): Option<User> {
    const data: Option<DocumentData> = doc.data()
    const createdAt = doc.createTime
    if (data && createdAt) {
      return new User(
        doc.id,
        data.username,
        new URL(data.avatarURL),
        data.channelsCount,
        createdAt.toDate(),
        data.externalIdTag,
        data.externalIdPayload,
        data.oneSignalPlayerId
      )
    }

    return undefined
  }
}

export class UserDisplay {
  constructor(public id: string,
    public username: string,
    public avatarURL: URL) { }
  public static from(data: any): Option<UserDisplay> {
    if (data && data.id && data.username && data.avatarURL) {
      return new UserDisplay(
        data.id,
        data.username,
        new URL(data.avatarURL)
      )
    }

    return undefined
  }
}

const userCollection = db.collection(userCollectionPath)

export function getUser(uid: string) {
  return userCollection.doc(uid).get()
    .then(docSnapshot => User.from(docSnapshot))
}

export function getUsers(uids: string[]) {
  const tasks = uids.map(uid =>
    getUser(uid)
      .catch(e => { console.log(e); return undefined })
  )
  return Promise.all(tasks)
    .then(users => users.filter(notUndefined))
}