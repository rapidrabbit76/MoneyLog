from pydantic import BaseModel, Field, SecretStr


class LangchainLLMExpenseAnalyzerConfig(BaseModel):
    base_url: str = Field(default="http://192.168.81.2:11434/v1")
    api_key: SecretStr | str = Field(default=SecretStr("password"))
    model: str = Field(default="qwen3:1.7B")
    temperature: float = Field(default=0.0)
    max_tokens: int = Field(default=1024 * 4)
