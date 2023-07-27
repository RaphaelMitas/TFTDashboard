import admin from 'firebase-admin'

const serviceAccount = {
    "type": process.env.FIREBASE_TYPE as string,
    "project_id": process.env.FIREBASE_PROJECT_ID as string,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID as string,
    "private_key": (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL as string,
    "client_id": process.env.FIREBASE_CLIENT_ID as string,
    "auth_uri": process.env.FIREBASE_AUTH_URI as string,
    "token_uri": process.env.FIREBASE_TOKEN_URI as string,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL as string,
    "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN as string
};

const credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);

try {
    admin.initializeApp({
        credential: credential,
    })
    console.log('Initialized.')
} catch (error) {
    /*
     * We skip the "already exists" message which is
     * not an actual error when we're hot-reloading.
     */
    const err = error as Error;
    if (!/already exists/u.test(err.message)) {
        console.error('Firebase admin initialization error', err.stack)
    }
}

export default admin