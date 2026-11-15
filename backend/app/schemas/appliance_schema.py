from pydantic import BaseModel

class ApplianceOut(BaseModel):
    id: str
    name: str
    category: str
    wattage: int
    quantity: int
    hours: int
    status: int
    location: str
    consumption: int

class ApplianceUpdate(BaseModel):
    wattage: int
    quantity: int
    hours: int

class ApplianceCreate(BaseModel):
    name: str
    wattage: int
    quantity: int
    hours: int
