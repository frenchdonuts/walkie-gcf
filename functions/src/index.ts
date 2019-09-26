import * as admin from './firebase_admin'
import * as OT from './open_tok'
import * as Notifications from './notifications'


export const genOpenTokSession = OT.genSession
export const genOpenTokToken = OT.genToken

export const genAuthToken = admin.genAuthToken

export const notifyFriends = Notifications.notifyFriends