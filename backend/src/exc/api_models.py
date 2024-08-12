from typing import Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    headers: Optional[dict[str, str]] = None

