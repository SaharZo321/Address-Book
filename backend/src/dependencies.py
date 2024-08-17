from typing import Annotated
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
        
        
async def get_current_active_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    result: Annotated[token_manager.TokenBearerResult, Depends(token_manager.AccessTokenBearer())],
):
    """Get current user dependency, raises error 403 if access is forbidden"""
    email = result.sub
    user = await user_service.get_user_by_email(session=session, email=email)
    if not user or (user.is_logged_in and result.token != user.access_token):
        raise InvalidTokenException
    elif not user.is_logged_in:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not logged in")
    elif user.disabled:
        raise InactiveUserException
    return user
