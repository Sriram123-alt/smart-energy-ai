import uuid
import sqlite3
from app.config.database import get_db_connection
from app.config.security import verify_password, get_password_hash, create_access_token, decode_access_token

class AuthService:
    @staticmethod
    def register_user(name: str, email: str, password: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                return {"success": False, "error": "Email already registered"}
                
            hashed_pwd = get_password_hash(password)
            user_id = "usr_" + str(uuid.uuid4())[:8]
            
            cursor.execute(
                "INSERT INTO users (id, name, email, hashed_password) VALUES (?, ?, ?, ?)",
                (user_id, name, email, hashed_pwd)
            )
            conn.commit()
            
            token = create_access_token(user_id)
            
            # Automatically spawn new ACTIVE INCIDENTS in anomaly detection for new user
            try:
                from app.services.anomaly_service import AnomalyService
                AnomalyService.generate_login_active_incidents(user_name=name, count=2)
            except Exception as anom_err:
                print(f"Warning: Failed to generate active incidents on registration: {anom_err}")

            return {
                "success": True,
                "user": {"id": user_id, "name": name, "email": email, "token": token}
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    @staticmethod
    def login_user(email: str, password: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id, name, email, hashed_password FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Invalid email or password"}
                
            user_id, name, email_val, hashed_pwd = row
            if not verify_password(password, hashed_pwd):
                return {"success": False, "error": "Invalid email or password"}
                
            token = create_access_token(user_id)

            # Automatically spawn new ACTIVE INCIDENTS in anomaly detection on user login
            try:
                from app.services.anomaly_service import AnomalyService
                AnomalyService.generate_login_active_incidents(user_name=name, count=2)
            except Exception as anom_err:
                print(f"Warning: Failed to generate active incidents on login: {anom_err}")

            return {
                "success": True,
                "user": {"id": user_id, "name": name, "email": email_val, "token": token}
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    @staticmethod
    def get_current_user(token: str) -> dict:
        user_id = decode_access_token(token)
        if not user_id:
            return {"success": False, "error": "Invalid or expired session token"}
            
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "User not found"}
                
            u_id, name, email = row
            return {
                "success": True,
                "user": {"id": u_id, "name": name, "email": email}
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()
