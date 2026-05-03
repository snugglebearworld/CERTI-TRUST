from supabase import create_client, Client
from .config import settings


def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_secret_key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY")
    return create_client(settings.supabase_url, settings.supabase_secret_key)
