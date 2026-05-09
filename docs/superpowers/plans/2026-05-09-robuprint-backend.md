# RoBuPRINT Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI service exposing four endpoints (`/contact`, `/quote/upload`, `/quote/submit`, `/newsletter`) that the RoBuPRINT frontend calls. Uploads are received in 5 MB chunks, written to local disk, and referenced in submission emails via token-protected download URLs. All form endpoints verify a Cloudflare Turnstile token. Email delivery uses SMTP against the user's existing mail server. The service runs on the user's own server behind Cloudflare.

**Architecture:** FastAPI (ASGI) app served by Uvicorn, behind a reverse proxy (Caddy / nginx / Cloudflare Tunnel — operator's choice). Stateless per-request handlers; uploaded files persisted under a configurable directory; subscribers and quote submissions logged via SMTP notifications and a small SQLite store for newsletter idempotency. A scheduled cleanup job removes uploads older than 90 days.

**Tech Stack:** Python 3.11+ · FastAPI · Pydantic v2 · Uvicorn · `aiosmtplib` · `httpx` (Turnstile verification) · SQLite (stdlib) · `pytest` · `pytest-asyncio` · `uv` package manager

**Reference:** [`docs/superpowers/specs/2026-05-09-robuprint-website-design.md`](../specs/2026-05-09-robuprint-website-design.md)

---

## File Structure

```
robuprint-api/
├── pyproject.toml
├── uv.lock
├── README.md
├── .env.example
├── .gitignore
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + middleware
│   ├── config.py               # Settings (pydantic-settings)
│   ├── deps.py                 # FastAPI dependencies (settings, db)
│   ├── models.py               # Pydantic request/response models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── contact.py
│   │   ├── quote.py
│   │   ├── newsletter.py
│   │   └── files.py            # token-protected download
│   └── services/
│       ├── __init__.py
│       ├── email.py            # SMTP send
│       ├── turnstile.py        # Cloudflare verification
│       ├── storage.py          # chunked upload assembly + token URLs
│       └── newsletter_store.py # tiny SQLite layer
├── scripts/
│   └── cleanup_uploads.py      # invoked by cron / systemd timer
├── deploy/
│   ├── robuprint-api.service   # systemd unit
│   └── robuprint-cleanup.timer # systemd timer for daily cleanup
└── tests/
    ├── conftest.py
    ├── test_contact.py
    ├── test_quote_upload.py
    ├── test_quote_submit.py
    ├── test_newsletter.py
    ├── test_email_service.py
    ├── test_turnstile_service.py
    └── test_storage_service.py
```

---

## Task 1: Bootstrap FastAPI project

**Files:**
- Create: `pyproject.toml`, `.env.example`, `.gitignore`, `README.md`, `app/__init__.py`, `app/main.py`

- [ ] **Step 1: Create `pyproject.toml`**

```toml
[project]
name = "robuprint-api"
version = "0.1.0"
description = "FastAPI backend for the RoBuPRINT marketing site"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.30",
  "pydantic>=2.7",
  "pydantic-settings>=2.4",
  "aiosmtplib>=3.0",
  "httpx>=0.27",
  "python-multipart>=0.0.9",
]

[dependency-groups]
dev = [
  "pytest>=8.0",
  "pytest-asyncio>=0.23",
  "respx>=0.21",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 2: Install with uv**

```bash
uv sync
```

- [ ] **Step 3: Create `.env.example`**

```
ROBUPRINT_ENV=development
ROBUPRINT_CORS_ORIGINS=https://robuprint.nl,https://www.robuprint.nl,http://localhost:3000

# Storage
ROBUPRINT_UPLOAD_DIR=./.uploads
ROBUPRINT_MAX_FILE_BYTES=1073741824    # 1 GB
ROBUPRINT_MAX_TOTAL_BYTES=4294967296   # 4 GB across an upload session
ROBUPRINT_RETENTION_DAYS=90

# SMTP
ROBUPRINT_SMTP_HOST=mail.kuypers.nl
ROBUPRINT_SMTP_PORT=587
ROBUPRINT_SMTP_USERNAME=info@robuprint.nl
ROBUPRINT_SMTP_PASSWORD=
ROBUPRINT_SMTP_USE_STARTTLS=true
ROBUPRINT_NOTIFY_TO=info@robuprint.nl
ROBUPRINT_NOTIFY_FROM=info@robuprint.nl

# Cloudflare Turnstile
ROBUPRINT_TURNSTILE_SECRET=
ROBUPRINT_TURNSTILE_DEV_TOKEN=dev-no-turnstile

# Newsletter store
ROBUPRINT_NEWSLETTER_DB=./.newsletter.sqlite

# File-download token signing
ROBUPRINT_FILE_TOKEN_SECRET=
```

- [ ] **Step 4: Create `.gitignore`**

```
__pycache__/
*.py[cod]
.venv/
.uv/
.pytest_cache/
.coverage
.env
.env.local
.uploads/
*.sqlite
.idea/
.vscode/
```

- [ ] **Step 5: Create `app/__init__.py`** (empty)

- [ ] **Step 6: Create `app/main.py` (skeleton)**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="RoBuPRINT API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
```

- [ ] **Step 7: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap FastAPI backend"
```

- [ ] **Step 8: Smoke run**

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` → expect `{"status":"ok"}`. Stop with Ctrl+C.

---

## Task 2: Settings (pydantic-settings)

**Files:**
- Create: `app/config.py`, `tests/conftest.py`

- [ ] **Step 1: Implement `app/config.py`**

```python
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ROBUPRINT_", env_file=".env")

    env: Literal["development", "production"] = "development"
    cors_origins: list[str] = Field(default_factory=list)

    upload_dir: Path = Path("./.uploads")
    max_file_bytes: int = 1024 * 1024 * 1024
    max_total_bytes: int = 4 * 1024 * 1024 * 1024
    retention_days: int = 90

    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_starttls: bool = True
    notify_to: str = "info@robuprint.nl"
    notify_from: str = "info@robuprint.nl"

    turnstile_secret: str = ""
    turnstile_dev_token: str = "dev-no-turnstile"

    newsletter_db: Path = Path("./.newsletter.sqlite")

    file_token_secret: str = ""

    def cors_origins_list(self) -> list[str]:
        # pydantic-settings parses comma-separated lists for list[str] fields.
        return self.cors_origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 2: Create `tests/conftest.py`**

```python
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import create_app


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        env="development",
        cors_origins=["http://localhost:3000"],
        upload_dir=tmp_path / "uploads",
        max_file_bytes=10 * 1024 * 1024,
        max_total_bytes=50 * 1024 * 1024,
        retention_days=90,
        smtp_host="smtp.test",
        smtp_port=587,
        smtp_username="info@test",
        smtp_password="x",
        smtp_use_starttls=True,
        notify_to="info@test",
        notify_from="info@test",
        turnstile_secret="",
        turnstile_dev_token="dev-no-turnstile",
        newsletter_db=tmp_path / "newsletter.sqlite",
        file_token_secret="test-secret-32-chars-min__padding!",
    )


