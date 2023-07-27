import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { parser } from 'stream-json';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const pipeline = fs.createReadStream(path.join(__dirname, 'ruffys-feuerstelle.tftmatches.json'))
    .pipe(parser())
    .pipe(streamArray());

let counter = 0;

const delay = (ms: number | undefined) => new Promise(res => setTimeout(res, ms));

async function writeDocument(tftmatchRef: any, tftmatch: any, retries = 3) {
    if (retries === 0) {
        console.log(`Failed to write document after 3 attempts, moving to next document.`);
        return;
    }

    try {
        await tftmatchRef.set(tftmatch);
        counter++;
        if (counter <= 10 || counter % 400 === 0) {
            console.log(`Document ${counter} written successfully`);
        }
    } catch (error) {
        console.error(`Error writing document, retrying. Retries left: ${retries - 1}`);
        await delay(1000); // delay 1 second before retry
        await writeDocument(tftmatchRef, tftmatch, retries - 1);
    }
}

pipeline.on('data', async ({ key, value }: any) => {
    pipeline.pause(); // pause the reading while writing
    let tftmatch: any = value;
    const { _id, __v, id, ...tftmatchWithoutId } = tftmatch;
    tftmatch = tftmatchWithoutId;

    const tftmatchRef = db.collection('tftmatches').doc(tftmatch.metadata.match_id);
    if (counter <= 10 || counter % 400 === 0) {
        console.log(`Starting to write document ${counter + 1}`);
    }
    await writeDocument(tftmatchRef, tftmatch);
    pipeline.resume(); // resume the reading after writing
});

pipeline.on('end', () => {
    console.log('All data has been processed');
});
