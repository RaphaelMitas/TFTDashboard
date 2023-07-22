
from dotenv import load_dotenv
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def main():
    load_dotenv()

    
    mongo_pw = os.environ['MONGO_DB_PASSWORD']

    uri = f"mongodb+srv://admin:{mongo_pw}@ruffysfeuerstelle.jw6klif.mongodb.net/?retryWrites=true&w=majority"

    print("Connecting to MongoDB...")
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))
    print("Connected!")

    print("Creating game_versions collection...")
    result = client['ruffys-feuerstelle']['tftmatches'].aggregate([
    {
        '$group': {
            '_id': '$info.game_version', 
            'tft_set_core_name': {
                '$first': '$info.tft_set_core_name'
            }, 
            'tft_set_number': {
                '$first': '$info.tft_set_number'
            }, 
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
    }])
    print("Done!")

if __name__ == "__main__":
    main()
