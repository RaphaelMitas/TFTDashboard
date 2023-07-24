import { MongoClient, ServerApiVersion } from 'mongodb';


const DO_MONGO_DB_CONNECTION_STRING = process.env.DO_MONGO_DB_CONNECTION_STRING as string;
const DO_MONGO_DB_PASSWORD = process.env.DO_MONGO_DB_PASSWORD as string;
const DO_MONGO_DB_USER = process.env.DO_MONGO_DB_USER as string;

const uri = `mongodb+srv://${DO_MONGO_DB_USER}:${DO_MONGO_DB_PASSWORD}@${DO_MONGO_DB_CONNECTION_STRING}`;
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