@pytest.fixture
def client(settings: Settings) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: settings
    return TestClient(app)
```

- [ ] **Step 3: Wire `get_settings` into `create_app` for DI**

In `app/main.py`, swap direct `get_settings()` for a dependency-injected pattern. Update:

```python
def create_app() -> FastAPI:
    app = FastAPI(title="RoBuPRINT API", version="0.1.0")

    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app
```

- [ ] **Step 4: Run health check via TestClient**

`tests/test_health.py`:

```python
def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

```bash
uv run pytest -q
```

Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(config): typed settings with pydantic-settings + tests fixture"
```

---

## Task 3: Email service (TDD)

**Files:**
- Create: `app/services/email.py`, `tests/test_email_service.py`

- [ ] **Step 1: Write the failing test**

`tests/test_email_service.py`:

```python
import pytest
from unittest.mock import AsyncMock, patch

from app.services.email import send_notification


@pytest.mark.asyncio
async def test_send_notification_uses_settings_and_calls_smtp(settings):
    sent = AsyncMock()
    with patch("app.services.email.aiosmtplib.send", new=sent):
        await send_notification(
            settings,
            subject="Test",
            body="Hello world",
        )
    sent.assert_called_once()
    msg = sent.call_args.args[0]
    assert msg["From"] == settings.notify_from
    assert msg["To"] == settings.notify_to
    assert msg["Subject"] == "Test"
    kwargs = sent.call_args.kwargs
    assert kwargs["hostname"] == settings.smtp_host
    assert kwargs["port"] == settings.smtp_port
    assert kwargs["start_tls"] is settings.smtp_use_starttls
    assert kwargs["username"] == settings.smtp_username
```

- [ ] **Step 2: Run, confirm failure**

```bash
uv run pytest tests/test_email_service.py -q
```

Expected: ImportError.

- [ ] **Step 3: Implement `app/services/email.py`**

```python
from email.message import EmailMessage

import aiosmtplib

from app.config import Settings


async def send_notification(settings: Settings, *, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.notify_from
    msg["To"] = settings.notify_to
    msg["Subject"] = subject
    msg.set_content(body)
    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        start_tls=settings.smtp_use_starttls,
        username=settings.smtp_username,
        password=settings.smtp_password,
    )
```

- [ ] **Step 4: Run, confirm pass**

```bash
uv run pytest tests/test_email_service.py -q
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(email): SMTP send_notification with tests"
```

---

## Task 4: Turnstile service (TDD)

**Files:**
- Create: `app/services/turnstile.py`, `tests/test_turnstile_service.py`

- [ ] **Step 1: Write the failing test**

`tests/test_turnstile_service.py`:

```python
import pytest
import respx
from httpx import Response

from app.services.turnstile import verify_token


