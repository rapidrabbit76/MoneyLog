import pytest
from fastapi.testclient import TestClient
from monylog.backend.auth.rest.fastapi import router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router, prefix="/auth")

client = TestClient(app)


def test_login_and_me():
    # 로그인
    response = client.post("/auth/login", json={"username": "test", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.cookies
    # /me에서 사용자 정보 확인
    cookies = {"access_token": response.cookies["access_token"]}
    response = client.get("/auth/me", cookies=cookies)
    assert response.status_code == 200
    assert response.json()["user"]["sub"] == "test"


def test_login_fail():
    response = client.post("/auth/login", json={"username": "wrong", "password": "wrong"})
    assert response.status_code == 401


def test_logout():
    response = client.post("/auth/login", json={"username": "test", "password": "password"})
    cookies = {"access_token": response.cookies["access_token"]}
    response = client.post("/auth/logout", cookies=cookies)
    assert response.status_code == 200
    # 로그아웃 후 /me 접근 시 401
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_refresh_token():
    # 로그인하여 리프레시 토큰 획득
    response = client.post("/auth/login", json={"username": "test", "password": "password"})
    assert response.status_code == 200
    assert "refresh_token" in response.cookies
    refresh_token = response.cookies["refresh_token"]
    # /refresh로 액세스 토큰 재발급
    cookies = {"refresh_token": refresh_token}
    response = client.post("/auth/refresh", cookies=cookies)
    assert response.status_code == 200
    assert "access_token" in response.cookies
    # 새 access_token으로 /me 접근
    new_access_token = response.cookies["access_token"]
    response = client.get("/auth/me", cookies={"access_token": new_access_token})
    assert response.status_code == 200
    assert response.json()["user"]["sub"] == "test"


def test_refresh_token_fail():
    response = client.post("/auth/refresh")
    assert response.status_code == 401
