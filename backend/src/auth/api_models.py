from typing import Literal, Optional
from uuid import UUID
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"


password_field = Field(max_length=16, min_length=6)
display_name_field = Field(max_length=16, min_length=3, pattern=r"^[\w]+$")


class CreateUserRequest(BaseModel):
    display_name: str = display_name_field
    email: EmailStr
    password: str = password_field


class UserResponse(BaseModel):
    display_name: str
    email: EmailStr
    disabled: bool
    uuid: UUID


class NewUserResponse(BaseModel):
    display_name: str
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    new_password: str = password_field
    old_password: str = password_field
    
class ChangeDisplayNameRequest(BaseModel):
    display_name: str = display_name_field


class RequestPasswordResetRequest(BaseModel):
    email: EmailStr
    redirectUrl: str = ""


class RequestPasswordResetResponse(BaseModel):
    url: str


class PasswordResetRequest(BaseModel):
    token: str
    password: str = password_field

class ActivateUserRequest(BaseModel):
    username: EmailStr
    password: str