from pydantic import BaseModel

class BillHistoryOut(BaseModel):
    month: str
    generation: float
    transmission: float
    taxes: float
    total: float

class BillCalculateRequest(BaseModel):
    tariffMode: str
    ratePerKwh: float
    serviceFee: float
    appliancesKwh: float

class BillCalculateResponse(BaseModel):
    generation: float
    transmission: float
    taxes: float
    serviceFee: float
    total: float