@pytest.mark.asyncio
async def test_dev_token_passes_when_secret_blank(settings):
    settings.turnstile_secret = ""
    assert await verify_token(settings, settings.turnstile_dev_token, remote_ip="127.0.0.1") is True


@pytest.mark.asyncio
async def test_real_token_calls_cloudflare(settings):
    settings.turnstile_secret = "secret"
    with respx.mock(assert_all_called=True) as mock:
        mock.post("https://challenges.cloudflare.com/turnstile/v0/siteverify").mock(
            return_value=Response(200, json={"success": True})
        )
        ok = await verify_token(settings, "real-token", remote_ip="127.0.0.1")
    assert ok is True


@pytest.mark.asyncio
async def test_failed_token_returns_false(settings):
    settings.turnstile_secret = "secret"
    with respx.mock() as mock:
        mock.post("https://challenges.cloudflare.com/turnstile/v0/siteverify").mock(
            return_value=Response(200, json={"success": False, "error-codes": ["bad-token"]})
        )
        assert await verify_token(settings, "x", remote_ip="127.0.0.1") is False
```

- [ ] **Step 2: Implement `app/services/turnstile.py`**

```python
import httpx

from app.config import Settings

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_token(settings: Settings, token: str, *, remote_ip: str | None) -> bool:
    if not settings.turnstile_secret:
        # Dev mode: accept the configured dev token only.
        return token == settings.turnstile_dev_token
    payload = {"secret": settings.turnstile_secret, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(VERIFY_URL, data=payload)
        resp.raise_for_status()
        data = resp.json()
    return bool(data.get("success"))
```

- [ ] **Step 3: Run + commit**

```bash
uv run pytest tests/test_turnstile_service.py -q
git add -A
git commit -m "feat(turnstile): verify_token with httpx + respx tests"
```

---

## Task 5: Storage service for chunked uploads (TDD)

**Files:**
- Create: `app/services/storage.py`, `tests/test_storage_service.py`

The contract:
- `start_or_continue_chunk(settings, upload_id, chunk_index, chunk_total, filename, chunk_bytes)` — write a chunk to a per-upload directory; reject if out of order or exceeds size limits; return `True` if this is the final chunk.
- `assemble(settings, upload_id, filename) -> Path` — concatenate ordered chunks into a single final file and remove chunks.
- `make_download_token(settings, upload_id, filename) -> str` — HMAC-signed, expires at 90 days.
- `verify_download_token(settings, token, upload_id, filename) -> bool`.

- [ ] **Step 1: Write the failing test**

`tests/test_storage_service.py`:

```python
import pytest

from app.services.storage import (
    append_chunk,
    assemble,
    make_download_token,
    verify_download_token,
    StorageError,
)


def test_append_chunks_in_order_and_assemble(settings):
    upload_id = "u-abc"
    data = [b"hello ", b"world", b"!"]
    for i, chunk in enumerate(data):
        is_last = append_chunk(settings, upload_id, chunk_index=i, chunk_total=len(data), filename="a.txt", chunk_bytes=chunk)
        assert is_last is (i == len(data) - 1)
    final = assemble(settings, upload_id, filename="a.txt")
    assert final.read_bytes() == b"hello world!"


def test_out_of_order_chunk_rejected(settings):
    with pytest.raises(StorageError):
        append_chunk(settings, "u-1", chunk_index=1, chunk_total=2, filename="a.bin", chunk_bytes=b"x")


def test_oversize_file_rejected(settings):
    settings.max_file_bytes = 10
    append_chunk(settings, "u-2", chunk_index=0, chunk_total=2, filename="big.bin", chunk_bytes=b"abcdef")
    with pytest.raises(StorageError):
        append_chunk(settings, "u-2", chunk_index=1, chunk_total=2, filename="big.bin", chunk_bytes=b"ghijklm")


def test_token_round_trip(settings):
    token = make_download_token(settings, "u-3", "x.stl")
    assert verify_download_token(settings, token, "u-3", "x.stl") is True
    assert verify_download_token(settings, token, "u-3", "other.stl") is False
    assert verify_download_token(settings, "tampered", "u-3", "x.stl") is False
```

- [ ] **Step 2: Run, confirm failure**

- [ ] **Step 3: Implement `app/services/storage.py`**

```python
import hashlib
import hmac
import re
import time
from pathlib import Path

from app.config import Settings


SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


class StorageError(Exception):
    pass


def _safe_filename(name: str) -> str:
    name = name.strip().replace("/", "_").replace("\\", "_")
    name = SAFE_NAME_RE.sub("_", name)
    return name[:200] or "file.bin"


def _upload_dir(settings: Settings, upload_id: str) -> Path:
    safe_id = SAFE_NAME_RE.sub("", upload_id)[:64]
    if not safe_id:
        raise StorageError("invalid upload_id")
    return settings.upload_dir / safe_id


def append_chunk(
    settings: Settings,
    upload_id: str,
    *,
    chunk_index: int,
    chunk_total: int,
    filename: str,
    chunk_bytes: bytes,
) -> bool:
    if chunk_total <= 0 or chunk_index < 0 or chunk_index >= chunk_total:
        raise StorageError("chunk index out of range")
    safe_name = _safe_filename(filename)
    d = _upload_dir(settings, upload_id) / safe_name
    d.mkdir(parents=True, exist_ok=True)
    expected = chunk_index
    existing = sorted(int(p.stem.split("_")[-1]) for p in d.glob("chunk_*.bin"))
    if existing != list(range(chunk_index)):
        raise StorageError(f"chunks out of order; got existing={existing} for index={chunk_index}")
    # Enforce size cap as we write
    written = sum(p.stat().st_size for p in d.glob("chunk_*.bin"))
    if written + len(chunk_bytes) > settings.max_file_bytes:
        raise StorageError("file exceeds max_file_bytes")
    (d / f"chunk_{chunk_index:06d}.bin").write_bytes(chunk_bytes)
    return chunk_index == chunk_total - 1


def assemble(settings: Settings, upload_id: str, *, filename: str) -> Path:
    safe_name = _safe_filename(filename)
    d = _upload_dir(settings, upload_id) / safe_name
    chunks = sorted(d.glob("chunk_*.bin"))
    if not chunks:
        raise StorageError("no chunks to assemble")
    final = d / safe_name
    with final.open("wb") as out:
        for c in chunks:
            out.write(c.read_bytes())
    for c in chunks:
        c.unlink()
    return final


def _sign(secret: str, payload: str) -> str:
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def make_download_token(settings: Settings, upload_id: str, filename: str, *, ttl_seconds: int | None = None) -> str:
    if not settings.file_token_secret:
        raise StorageError("file_token_secret not configured")
    expires = int(time.time()) + (ttl_seconds or settings.retention_days * 24 * 3600)
    payload = f"{upload_id}|{filename}|{expires}"
    return f"{expires}.{_sign(settings.file_token_secret, payload)}"


def verify_download_token(settings: Settings, token: str, upload_id: str, filename: str) -> bool:
    if not settings.file_token_secret:
        return False
    try:
        exp_str, sig = token.split(".", 1)
        expires = int(exp_str)
    except ValueError:
        return False
    if expires < int(time.time()):
        return False
    payload = f"{upload_id}|{filename}|{expires}"
    expected = _sign(settings.file_token_secret, payload)
    return hmac.compare_digest(sig, expected)
```

- [ ] **Step 4: Run + commit**

```bash
uv run pytest tests/test_storage_service.py -q
git add -A
git commit -m "feat(storage): chunked upload + token signing with tests"
```

---

## Task 6: Pydantic models for requests/responses

**Files:**
- Create: `app/models.py`

- [ ] **Step 1: Implement `app/models.py`**

```python
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ContactIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=200)
    company: str = Field(default="", max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=80)
    message: str = Field(min_length=1, max_length=5000)
    turnstile_token: str


class NewsletterIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr


class QuoteFileRef(BaseModel):
    upload_id: str = Field(min_length=8, max_length=128)
    filename: str = Field(min_length=1, max_length=200)
    size: int = Field(ge=0)


class QuoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    material: str = Field(min_length=1, max_length=80)
    quantity: str = Field(min_length=1, max_length=80)
    milling: str = Field(default="", max_length=80)
    deadline: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=5000)
    name: str = Field(min_length=1, max_length=200)
    company: str = Field(default="", max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=80)
    files: list[QuoteFileRef]
    turnstile_token: str


class OkResponse(BaseModel):
    ok: Literal[True] = True
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(models): pydantic request/response schemas"
```

---

## Task 7: /contact endpoint

**Files:**
- Create: `app/routers/contact.py`, `app/deps.py`, `tests/test_contact.py`
- Modify: `app/main.py`

- [ ] **Step 1: Create `app/deps.py`**

```python
from fastapi import Depends, Request

from app.config import Settings, get_settings


def settings_dep() -> Settings:
    return get_settings()


def client_ip(request: Request) -> str:
    fwd = request.headers.get("cf-connecting-ip") or request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else ""
```

- [ ] **Step 2: Write the failing test**

`tests/test_contact.py`:

```python
from unittest.mock import AsyncMock, patch


def test_contact_success(client, settings):
    payload = {
        "name": "Jan Janssen",
        "company": "Acme",
        "email": "jan@acme.test",
        "phone": "0612345678",
        "message": "Graag offerte voor groot HDPE paneel.",
        "turnstile_token": settings.turnstile_dev_token,
    }
    with patch("app.routers.contact.send_notification", new=AsyncMock()) as send:
        r = client.post("/contact", json=payload)
    assert r.status_code == 200
    assert r.json() == {"ok": True}
    send.assert_called_once()
    body = send.call_args.kwargs["body"]
    assert "Jan Janssen" in body
    assert "jan@acme.test" in body


