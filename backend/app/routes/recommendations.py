from fastapi import APIRouter, HTTPException
from typing import List
from app.config.database import get_db_connection

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("")
def get_recommendations():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM recommendations")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@router.post("/{rec_id}/toggle")
def toggle_recommendation(rec_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT applied FROM recommendations WHERE id = ?", (rec_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recommendation not found")
            
        current_val = row[0]
        new_val = 0 if current_val == 1 else 1
        
        cursor.execute("UPDATE recommendations SET applied = ? WHERE id = ?", (new_val, rec_id))
        conn.commit()
        return {"success": True, "rec_id": rec_id, "applied": new_val}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
