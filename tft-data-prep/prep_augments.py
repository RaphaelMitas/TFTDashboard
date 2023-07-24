from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os


def main():

    DO_MONGO_DB_CONNECTION_STRING = os.environ['DO_MONGO_DB_CONNECTION_STRING']
    DO_MONGO_DB_PASSWORD = os.environ['DO_MONGO_DB_PASSWORD']
    DO_MONGO_DB_USER = os.environ['DO_MONGO_DB_USER']

    uri = f"mongodb+srv://{DO_MONGO_DB_USER}:{DO_MONGO_DB_PASSWORD}@{DO_MONGO_DB_CONNECTION_STRING}"

    print("Connecting to MongoDB...")
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))
    print("Connected!")

    print("Preparing augments...")
    result = client['ruffys-feuerstelle']['augments_at_stage_view'].aggregate([
        {
            '$group': {
                'average_placement_at_stage_3': {
                    '$avg': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id.augment_at_stage', 3
                                ]
                            }, '$average_placement_at_stage', None
                        ]
                    }
                },
                'average_placement_at_stage_4': {
                    '$avg': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id.augment_at_stage', 4
                                ]
                            }, '$average_placement_at_stage', None
                        ]
                    }
                },
                'total_placement': {
                    '$sum': {
                        '$multiply': [
                            '$average_placement_at_stage', '$total_games'
                        ]
                    }
                },
                'total_games': {
                    '$sum': '$total_games'
                },
                'wins': {
                    '$sum': '$wins'
                },
                'placement_1_to_4': {
                    '$sum': '$games_with_placement_1_to_4'
                },
                '_id': {
                    'augment': '$_id.augment',
                    'game_version': '$_id.game_version'
                },
                'average_placement_at_stage_2': {
                    '$avg': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id.augment_at_stage', 2
                                ]
                            }, '$average_placement_at_stage', None
                        ]
                    }
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'augment': '$_id.augment',
                'game_version': '$_id.game_version',
                'average_placement_at_stage_3': 1,
                'average_placement_at_stage_4': 1,
                'win_percent': {
                    '$multiply': [
                        {
                            '$divide': [
                                '$wins', '$total_games'
                            ]
                        }, 100
                    ]
                },
                'top4_percent': {
                    '$multiply': [
                        {
                            '$divide': [
                                '$placement_1_to_4', '$total_games'
                            ]
                        }, 100
                    ]
                },
                'average_placement_at_stage_2': 1,
                'average_placement': {
                    '$divide': [
                        '$total_placement', '$total_games'
                    ]
                },
                'total_games': 1,
                'wins': 1,
                'placement_1_to_4': 1
            }
        }, {
            '$out': 'augments'
        }
    ])
    print("Done!")


if __name__ == "__main__":
    main()
