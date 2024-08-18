from src.config import fastapi_app, prefix
from fastapi.middleware import trustedhost, cors
from src.auth.routes import auth_router
from src.contacts.routes import contacts_router

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

fastapi_app.include_router(
    auth_router, prefix=f"{prefix}/users", tags=["authentication"]
)
fastapi_app.include_router(
    contacts_router, prefix=f"{prefix}/contacts", tags=["contacts"]
)
