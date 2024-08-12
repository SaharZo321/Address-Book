from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from src.auth import token_manager
from src.db.db_models import db
from src.exc.exceptions import CredentialsException, InactiveUserException
from src.auth import user_service
from src.config import oauth2_scheme

async def get_session():
    """Get session dependency"""
    async with db.Session() as session:
        yield session
        
        
async def get_current_active_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    result: Annotated[token_manager.TokenBearerResult, Depends(token_manager.AccessTokenBearer())],
):
    """Get current user dependency"""
    email = result.sub
    user = await user_service.get_user_by_email(session=session, email=email)
    if user is None or not user.is_logged_in or user.is_logged_in and result.token != user.access_token:
        raise CredentialsException
    if user.disabled:
        raise InactiveUserException
    return user