def test_contact_invalid_email_400(client, settings):
    r = client.post("/contact", json={
        "name": "x", "email": "not-an-email", "message": "hi",
        "turnstile_token": settings.turnstile_dev_token,
    })
    assert r.status_code == 422


def test_contact_bad_turnstile_403(client, settings):
    settings.turnstile_secret = "real"  # forces real verification path
    r = client.post("/contact", json={
        "name": "x", "email": "a@b.com", "message": "hi",
        "turnstile_token": "wrong",
    })
    assert r.status_code == 403
```

- [ ] **Step 3: Implement `app/routers/contact.py`**

```python
from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings
from app.deps import client_ip, settings_dep
from app.models import ContactIn, OkResponse
from app.services.email import send_notification
from app.services.turnstile import verify_token

router = APIRouter()


@router.post("/contact", response_model=OkResponse)
async def post_contact(
    payload: ContactIn,
    settings: Settings = Depends(settings_dep),
    ip: str = Depends(client_ip),
) -> OkResponse:
    if not await verify_token(settings, payload.turnstile_token, remote_ip=ip):
        raise HTTPException(status_code=403, detail="turnstile failed")
    body = (
        f"Nieuw contactbericht\n\n"
        f"Naam: {payload.name}\n"
        f"Bedrijf: {payload.company}\n"
        f"E-mail: {payload.email}\n"
        f"Telefoon: {payload.phone}\n\n"
        f"Bericht:\n{payload.message}\n"
    )
    await send_notification(settings, subject=f"[RoBuPRINT] Contact: {payload.name}", body=body)
    return OkResponse()
```

- [ ] **Step 4: Wire router in `app/main.py`**

In `create_app`, after middleware:

```python
from app.routers import contact

app.include_router(contact.router)
```

- [ ] **Step 5: Override the dependency for the test fixture**

In `tests/conftest.py`, update the `client` fixture to also override `settings_dep`:

```python
from app.deps import settings_dep

@pytest.fixture
def client(settings: Settings) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[settings_dep] = lambda: settings
    return TestClient(app)
```

- [ ] **Step 6: Run + commit**

```bash
uv run pytest -q
git add -A
git commit -m "feat(api): /contact endpoint with Turnstile + email"
```

---

## Task 8: /quote/upload endpoint

**Files:**
- Create: `app/routers/quote.py`, `tests/test_quote_upload.py`
- Modify: `app/main.py`

- [ ] **Step 1: Write the failing test**

`tests/test_quote_upload.py`:

```python
def test_upload_three_chunks(client, settings):
    body = b"hello world!"
    chunks = [body[0:6], body[6:12], b""]
    chunks = [c for c in chunks if c]  # drop empty
    for i, chunk in enumerate(chunks):
        files = {"chunk": ("a.txt", chunk, "application/octet-stream")}
        data = {
            "upload_id": "u-test",
            "filename": "a.txt",
            "chunk_index": str(i),
            "chunk_total": str(len(chunks)),
        }
        r = client.post("/quote/upload", files=files, data=data)
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True, "is_final": i == len(chunks) - 1}


def test_upload_rejects_out_of_order(client, settings):
    files = {"chunk": ("a.txt", b"x", "application/octet-stream")}
    data = {"upload_id": "u-x", "filename": "a.txt", "chunk_index": "1", "chunk_total": "2"}
    r = client.post("/quote/upload", files=files, data=data)
    assert r.status_code == 400


def test_upload_rejects_oversize(client, settings):
    settings.max_file_bytes = 5
    files = {"chunk": ("a.txt", b"abcdefghij", "application/octet-stream")}
    data = {"upload_id": "u-y", "filename": "a.txt", "chunk_index": "0", "chunk_total": "1"}
    r = client.post("/quote/upload", files=files, data=data)
    assert r.status_code == 413
```

- [ ] **Step 2: Implement `app/routers/quote.py` (upload only — submit comes in Task 9)**

```python
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import Settings
from app.deps import settings_dep
from app.services.storage import StorageError, append_chunk

router = APIRouter()


@router.post("/quote/upload")
async def post_upload(
    upload_id: str = Form(...),
    filename: str = Form(...),
    chunk_index: int = Form(...),
    chunk_total: int = Form(...),
    chunk: UploadFile = File(...),
    settings: Settings = Depends(settings_dep),
) -> dict:
    payload = await chunk.read()
    try:
        is_final = append_chunk(
            settings,
            upload_id,
            chunk_index=chunk_index,
            chunk_total=chunk_total,
            filename=filename,
            chunk_bytes=payload,
        )
    except StorageError as e:
        msg = str(e).lower()
        if "max_file_bytes" in msg:
            raise HTTPException(status_code=413, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True, "is_final": is_final}
