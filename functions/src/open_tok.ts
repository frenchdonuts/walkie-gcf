import * as OpenTok from 'opentok'
import * as functions from 'firebase-functions'

const apiKey = functions.config().opentok.api_key
const apiSecret = functions.config().opentok.secret

export const genSession = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid)
    return Promise.reject(`Unauthenticated attempt to create OT session.`)

  const ot = new OpenTok(apiKey, apiSecret)
  return createSession(ot, {})
    .then(session => ({ sessionId: session.sessionId }))
})

export const genToken = functions.https.onCall((data, context) => {
  if (!context.auth || !context.auth.uid)
    return Promise.reject(`Unauthenticated attempt to create OT session.`)
  const sessionId = data.sessionId
  const uid = context.auth.uid
  const name:string = data.name
  const avatarURL:string = data.avatarURL
  if (!sessionId || !name || !avatarURL) { 
    const msg = `sessionId(=${sessionId}), name(=${name}), or avatarURL(=${avatarURL}) undefined`
    return Promise.reject(msg)
  }

  const ot = new OpenTok(apiKey, apiSecret)
  const token = ot.generateToken(sessionId, {
    data: `uid=${uid},name=${name},avatarURL=${avatarURL}`
  })
  return ({ token: token })
})

function createSession(ot: OpenTok, options: OpenTok.SessionOptions): Promise<OpenTok.Session> {
  return new Promise((resolve, reject) => {
    ot.createSession(options, (error, session) => {
      if (error) { reject(error); return }
      if (!session) { reject(`Created OT session is null`); return }
      resolve(session)
    })
  })
}