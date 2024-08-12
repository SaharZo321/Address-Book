from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.auth import password_manager, api_models
from src.exc.exceptions import NotFoundException, unique_exception, CredentialsException
from src.db import db_models
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_by_email(session: AsyncSession, email: str):
    user = await session.scalar(
        select(db_models.User).where(db_models.User.email == email)
    )
    if not user:
        raise NotFoundException(
            field_name="email", value=email, object_type="User"
        )
    return user


async def authenticate_user(session: AsyncSession, email: str, password: str):
    user = await get_user_by_email(session, email)
    if not user:
        return
    if not password_manager.verify_password(password, user.hashed_password):
        return
    return user


async def create_user(session: AsyncSession, user: api_models.CreateUserRequest):
    db_user = db_models.User(
        display_name=user.display_name,
        email=user.email,
        hashed_password=password_manager.get_password_hash(password=user.password),
        disabled=False,
        access_token="",
        refresh_token="",
        is_logged_in=False
    )
    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user
    except IntegrityError as error:
        await session.flush()
        raise unique_exception(
            error=error, instance=user, table_name="users"
        )


async def change_password(
    session: AsyncSession, request: api_models.ChangePasswordRequest, db_user: db_models.User
):
    if not password_manager.verify_password(request.old_password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password")
    new_hashed_password = password_manager.get_password_hash(request.new_password)
    db_user.hashed_password = new_hashed_password
    db_user.is_logged_in = False
    db_user.refresh_token = ""
    db_user.access_token = ""
    await session.commit()
    await session.refresh(db_user)
    return db_user

async def logout_user(session: AsyncSession, db_user: db_models.User):
    db_user.is_logged_in = False
    db_user.refresh_token = ""
    db_user.access_token = ""
    await session.commit()
    await session.refresh(db_user)
    
async def login_user(session: AsyncSession, db_user: db_models.User, tokens: api_models.TokenResponse):
    db_user.is_logged_in = True
    db_user.refresh_token = tokens.refresh_token
    db_user.access_token = tokens.access_token
    await session.commit()
    await session.refresh(db_user)

async def deactivate_user(session: AsyncSession, db_user: db_models.User):
    db_user.disabled = True
    await session.commit()
    await session.refresh(db_user)
    
async def activate_user(session: AsyncSession, request: api_models.ActivateUserRequest):
    db_user = await get_user_by_email(session=session, email=request.username)
    if not password_manager.verify_password(
        plain_password=request.password, hashed_password=db_user.hashed_password
    ):
        raise CredentialsException
    db_user.disabled = False
    await session.commit()
    await session.refresh(db_user)