```

- [ ] **Step 3: Wire in `app/main.py`**

```python
from app.routers import quote
app.include_router(quote.router)
```

- [ ] **Step 4: Run + commit**

```bash
uv run pytest tests/test_quote_upload.py -q
git add -A
git commit -m "feat(api): /quote/upload chunk receiver"
```

---

## Task 9: /quote/submit endpoint

**Files:**
- Modify: `app/routers/quote.py`
- Create: `tests/test_quote_submit.py`

- [ ] **Step 1: Write the failing test**

`tests/test_quote_submit.py`:

```python
from unittest.mock import AsyncMock, patch


def _upload(client, body: bytes, upload_id: str, filename: str = "a.stl"):
    files = {"chunk": (filename, body, "application/octet-stream")}
    data = {"upload_id": upload_id, "filename": filename, "chunk_index": "0", "chunk_total": "1"}
    r = client.post("/quote/upload", files=files, data=data)
    assert r.status_code == 200


def test_submit_assembles_files_and_emails(client, settings):
    _upload(client, b"FAKE_STL_DATA", "u-q1")
    payload = {
        "material": "HDPE",
        "quantity": "1 (prototype)",
        "milling": "Ja, voor strakke finish",
        "deadline": "medio juni",
        "description": "Gevelpaneel",
        "name": "Marieke",
        "company": "Studio X",
        "email": "marieke@studiox.test",
        "phone": "",
        "files": [{"upload_id": "u-q1", "filename": "a.stl", "size": 13}],
        "turnstile_token": settings.turnstile_dev_token,
    }
    with patch("app.routers.quote.send_notification", new=AsyncMock()) as send:
        r = client.post("/quote/submit", json=payload)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}
    send.assert_called_once()
    body = send.call_args.kwargs["body"]
    assert "Marieke" in body
    assert "HDPE" in body
    # Final assembled file exists
    final = settings.upload_dir / "uq1" / "a.stl" / "a.stl"
    assert final.exists() and final.read_bytes() == b"FAKE_STL_DATA"


def test_submit_rejects_unknown_upload(client, settings):
    payload = {
        "material": "HDPE", "quantity": "1", "name": "X",
        "email": "x@y.test",
        "files": [{"upload_id": "missing", "filename": "a.stl", "size": 0}],
        "turnstile_token": settings.turnstile_dev_token,
    }
    r = client.post("/quote/submit", json=payload)
    assert r.status_code == 400
```

- [ ] **Step 2: Extend `app/routers/quote.py`**

Append to the same file:

```python
from app.deps import client_ip
from app.models import OkResponse, QuoteIn
from app.services.email import send_notification
from app.services.storage import assemble, make_download_token
from app.services.turnstile import verify_token


@router.post("/quote/submit", response_model=OkResponse)
async def post_submit(
    payload: QuoteIn,
    settings: Settings = Depends(settings_dep),
    ip: str = Depends(client_ip),
) -> OkResponse:
    if not await verify_token(settings, payload.turnstile_token, remote_ip=ip):
        raise HTTPException(status_code=403, detail="turnstile failed")
    file_lines: list[str] = []
    for f in payload.files:
        try:
            final = assemble(settings, f.upload_id, filename=f.filename)
        except StorageError as e:
            raise HTTPException(status_code=400, detail=f"upload {f.upload_id}: {e}")
        token = make_download_token(settings, f.upload_id, final.name)
        url = f"https://api.robuprint.nl/quote/files/{f.upload_id}/{final.name}?t={token}"
        file_lines.append(f"  - {final.name} ({f.size} bytes) — {url}")

    body = (
        f"Nieuwe offerte-aanvraag\n\n"
        f"Naam: {payload.name}\n"
        f"Bedrijf: {payload.company}\n"
        f"E-mail: {payload.email}\n"
        f"Telefoon: {payload.phone}\n\n"
        f"Materiaal: {payload.material}\n"
        f"Aantal: {payload.quantity}\n"
        f"Nafrezen: {payload.milling}\n"
        f"Gewenste opleverdatum: {payload.deadline}\n\n"
        f"Beschrijving:\n{payload.description}\n\n"
        f"Bestanden:\n" + ("\n".join(file_lines) if file_lines else "  (geen)") + "\n"
    )
    await send_notification(settings, subject=f"[RoBuPRINT] Offerte: {payload.name}", body=body)
    return OkResponse()
```

- [ ] **Step 3: Run + commit**

```bash
uv run pytest tests/test_quote_submit.py -q
git add -A
git commit -m "feat(api): /quote/submit assembles files, sends email with download links"
```

---

## Task 10: /quote/files/<upload_id>/<filename> download endpoint

**Files:**
- Create: `app/routers/files.py`, `tests/test_files.py`
- Modify: `app/main.py`

- [ ] **Step 1: Write the failing test**

`tests/test_files.py`:

```python
from app.services.storage import append_chunk, assemble, make_download_token


def test_download_with_valid_token(client, settings):
    append_chunk(settings, "u-d1", chunk_index=0, chunk_total=1, filename="a.bin", chunk_bytes=b"hello")
    assemble(settings, "u-d1", filename="a.bin")
    token = make_download_token(settings, "u-d1", "a.bin")
    r = client.get(f"/quote/files/u-d1/a.bin?t={token}")
    assert r.status_code == 200
    assert r.content == b"hello"


