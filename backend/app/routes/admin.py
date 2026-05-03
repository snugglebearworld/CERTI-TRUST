import base64
import io
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from ..auth import require_admin
from ..config import settings
from ..db import get_supabase
from ..schemas import (
    CertificateCreate,
    CertificateUpdate,
    CourseCreate,
    CourseUpdate,
    InstitutionCreate,
    InstitutionUpdate,
    PartnerCreate,
    PartnerUpdate,
    SettingUpdate,
    UploadSignRequest,
    UploadFileRequest,
)

try:
    import qrcode
except Exception:  # pragma: no cover - optional dependency in dev
    qrcode = None

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _normalize_db_error(exc: Exception) -> HTTPException:
    message = str(exc).lower()
    if "duplicate key value" in message or "unique constraint" in message:
        return HTTPException(status_code=409, detail="Record already exists")
    if "violates foreign key constraint" in message:
        return HTTPException(status_code=400, detail="Invalid relationship reference")
    return HTTPException(status_code=400, detail="Database operation failed")


@router.get("/certificates")
def list_certificates(
    q: str | None = Query(default=None),
    status: str | None = Query(default=None),
    course_id: str | None = Query(default=None),
    institution_id: str | None = Query(default=None),
    partner_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _token: str = Depends(require_admin),
):
    sb = get_supabase()
    query = (
        sb.table("certificates")
        .select(
            "certificate_id,full_name,course,status,course_id,institution_id,partner_id,issue_date,"
            "verification_url,certificate_qr_path,courses(name),institutions(name),partners(name)"
        )
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if q:
        safe_q = q.replace(",", " ").strip()
        query = query.or_(
            f"certificate_id.ilike.%{safe_q}%,full_name.ilike.%{safe_q}%,course.ilike.%{safe_q}%"
        )
    if status:
        query = query.eq("status", status)
    if course_id:
        query = query.eq("course_id", course_id)
    if institution_id:
        query = query.eq("institution_id", institution_id)
    if partner_id:
        query = query.eq("partner_id", partner_id)
    result = query.execute()

    count_query = sb.table("certificates").select("certificate_id", count="exact", head=True)
    if q:
        safe_q = q.replace(",", " ").strip()
        count_query = count_query.or_(
            f"certificate_id.ilike.%{safe_q}%,full_name.ilike.%{safe_q}%,course.ilike.%{safe_q}%"
        )
    if status:
        count_query = count_query.eq("status", status)
    if course_id:
        count_query = count_query.eq("course_id", course_id)
    if institution_id:
        count_query = count_query.eq("institution_id", institution_id)
    if partner_id:
        count_query = count_query.eq("partner_id", partner_id)
    count_result = count_query.execute()
    total = count_result.count or 0
    items = []
    for row in result.data or []:
        items.append(
            {
                "certificate_id": row["certificate_id"],
                "full_name": row["full_name"],
                "status": row["status"],
                "course": (row.get("courses") or {}).get("name") or row.get("course") or "",
                "course_id": row.get("course_id"),
                "institution": (row.get("institutions") or {}).get("name") or "",
                "institution_id": row.get("institution_id"),
                "partner": (row.get("partners") or {}).get("name") or "",
                "partner_id": row.get("partner_id"),
                "issue_date": row.get("issue_date"),
                "verification_url": row.get("verification_url") or f"/info/{row['certificate_id']}",
                "certificate_qr_path": row.get("certificate_qr_path") or None,
                "has_qr": bool(row.get("certificate_qr_path")),
            }
        )
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("/certificates")
def create_certificate(payload: CertificateCreate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    data = payload.model_dump()
    if not data.get("verification_url"):
        data["verification_url"] = f"/info/{data['certificate_id']}"
    try:
        result = sb.table("certificates").insert(data).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    return result.data[0]


@router.put("/certificates/{certificate_id}")
def update_certificate(
    certificate_id: str,
    payload: CertificateUpdate,
    _token: str = Depends(require_admin)
):
    sb = get_supabase()
    data = payload.model_dump()
    if not data.get("verification_url"):
        data["verification_url"] = f"/info/{certificate_id}"
    try:
        result = (
            sb.table("certificates")
            .update(data)
            .eq("certificate_id", certificate_id)
            .execute()
        )
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return result.data[0]


@router.delete("/certificates/{certificate_id}")
def delete_certificate(certificate_id: str, _token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("certificates").delete().eq("certificate_id", certificate_id).execute()
    return {"deleted": bool(result.data)}


@router.get("/courses")
def list_courses(_token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("courses").select("*").order("name").execute()
    return {"items": result.data}


@router.post("/courses")
def create_course(payload: CourseCreate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    try:
        result = sb.table("courses").insert(payload.model_dump()).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    return result.data[0]


@router.put("/courses/{course_id}")
def update_course(course_id: str, payload: CourseUpdate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    try:
        result = sb.table("courses").update(payload.model_dump()).eq("id", course_id).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")
    return result.data[0]


@router.delete("/courses/{course_id}")
def delete_course(course_id: str, _token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("courses").delete().eq("id", course_id).execute()
    return {"deleted": bool(result.data)}


@router.get("/institutions")
def list_institutions(_token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("institutions").select("*").order("name").execute()
    return {"items": result.data}


@router.post("/institutions")
def create_institution(payload: InstitutionCreate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    try:
        result = sb.table("institutions").insert(payload.model_dump()).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    return result.data[0]


@router.put("/institutions/{institution_id}")
def update_institution(
    institution_id: str, payload: InstitutionUpdate, _token: str = Depends(require_admin)
):
    sb = get_supabase()
    try:
        result = sb.table("institutions").update(payload.model_dump()).eq("id", institution_id).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Institution not found")
    return result.data[0]


@router.delete("/institutions/{institution_id}")
def delete_institution(institution_id: str, _token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("institutions").delete().eq("id", institution_id).execute()
    return {"deleted": bool(result.data)}


@router.get("/partners")
def list_partners(_token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("partners").select("*").order("name").execute()
    return {"items": result.data}


@router.post("/partners")
def create_partner(payload: PartnerCreate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    try:
        result = sb.table("partners").insert(payload.model_dump()).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    return result.data[0]


@router.put("/partners/{partner_id}")
def update_partner(partner_id: str, payload: PartnerUpdate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    try:
        result = sb.table("partners").update(payload.model_dump()).eq("id", partner_id).execute()
    except Exception as exc:
        raise _normalize_db_error(exc) from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Partner not found")
    return result.data[0]


@router.delete("/partners/{partner_id}")
def delete_partner(partner_id: str, _token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("partners").delete().eq("id", partner_id).execute()
    return {"deleted": bool(result.data)}


@router.get("/settings")
def list_settings(_token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("app_settings").select("*").order("key").execute()
    return {"items": result.data}


@router.put("/settings")
def upsert_setting(payload: SettingUpdate, _token: str = Depends(require_admin)):
    sb = get_supabase()
    result = sb.table("app_settings").upsert(payload.model_dump(), on_conflict="key").execute()
    return result.data[0]


@router.post("/media/upload-sign")
def create_upload_path(payload: UploadSignRequest, _token: str = Depends(require_admin)):
    ext = payload.file_name.split(".")[-1] if "." in payload.file_name else "bin"
    path = f"uploads/{uuid.uuid4().hex}.{ext}"
    return {"bucket": payload.bucket, "path": path, "content_type": payload.content_type}


@router.post("/media/upload")
def upload_media(
    bucket: str,
    file_name: str,
    payload: UploadFileRequest,
    _token: str = Depends(require_admin),
):
    sb = get_supabase()
    try:
        file_bytes = base64.b64decode(payload.file_base64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid file payload") from exc

    path = f"uploads/{uuid.uuid4().hex}-{file_name}"
    sb.storage.from_(bucket).upload(
        path=path,
        file=file_bytes,
        file_options={"content-type": payload.content_type, "upsert": "true"},
    )
    return {"bucket": bucket, "path": path}


@router.post("/certificates/{certificate_id}/qr")
def generate_certificate_qr(
    certificate_id: str,
    base_url: str | None = Query(default=None),
    _token: str = Depends(require_admin),
):
    if qrcode is None:
        raise HTTPException(status_code=500, detail="qrcode package not installed on server")

    try:
        from PIL import Image as _PilImage  # noqa: F401
    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow image library not installed on server")

    sb = get_supabase()
    cert_resp = (
        sb.table("certificates")
        .select("certificate_id")
        .eq("certificate_id", certificate_id)
        .limit(1)
        .execute()
    )
    if not cert_resp.data:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Frontend passes its own origin so the QR URL always points to the right host.
    # Fall back to the configured PUBLIC_APP_BASE_URL if not provided.
    app_base = (base_url or settings.public_app_base_url).rstrip("/")
    verification_url = f"{app_base}/info/{certificate_id}"
    image = qrcode.make(verification_url)
    output = io.BytesIO()
    image.save(output, format="PNG")
    output.seek(0)

    bucket = settings.certificate_qr_bucket
    path = f"{certificate_id}/{uuid.uuid4().hex}.png"
    sb.storage.from_(bucket).upload(
        path=path,
        file=output.getvalue(),
        file_options={"content-type": "image/png", "upsert": "true"},
    )

    updated = (
        sb.table("certificates")
        .update({"certificate_qr_path": path, "verification_url": f"/info/{certificate_id}"})
        .eq("certificate_id", certificate_id)
        .execute()
    )
    if not updated.data:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"certificate_id": certificate_id, "certificate_qr_path": path, "verification_url": verification_url}
