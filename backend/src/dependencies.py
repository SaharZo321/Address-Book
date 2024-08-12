from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from src import token_manager
from src.db.db_models import db
from src.exc.exceptions import CredentialsException, InactiveUserException
from src.auth.crud import get_user_by_email
from src.config import oauth2_scheme


async def get_session():
    """Get session dependency"""
    async with db.Session() as session:
        yield session
        
        
async def get_current_active_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    token: Annotated[str, Depends(oauth2_scheme)],
):
    """Get current user dependency"""
    email = token_manager.verify_token(token=token)
    if not email:
        raise CredentialsException
    user = await get_user_by_email(session=session, email=email)
    if user is None or not user.is_logged_in or user.is_logged_in and token != user.access_token:
        raise CredentialsException
    if user.disabled:
        raise InactiveUserException
    return user
