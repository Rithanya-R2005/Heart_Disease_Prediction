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
            cls.client = MongoClient(os.getenv("MONGODB_URI"))
            cls.db = cls.client[os.getenv("DATABASE_NAME")]
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
