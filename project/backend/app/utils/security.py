"""
Password hashing and verification using the bcrypt library directly.

We use bcrypt directly instead of passlib because passlib 1.7.4 is
incompatible with bcrypt >= 4.0.0 — it raises:
  "password cannot be longer than 72 bytes, truncate manually if necessary"
even for short passwords due to an internal API mismatch between the two
libraries.

bcrypt itself is installed and working correctly (version 5.x).
"""

import bcrypt


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt. Returns a UTF-8 string."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    plain_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hashed_bytes)
