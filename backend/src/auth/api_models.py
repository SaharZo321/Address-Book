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

class DisplayName(BaseModel):
    display_name: str = display_name_field
    
class Password(BaseModel):
    password: str = password_field

class CreateUserRequest(DisplayName, Password):
    email: EmailStr

class UserResponse(DisplayName):
    email: EmailStr
    uuid: UUID

class ChangePasswordRequest(BaseModel):
    new_password: str = password_field
    old_password: str = password_field
    
class ChangeDisplayNameRequest(DisplayName):
    pass

class PasswordResetRequest(Password):
    token: str

class DeactivateUserRequest(Password):
    pass