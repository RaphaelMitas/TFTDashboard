from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os


def main():
    load_dotenv()

    mongo_pw = os.environ['MONGO_DB_PASSWORD']

    uri = f"mongodb+srv://admin:{mongo_pw}@ruffysfeuerstelle.jw6klif.mongodb.net/?retryWrites=true&w=majority"

    print("Connecting to MongoDB...")
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))
    print("Connected!")

    game_versions = client.get_database(
        'ruffys-feuerstelle').get_collection('game_versions').find()

    for game_version in game_versions:
        print(game_version)
        tft_matches = client.get_database('ruffys-feuerstelle').get_collection(
            'tftmatches').find({'info.game_version': game_version['_id']})

        result = client['ruffys-feuerstelle']['tftmatches'].aggregate([
            {
                '$match': {
                    'info.game_version': 'Version 13.13.518.0539 (Jun 28 2023/03:11:33) [PUBLIC] <Releases/13.13>'
                }
            }, {
                '$unwind': {
                    'path': '$info.participants'
                }
            }, {
                '$unwind': {
                    'path': '$info.participants.augments',
                    'includeArrayIndex': 'augment_at_stage'
                }
            }, {
                '$addFields': {
                    'augment_at_stage': {
                        '$add': [
                            '$augment_at_stage', 2
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': {
                        'augment': '$info.participants.augments',
                        'augment_at_stage': '$augment_at_stage',
                        'game_version': '$info.game_version'
                    },
                    'average_placement_at_stage': {
                        '$avg': '$info.participants.placement'
                    },
                    'total_games': {
                        '$sum': 1
                    },
                    'wins': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$eq': [
                                        '$info.participants.placement', 1
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }, {
                '$sort': {
                    '_id.augment_at_stage': -1
                }
            }, {
                '$out': 'augments_at_stage'
            }
        ])


if __name__ == "__main__":
    main()
