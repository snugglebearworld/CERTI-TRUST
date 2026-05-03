from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str
    supabase_secret_key: str  # Supabase Secret key (sb_secret_xxx) — replaces legacy service_role key
    cors_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 60
    public_app_base_url: str = "http://localhost:3000"
    student_photos_bucket: str = "student-photos"
    brand_assets_bucket: str = "brand-assets"
    certificate_qr_bucket: str = "certificate-qr"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
