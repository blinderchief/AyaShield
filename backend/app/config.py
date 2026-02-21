from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "Aya Shield"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    allowed_origins: str = "http://localhost:3000"

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str = ""

    # AI
    gemini_api_key: str
    gemini_model: str = "gemini-2.0-flash"

    # Blockchain RPCs
    infura_key: str = ""
    alchemy_key: str = ""
    helius_key: str = ""
    eth_rpc_url: str = ""
    solana_rpc_url: str = ""

    # External APIs
    etherscan_api_key: str = ""
    goplus_api_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Rate Limiting
    rate_limit_per_minute: int = 60

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def eth_provider_url(self) -> str:
        if self.eth_rpc_url:
            return self.eth_rpc_url
        if self.infura_key:
            return f"https://mainnet.infura.io/v3/{self.infura_key}"
        if self.alchemy_key:
            return f"https://eth-mainnet.g.alchemy.com/v2/{self.alchemy_key}"
        return ""

    @property
    def sol_provider_url(self) -> str:
        if self.solana_rpc_url:
            return self.solana_rpc_url
        if self.helius_key:
            return f"https://mainnet.helius-rpc.com/?api-key={self.helius_key}"
        return "https://api.mainnet-beta.solana.com"


@lru_cache
def get_settings() -> Settings:
    return Settings()
