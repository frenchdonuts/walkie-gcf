import * as admin from './firebase_admin'
import * as OT from './open_tok'


export const genOpenTokSession = OT.genSession
export const genOpenTokToken = OT.genToken

export const genAuthToken = admin.genAuthToken
