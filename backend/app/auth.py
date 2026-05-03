from fastapi import Header, HTTPException, status
from .db import get_supabase


def require_admin(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sb = get_supabase()
    try:
        user_resp = sb.auth.get_user(token)
        user = user_resp.user
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized user") from exc

    if user is None or not getattr(user, "id", None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    admin_row = (
        sb.table("admin_users")
        .select("user_id,role,is_active")
        .eq("user_id", user.id)
        .limit(1)
        .execute()
    )
    if not admin_row.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    entry = admin_row.data[0]
    if not entry.get("is_active", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin user inactive")

    return token
