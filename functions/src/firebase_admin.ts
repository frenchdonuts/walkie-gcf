import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

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