import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

export const FieldValue = admin.firestore.FieldValue
export type Timestamp = admin.firestore.Timestamp
export type GeoPoint = admin.firestore.GeoPoint
export type QuerySnapshot = admin.firestore.QuerySnapshot
export type DocumentSnapshot = admin.firestore.DocumentSnapshot
export type DocumentData = admin.firestore.DocumentData

admin.initializeApp()

export const db = admin.firestore()

export const genAuthToken = functions.https.onCall((data, context) => {
    const externalId: string = data.externalId

    if (externalId === undefined) {
        return Promise.reject(`Cannot create a customToken for new User(=${externalId})`)
    }

    return admin.auth().createCustomToken(externalId)
        .then(customToken => { return { customToken: customToken } })
        .catch(error => console.log(`Error creating custom token for externalId(=${externalId}):`, error));
})