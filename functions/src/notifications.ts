import * as functions from 'firebase-functions';
import axios from 'axios'
import { notUndefined } from "./utils";

import { getChannel } from './channel'
import { getUsers } from './user'

export const notifyParticipants = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid)
    return Promise.reject(`Unauthenticated call to notifyParticipants.`)
  const uid = context.auth.uid
  const channelId = data.channelId
  const msg = data.msg
  const payload = data.data

  if (!msg || !channelId)
    return Promise.reject(`Cannot push notify participants with falsey channelId(=${channelId}) or msg(=${msg}).`)


  return getChannel(channelId)
    .then(channel => {
      if (!channel) 
        return Promise.reject(`No channel w/ id(=${channelId}) found`)

      const notifyTasks = channel.participantsIds
        .filter(id => id != uid)
        .map(participantId => {
          const notifyConfig = {
            msg: msg,
            data: Object.assign({ notifierId: uid, channelId: channel.id }, payload)
          }
          return notifyUser(participantId, notifyConfig)
            .catch(e => console.log(e))
        })

      return Promise.all(notifyTasks)
    })
})

const oneSignalAppID = functions.config().one_signal.app_id
const oneSignalAPIKey = functions.config().one_signal.api_key

export interface NotifyConfig {
  msg?: string
  data?: any
  headings?: string
  badgeType?: "SetTo" | "Increase"
  imageUrl?: string
}
export function notifyUser(userId: string, config: NotifyConfig) {
  return notifyUsers([userId], config)
}
export function notifyUsers(userIds: string[], config: NotifyConfig) {
  return getUsers(userIds)
    .then(users => {
      return users
        .map(user => user.oneSignalPlayerId)
        .filter(notUndefined)
    })
    .then(oneSignalPlayerIds => {
      if (oneSignalPlayerIds.length > 0) {
        const payload: any = {
          app_id: oneSignalAppID,
          include_player_ids: oneSignalPlayerIds,
          content_available: true
        }
        if (config.msg) {
          payload['contents'] = { "en": config.msg }
        }
        if (config.data) {
          payload['data'] = config.data
        }
        if (config.headings) {
          payload['headings'] = { "en": config.headings }
        }
        if (config.badgeType) {
          payload['ios_badgeType'] = config.badgeType
          payload['ios_badgeCount'] = 1
        }

        return sendNotification(payload)
          .then((response) => console.log(response.data))
      }

      return Promise.reject(`No oneSignalPlayerIds to send push notifications to.`)
    })
}

export function notifyAll(msg: string) {
  const payload = {
    app_id: oneSignalAppID,
    contents: { "en": msg },
    included_segments: ["All"]
  }
  return sendNotification(payload)
    .then((response) => console.log(response.data))
}

export function notifySegments(segments: string[], code: string, msg: string, data: any = null, imageUrl?: string) {
  const payload: any = {
    app_id: oneSignalAppID,
    included_segments: segments,
    content_available: true
  }
  if (msg) {
    payload['contents'] = { "en": msg }
  }
  if (data) {
    payload['data'] = data
  }
  if (imageUrl) {
    payload['ios_attachments'] = {
      'urlImageString': imageUrl
    };
  }
  return sendNotification(payload)
    .then((response) => console.log(response.data))
}

function sendNotification(payload: any) {
  const headers = {
    "Authorization": `Basic ${oneSignalAPIKey}`
  }

  return axios.post('https://onesignal.com/api/v1/notifications',
    payload,
    { headers: headers })
}