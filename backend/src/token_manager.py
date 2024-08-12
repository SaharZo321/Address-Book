from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from pydantic import BaseModel, ValidationError
import src.auth.api_models as api_models
import src.db.db_models as db_models

ACCESS_SECRET_KEY = "1cf4b295d4dc9e30b68aab8a05b2d14b8ebd0b6f613803c400c715e8fbf8aded"
REFRESH_SECRET_KEY = "8ebd0b6f613803c400c715e8fbf8aded1cf4b295d4dc9e30b68aab8a05b2d14b"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class JwtPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[datetime] = None
    redirect: str = ""


def create_access_token(
    payload: JwtPayload,
):
    to_encode = payload.model_copy()

    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.exp = expire
    encoded_jwt = jwt.encode(
        payload=to_encode.model_dump(), key=ACCESS_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    payload: JwtPayload,
):
    to_encode = payload.model_copy()

    expires_delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.exp = expire
    encoded_jwt = jwt.encode(
        payload=to_encode.model_dump(), key=REFRESH_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def get_access_payload(token: str):
    try:
        payload = JwtPayload(
            **jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        )
        return payload
    except InvalidTokenError or ValidationError or ExpiredSignatureError:
        return None


def get_refresh_payload(token: str, invalid_token_error: Exception):
    try:
        payload = JwtPayload(
            **jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        )
        return payload
    except InvalidTokenError or ValidationError or ExpiredSignatureError:
        raise invalid_token_error


def create_tokens(user: db_models.User):
    payload = JwtPayload(sub=user.email)
    access = create_access_token(payload=payload)
    refresh = create_refresh_token(payload=payload)
    return api_models.TokenResponse(access_token=access, refresh_token=refresh)

def verify_token(token: str):
    payload = get_access_payload(token)
    if payload and payload.sub:
        return payload.sub