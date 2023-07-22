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

if __name__ == "__main__":
    main()
