import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@ruffysfeuerstelle.jw6klif.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
client.connect();

export default client;

export const db = client.db('ruffys-feuerstelle');