def test_download_rejects_bad_token(client, settings):
    append_chunk(settings, "u-d2", chunk_index=0, chunk_total=1, filename="a.bin", chunk_bytes=b"hi")
    assemble(settings, "u-d2", filename="a.bin")
    r = client.get("/quote/files/u-d2/a.bin?t=tampered")
    assert r.status_code == 403


def test_download_rejects_path_traversal(client, settings):
    r = client.get("/quote/files/u-d3/..%2Fetc%2Fpasswd?t=any")
    assert r.status_code in (400, 403, 404)
```

- [ ] **Step 2: Implement `app/routers/files.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from app.config import Settings
from app.deps import settings_dep
from app.services.storage import _safe_filename, _upload_dir, verify_download_token

router = APIRouter()


@router.get("/quote/files/{upload_id}/{filename}")
def download(
    upload_id: str,
    filename: str,
    t: str = Query(...),
    settings: Settings = Depends(settings_dep),
):
    safe_name = _safe_filename(filename)
    if safe_name != filename:
        raise HTTPException(status_code=400, detail="invalid filename")
    if not verify_download_token(settings, t, upload_id, safe_name):
        raise HTTPException(status_code=403, detail="invalid or expired token")
    final = _upload_dir(settings, upload_id) / safe_name / safe_name
    if not final.exists():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(final, filename=safe_name)
```

- [ ] **Step 3: Wire and commit**

```python
from app.routers import files
app.include_router(files.router)
```

```bash
uv run pytest tests/test_files.py -q
git add -A
git commit -m "feat(api): token-protected file download"
```

---

## Task 11: /newsletter endpoint with SQLite store

**Files:**
- Create: `app/services/newsletter_store.py`, `app/routers/newsletter.py`, `tests/test_newsletter.py`
- Modify: `app/main.py`

- [ ] **Step 1: Implement `app/services/newsletter_store.py`**

```python
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


@contextmanager
def _conn(db_path: Path) -> Iterator[sqlite3.Connection]:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def add_subscriber(db_path: Path, email: str) -> bool:
    """Returns True if newly added, False if already present."""
    with _conn(db_path) as c:
        try:
            c.execute("INSERT INTO subscribers(email) VALUES (?)", (email.strip().lower(),))
            return True
        except sqlite3.IntegrityError:
            return False
```

- [ ] **Step 2: Write the failing test**

`tests/test_newsletter.py`:

```python
from unittest.mock import AsyncMock, patch


def test_newsletter_subscribe_first_time(client, settings):
    with patch("app.routers.newsletter.send_notification", new=AsyncMock()) as send:
        r = client.post("/newsletter", json={"email": "Foo@Bar.test"})
    assert r.status_code == 200
    assert r.json() == {"ok": True}
    send.assert_called_once()


def test_newsletter_idempotent(client, settings):
    with patch("app.routers.newsletter.send_notification", new=AsyncMock()) as send:
        client.post("/newsletter", json={"email": "x@y.test"})
        r = client.post("/newsletter", json={"email": "x@y.test"})
    assert r.status_code == 200
    # Notification only on the first add
    assert send.call_count == 1


def test_newsletter_rejects_invalid_email(client):
    r = client.post("/newsletter", json={"email": "not-an-email"})
    assert r.status_code == 422
```

- [ ] **Step 3: Implement `app/routers/newsletter.py`**

```python
from fastapi import APIRouter, Depends

from app.config import Settings
from app.deps import settings_dep
from app.models import NewsletterIn, OkResponse
from app.services.email import send_notification
from app.services.newsletter_store import add_subscriber

router = APIRouter()


@router.post("/newsletter", response_model=OkResponse)
async def post_newsletter(payload: NewsletterIn, settings: Settings = Depends(settings_dep)) -> OkResponse:
    is_new = add_subscriber(settings.newsletter_db, payload.email)
    if is_new:
        await send_notification(
            settings,
            subject="[RoBuPRINT] Nieuwe nieuwsbrief-inschrijving",
            body=f"Nieuwe inschrijving: {payload.email}",
        )
    return OkResponse()
```

- [ ] **Step 4: Wire and commit**

```python
from app.routers import newsletter
app.include_router(newsletter.router)
```

```bash
uv run pytest tests/test_newsletter.py -q
git add -A
git commit -m "feat(api): /newsletter with SQLite subscriber store"
```

---

## Task 12: Cleanup script for 90-day upload retention

**Files:**
- Create: `scripts/cleanup_uploads.py`

- [ ] **Step 1: Implement the script**

```python
"""Delete uploads older than ROBUPRINT_RETENTION_DAYS days."""
from __future__ import annotations

import shutil
import time
from pathlib import Path

from app.config import get_settings


