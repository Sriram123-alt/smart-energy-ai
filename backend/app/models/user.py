"""
User Entity Model
"""
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: str
    name: str
    email: str
    hashed_password: str
    created_at: Optional[str] = None
    role: str = "homeowner"  # "homeowner", "grid_operator", "admin"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at
        }
