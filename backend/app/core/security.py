from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from configs.settings import settings
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = settings.refresh_token_expire_days
RESET_PASSWORD_EXPIRE_MINUTES=settings.reset_password_expire_minutes

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token() -> str:
    # Just return a secure random string
    return generate_random_token(64)

def generate_random_token(length: int = 64) -> str:
    """Generates a secure random hex string."""
    return secrets.token_hex(length // 2)

def create_password_reset_token(email: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_PASSWORD_EXPIRE_MINUTES)
    # Include 'action' to ensure this token only works for resets
    to_encode = {"exp": expire, "sub": email, "action": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)