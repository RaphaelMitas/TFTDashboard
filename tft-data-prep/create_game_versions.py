from http import client
from dotenv import load_dotenv
import os

def main():
    load_dotenv()

    mongo_pw = os.environ['MONGO_DB_PASSWORD']

    uri = f"mongodb+srv://admin:{mongo_pw}@ruffysfeuerstelle.jw6klif.mongodb.net/?retryWrites=true&w=majority"

    print("Creating game_versions collection...")
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
    print("Done!")

if __name__ == "__main__":
    main()
