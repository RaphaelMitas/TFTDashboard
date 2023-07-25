
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

DO_MONGO_DB_CONNECTION_STRING = os.environ['DO_MONGO_DB_CONNECTION_STRING']
DO_MONGO_DB_PASSWORD = os.environ['DO_MONGO_DB_PASSWORD']
DO_MONGO_DB_USER = os.environ['DO_MONGO_DB_USER']

uri = f"mongodb+srv://{DO_MONGO_DB_USER}:{DO_MONGO_DB_PASSWORD}@{DO_MONGO_DB_CONNECTION_STRING}"

print("Connecting to MongoDB...")
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
print("Connected!")

db = client.get_database('ruffys-feuerstelle')

db.get_collection('tftmatches').delete_many({
    "info.game_version": "Version 13.12.515.4234 (Jun 14 2023/16:24:39) [PUBLIC] <Releases/13.12>"
})
