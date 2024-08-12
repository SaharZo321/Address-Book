from src.config import fastapi_app, prefix
from fastapi.middleware import trustedhost, cors
from src.auth.routes import auth_router
from src.contacts.routes import contacts_router
from src.exc.exceptions import (
    UniqueException,
    NotFoundException,
    CredentialsException,
    InactiveUserException,
)
from src.exc.exceptions_handlers import (
    not_found_exception_handler,
    unique_exception_handler,
    credentials_exception_handler,
    inactive_user_exception_handler,
)

app = fastapi_app

origins = [
    "*",
]

fastapi_app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
fastapi_app.add_middleware(
    trustedhost.TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"]
)

fastapi_app.include_router(auth_router, prefix=f"{prefix}/auth", tags=["auth"])
fastapi_app.include_router(
    contacts_router, prefix=f"{prefix}/contacts", tags=["contacts"]
)
fastapi_app.add_exception_handler(UniqueException, unique_exception_handler)
fastapi_app.add_exception_handler(NotFoundException, not_found_exception_handler)
fastapi_app.add_exception_handler(CredentialsException, credentials_exception_handler)
fastapi_app.add_exception_handler(InactiveUserException, inactive_user_exception_handler)
