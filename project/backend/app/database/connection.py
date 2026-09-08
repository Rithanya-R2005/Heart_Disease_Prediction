from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

class MongoDB:
    client = None
    db = None

    @classmethod
    def connect(cls):
        if cls.client is None:
            uri = os.getenv("MONGODB_URI") or "mongodb://localhost:27017"
            db_name = os.getenv("DATABASE_NAME") or "cardiosense_db"
            cls.client = MongoClient(uri)
            cls.db = cls.client[db_name]
        return cls.db

    @classmethod
    def get_database(cls):
        if cls.db is None:
            cls.connect()
        return cls.db

    @classmethod
    def close(cls):
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None

def get_db():
    db = MongoDB.get_database()
    return db
