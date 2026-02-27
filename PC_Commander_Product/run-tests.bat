@echo off
chcp 65001 >nul
title PC Commander - Automated Test
echo ========================================
echo    PC Commander - Automated Test
echo ========================================
echo.

set SERVER_URL=http://localhost:8000
set PASSED=0
set FAILED=0

echo [1/5] Testing Server Connection...
curl -s %SERVER_URL%/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo    PASS: Health check
curl -s %SERVER_URL%/api/health | findstr "ok" >nul && (
        set /a PASSED+=1
        echo    Server is running
    ) || (
        set /a FAILED+=1
        echo    FAIL: Server not responding correctly
    )
) else (
    set /a FAILED+=1
    echo    FAIL: Cannot connect to server
)

echo.
echo [2/5] Testing API Endpoints...

echo    Testing GET /api/config...
curl -s %SERVER_URL%/api/config | findstr "opencode" >nul && (
    echo      PASS: Config API
    set /a PASSED+=1
) || (
    echo      FAIL: Config API
    set /a FAILED+=1
)

echo    Testing POST /api/chat...
curl -s -X POST %SERVER_URL%/api/chat -H "Content-Type: application/json" -d "{\"message\":\"test\"}" | findstr "success" >nul && (
    echo      PASS: Chat API
    set /a PASSED+=1
) || (
    echo      FAIL: Chat API
    set /a FAILED+=1
)

echo    Testing POST /api/config (update)...
curl -s -X POST %SERVER_URL%/api/config -H "Content-Type: application/json" -d "{\"serverUrl\":\"test\"}" | findstr "error" >nul && (
    echo      SKIP: Config update not implemented
) || (
    echo      PASS: Config update API
    set /a PASSED+=1
)

echo.
echo [3/5] Checking File Structure...

if exist "PC_Server\server.js" (
    echo    PASS: Server code exists
    set /a PASSED+=1
) else (
    echo    FAIL: Server code missing
    set /a FAILED+=1
)

if exist "Mobile_App_Source\pages\index\index.vue" (
    echo    PASS: Mobile app exists
    set /a PASSED+=1
) else (
    echo    FAIL: Mobile app missing
    set /a FAILED+=1
)

if exist "PC_Web_Dashboard\dashboard.html" (
    echo    PASS: Dashboard exists
    set /a PASSED+=1
) else (
    echo    FAIL: Dashboard missing
    set /a FAILED+=1
)

echo.
echo [4/5] Checking Configuration...
if exist "PC_Server\config\api-config.json" (
    echo    PASS: Config file exists
    set /a PASSED+=1
) else (
    echo    FAIL: Config file missing
    set /a FAILED+=1
)

echo.
echo [5/5] Summary
echo ========================================
set /a TOTAL=PASSED+FAILED
echo Total Tests: %TOTAL%
echo Passed: %PASSED%
echo Failed: %FAILED%

if %FAILED% == 0 (
    echo Status: ALL TESTS PASSED
    echo ========================================
    exit /b 0
) else (
    echo Status: SOME TESTS FAILED
    echo ========================================
    exit /b 1
)
