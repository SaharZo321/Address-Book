from abc import abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Any, Literal
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer
import jwt
from pydantic import BaseModel, ValidationError
from src.exceptions import InvalidTokenException
import src.auth.api_models as api_models
import src.db.db_models as db_models
import logging

ACCESS_SECRET_KEY = "1cf4b295d4dc9e30b68aab8a05b2d14b8ebd0b6f613803c400c715e8fbf8aded"
REFRESH_SECRET_KEY = "8ebd0b6f613803c400c715e8fbf8aded1cf4b295d4dc9e30b68aab8a05b2d14b"
SECURITY_SECRET_KEY = "5e8fbf8aded1cf4b295d4dc9e30b68aab8a05b2d14b8ebd0b6f613803c400c71"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECURITY_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

class TokenDetails(BaseModel):
    secret_key: str
    expiry: int

tokens_scopes = {
    "access": TokenDetails(secret_key=ACCESS_SECRET_KEY, expiry=ACCESS_TOKEN_EXPIRE_MINUTES),
    "refresh": TokenDetails(secret_key=REFRESH_SECRET_KEY, expiry=REFRESH_TOKEN_EXPIRE_MINUTES),
    "security": TokenDetails(secret_key=SECURITY_SECRET_KEY, expiry=SECURITY_TOKEN_EXPIRE_MINUTES),
}

class JwtPayload(BaseModel):
    sub: Any
    exp: datetime
    scope: Literal["refresh", "security", "access"]


def create_token(
    sub: Any,
    scope: Literal["refresh", "security", "access"]
):
    token_detail = tokens_scopes[scope]
    expires_delta = timedelta(minutes=token_detail.expiry)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = JwtPayload(sub=sub, exp=expire, scope=scope)

    encoded_jwt = jwt.encode(
        payload=to_encode.model_dump(), key=token_detail.secret_key, algorithm=ALGORITHM
    )
    return encoded_jwt

class TokenBearerResult(BaseModel):
    payload: JwtPayload
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
        return TokenBearerResult(payload=payload, token=token)
        
    def decode_token(self, token: str):
        try:
            payload = JwtPayload(
                **jwt.decode(token, self.KEY, algorithms=[ALGORITHM])
            )
            return payload
        except jwt.PyJWTError or ValidationError as error:
            logging.exception(error)
            raise InvalidTokenException
            
    @abstractmethod
    def verify_payload(self, payload: JwtPayload):
        ...
        

class AccessTokenBearer(TokenBearer):
    KEY = ACCESS_SECRET_KEY
    def verify_payload(self, payload: JwtPayload):
        if payload.scope != "access":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please provide an access token"
            )

class RefreshTokenBearer(TokenBearer):
    KEY = REFRESH_SECRET_KEY
    def verify_payload(self, payload: JwtPayload):
        if payload.scope != "refresh":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please provide a refresh token"
            )
            
class SecurityTokenBearer(TokenBearer):
    KEY = SECURITY_SECRET_KEY
    def verify_payload(self, payload: JwtPayload):
        if payload.scope != "security":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please provide a security token"
            )       