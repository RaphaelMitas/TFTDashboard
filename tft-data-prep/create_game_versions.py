
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os


load_dotenv()

mongo_pw = os.environ['MONGO_DB_PASSWORD']

uri = f"mongodb+srv://admin:{mongo_pw}@ruffysfeuerstelle.jw6klif.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))


result = client['ruffys-feuerstelle']['tftmatches'].aggregate([
    {
        '$group': {
            '_id': '$info.game_version', 
            'count': {
                '$sum': 1
            }, 
            'earliest_date': {
                '$min': '$info.game_datetime'
            }, 
            'latest_date': {
                '$max': '$info.game_datetime'
            }
        }
    }, {
        '$out': 'game_versions'
    }
])