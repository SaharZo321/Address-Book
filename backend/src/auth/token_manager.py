from abc import abstractmethod, abstractproperty
from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer
import jwt
from pydantic import BaseModel, ValidationError
import src.auth.api_models as api_models
import src.db.db_models as db_models
import logging

ACCESS_SECRET_KEY = "1cf4b295d4dc9e30b68aab8a05b2d14b8ebd0b6f613803c400c715e8fbf8aded"
REFRESH_SECRET_KEY = "8ebd0b6f613803c400c715e8fbf8aded1cf4b295d4dc9e30b68aab8a05b2d14b"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class JwtPayload(BaseModel):
    sub: Any
    exp: datetime
    refresh: bool = False


def create_access_token(
    sub: Any,
):
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = JwtPayload(sub=sub, exp=expire)

    encoded_jwt = jwt.encode(
        payload=to_encode.model_dump(), key=ACCESS_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    sub: Any,
):
    expires_delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = JwtPayload(sub=sub, exp=expire, refresh=True)

    encoded_jwt = jwt.encode(
        payload=to_encode.model_dump(), key=REFRESH_SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = JwtPayload(
            **jwt.decode(token, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        )
        return payload
    except jwt.PyJWTError or ValidationError as error:
        logging.exception(error)
        return None


def decode_refresh_token(token: str):
    try:
        payload = JwtPayload(
            **jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        )
        return payload
    except jwt.PyJWTError or ValidationError as error:
        logging.exception(error)
        return None


def create_tokens(user: db_models.User):
    access = create_access_token(sub=user.email)
    refresh = create_refresh_token(sub=user.email)
    return api_models.TokenResponse(access_token=access, refresh_token=refresh)

class TokenBearerResult(BaseModel):
    sub: Any
    token: str

class TokenBearer(HTTPBearer):
    KEY: str

    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials = await super().__call__(request=request)
        token = credentials.credentials
        payload = self.decode_token(token=token)    
        print(payload)
        self.verify_payload(payload=payload)
        return TokenBearerResult(sub=payload.sub, token=token)
        
    def decode_token(self, token: str):
        try:
            payload = JwtPayload(
                **jwt.decode(token, self.KEY, algorithms=[ALGORITHM])
            )
            return payload
        except jwt.PyJWTError or ValidationError as error:
            logging.exception(error)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired token"
            )
            
    @abstractmethod
    def verify_payload(self, payload: JwtPayload):
        ...
        

class AccessTokenBearer(TokenBearer):
    KEY = ACCESS_SECRET_KEY
    def verify_payload(self, payload: JwtPayload):
        if payload.refresh:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please provide an access token"
            )

class RefreshTokenBearer(TokenBearer):
    KEY = REFRESH_SECRET_KEY
    def verify_payload(self, payload: JwtPayload):
        if not payload.refresh:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please provide a refresh token"
            )        
            