def cleanup(now: float | None = None) -> int:
    settings = get_settings()
    now = now or time.time()
    cutoff = now - settings.retention_days * 24 * 3600
    if not settings.upload_dir.exists():
        return 0
    removed = 0
    for child in settings.upload_dir.iterdir():
        if not child.is_dir():
            continue
        if child.stat().st_mtime < cutoff:
            shutil.rmtree(child, ignore_errors=True)
            removed += 1
    return removed


if __name__ == "__main__":
    n = cleanup()
    print(f"Removed {n} stale upload session(s).")
```

- [ ] **Step 2: Manual smoke**

```bash
mkdir -p .uploads/old-session
touch -d "120 days ago" .uploads/old-session
uv run python scripts/cleanup_uploads.py
ls .uploads
```

Expected: `old-session` removed; recent ones preserved. (Skip on Windows or use PowerShell equivalents.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(cleanup): retention script for uploads"
```

---

## Task 13: Deployment artefacts (systemd unit + timer)

**Files:**
- Create: `deploy/robuprint-api.service`, `deploy/robuprint-cleanup.service`, `deploy/robuprint-cleanup.timer`

- [ ] **Step 1: Create `deploy/robuprint-api.service`**

```ini
[Unit]
Description=RoBuPRINT API (FastAPI/Uvicorn)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=robuprint
WorkingDirectory=/opt/robuprint-api
EnvironmentFile=/opt/robuprint-api/.env
ExecStart=/opt/robuprint-api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=on-failure
RestartSec=5
LimitNOFILE=4096
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/robuprint-api/.uploads /opt/robuprint-api/.newsletter.sqlite
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 2: Create `deploy/robuprint-cleanup.service`**

```ini
[Unit]
Description=RoBuPRINT upload cleanup

[Service]
Type=oneshot
User=robuprint
WorkingDirectory=/opt/robuprint-api
EnvironmentFile=/opt/robuprint-api/.env
ExecStart=/opt/robuprint-api/.venv/bin/python scripts/cleanup_uploads.py
```

- [ ] **Step 3: Create `deploy/robuprint-cleanup.timer`**

```ini
[Unit]
Description=Run RoBuPRINT upload cleanup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

- [ ] **Step 4: Update README with operations notes**

Append to `README.md`:

```md
## Deploy (operator)

1. Create user `robuprint` and clone the repo to `/opt/robuprint-api`.
2. `uv sync --frozen` to create the venv.
3. Copy `.env.example` to `.env` and fill in SMTP creds, Turnstile secret, file token secret.
4. Copy `deploy/*.service` and `deploy/*.timer` to `/etc/systemd/system/`.
5. `systemctl daemon-reload && systemctl enable --now robuprint-api.service robuprint-cleanup.timer`.
6. Front it with Caddy / nginx / Cloudflare Tunnel — terminate TLS in front of port 8000.
7. CORS already restricts origins to robuprint.nl. Confirm `ROBUPRINT_CORS_ORIGINS` in `.env`.

## Reverse-proxy example (Caddy)

```caddy
api.robuprint.nl {
  encode gzip
  reverse_proxy 127.0.0.1:8000 {
    transport http {
      keepalive 4s
      keepalive_idle_conns 32
    }
  }
  request_body { max_size 1100MB }
}
```
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(deploy): systemd unit, cleanup timer, ops README"
```

---

## Task 14: Final verification

- [ ] **Step 1: Full test suite green**

```bash
uv run pytest -q
```

- [ ] **Step 2: Manual end-to-end with the frontend**

In a separate terminal: start the frontend (`pnpm dev` in the frontend repo, with `NUXT_PUBLIC_API_BASE=http://localhost:8000`).

In the backend: `uv run uvicorn app.main:app --reload --port 8000`.

In the browser:
- Submit `/contact` — confirm 200 and a notification email (or stubbed log).
- Submit `/offerte` with a small STL — confirm chunked upload, assembly, email arrives with download URL, and clicking the URL streams the file back.
- Submit `/newsletter` twice with the same address — confirm idempotency.

- [ ] **Step 3: Tag v0.1**

```bash
git tag -a v0.1 -m "Backend v0.1 — initial API"
```

---

## Self-review notes

- Spec section 7.2 (4 endpoints, FastAPI, SMTP, storage, validation) → Tasks 3, 4, 5, 6, 7, 8, 9, 11
- Spec section 7.3 (CORS) → Task 1 (CORS middleware) + Task 6 (origin list from settings)
- Spec section 8 (chunked upload + token-protected download + 90-day retention) → Tasks 5, 8, 9, 10, 12
- Spec section "Newsletter (v1)" (local store + notification) → Task 11
- Cleanup-job mechanism resolved → Task 12 + Task 13 (systemd timer)
- All endpoints test the unhappy paths (bad email, bad turnstile, oversize file, out-of-order chunk, missing upload, tampered token, path traversal)
- File-token TTL ties to retention so links in old emails stop working at the same time the files vanish
