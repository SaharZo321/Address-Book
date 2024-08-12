from argon2 import PasswordHasher
from argon2.exceptions import VerificationError

ph = PasswordHasher()

def verify_password(plain_password: str, hashed_password: str):
    try:
        return ph.verify(hash=hashed_password, password=plain_password)
    except VerificationError:
        return False

def get_password_hash(password: str):
    return ph.hash(password=password)
