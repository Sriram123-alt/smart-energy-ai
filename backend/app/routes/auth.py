from fastapi import APIRouter, Header, HTTPException
from app.schemas.auth_schema import UserRegister, UserLogin, AuthOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthOut)
def register(user: UserRegister):
    res = AuthService.register_user(user.name, user.email, user.password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res["user"]

@router.post("/login", response_model=AuthOut)
def login(user: UserLogin):
    res = AuthService.login_user(user.email, user.password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res["user"]

@router.get("/me")
def get_me(authorization: str = Header(..., description="Access session token")):
    # Extract Bearer from header
    token = authorization.replace("Bearer ", "") if "Bearer " in authorization else authorization
    res = AuthService.get_current_user(token)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["error"])
    return res["user"]
