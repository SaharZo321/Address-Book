from fastapi.security import OAuth2PasswordBearer
from fastapi import FastAPI
from src.db.db_models import db


async def db_lifespan(_app):
    await db.create_all()
    yield


version = "v1"
prefix = f"/api/{version}"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{prefix}/auth/login")

fastapi_app = FastAPI(lifespan=db_lifespan)
