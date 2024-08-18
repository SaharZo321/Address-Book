from typing import Annotated, Literal
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from src.auth import token_manager
from src.db.db_models import db
from src.exceptions import InactiveUserException, InvalidTokenException
from src.auth import user_service
from fastapi import status


async def get_session():
    """Get session dependency"""
    async with db.Session() as session:
        yield session


def chosen_bearer(scope: Literal["security", "access"]):
    match (scope):
        case "access":
            return token_manager.AccessTokenBearer()
        case "security":
            return token_manager.SecurityTokenBearer()


def get_current_active_user(scope: Literal["security", "access"]):

    async def wrapper(
        session: Annotated[AsyncSession, Depends(get_session)],
        result: Annotated[
            token_manager.TokenBearerResult, Depends(chosen_bearer(scope))
        ],
    ):
        """Get current user dependency, raises error 403 if access is forbidden"""
        try:
            uuid = UUID(result.payload.sub)
        except ValueError:
            raise InvalidTokenException

        user = await user_service.get_user_by_uuid(session=session, uuid=uuid)
        if not user:
            raise InvalidTokenException
        elif scope == "access" and result.token != user.access_token:
            raise InvalidTokenException
        elif scope == "security" and result.token != user.security_token:
            raise InvalidTokenException
        elif not user.is_logged_in:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User not logged in"
            )
        elif user.disabled:
            raise InactiveUserException
        return user

    return wrapper
