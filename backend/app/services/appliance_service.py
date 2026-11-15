import sqlite3
from app.config.database import get_db_connection

class ApplianceService:
    @staticmethod
    def get_all_appliances() -> list:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM appliances")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def toggle_appliance(appliance_id: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT status, wattage, quantity FROM appliances WHERE id = ?", (appliance_id,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Appliance not found"}
                
            current_status, wattage, quantity = row
            new_status = 0 if current_status == 1 else 1
            new_consumption = wattage * quantity if new_status == 1 else 0
            
            cursor.execute(
                "UPDATE appliances SET status = ?, consumption = ? WHERE id = ?",
                (new_status, new_consumption, appliance_id)
            )
            conn.commit()
            return {"success": True, "appliance_id": appliance_id, "status": new_status, "consumption": new_consumption}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    @staticmethod
    def update_appliance(appliance_id: str, wattage: int, quantity: int, hours: int) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT status FROM appliances WHERE id = ?", (appliance_id,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Appliance not found"}
                
            status = row[0]
            consumption = wattage * quantity if status == 1 else 0
            
            cursor.execute(
                "UPDATE appliances SET wattage = ?, quantity = ?, hours = ?, consumption = ? WHERE id = ?",
                (wattage, quantity, hours, consumption, appliance_id)
            )
            conn.commit()
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    @staticmethod
    def add_custom_appliance(name: str, wattage: int, quantity: int, hours: int) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            app_id = f"app_custom_{uuid.uuid4().hex[:8]}" if 'uuid' in globals() else f"app_custom_{int(time.time())}"
            # Let's import uuid & time inside to make it robust
            import uuid
            app_id = f"app_custom_{uuid.uuid4().hex[:8]}"
            
            consumption = wattage * quantity
            cursor.execute(
                "INSERT INTO appliances (id, name, category, wattage, quantity, hours, status, location, consumption) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (app_id, name, "Custom", wattage, quantity, hours, 1, "Custom", consumption)
            )
            conn.commit()
            return {"success": True, "appliance_id": app_id}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()

    @staticmethod
    def delete_appliance(appliance_id: str) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM appliances WHERE id = ?", (appliance_id,))
            conn.commit()
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            conn.close()
