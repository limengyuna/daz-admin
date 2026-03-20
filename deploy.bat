@echo off
title Deploy Admin Frontend

echo ============================================
echo     Dazi Admin - Deploy to Server
echo ============================================
echo.

set SERVER_IP=45.192.97.24
set SERVER_USER=root
set SERVER_DIR=/var/www/dazi-admin
set PROJECT_DIR=%~dp0

cd /d "%PROJECT_DIR%"

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)

echo [1/3] Building Admin...
echo       Make sure API base URL is set to server address
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo.
echo [OK] Build success
echo.

echo [2/3] Uploading to server...

echo       Creating directory on server (if not exists)...
ssh %SERVER_USER%@%SERVER_IP% "mkdir -p %SERVER_DIR%"
if %errorlevel% neq 0 (
    echo [ERROR] SSH connection failed!
    pause
    exit /b 1
)

echo       Cleaning old files...
ssh %SERVER_USER%@%SERVER_IP% "rm -rf %SERVER_DIR%/assets %SERVER_DIR%/index.html"

echo       Uploading index.html ...
scp "%PROJECT_DIR%dist\index.html" %SERVER_USER%@%SERVER_IP%:%SERVER_DIR%/

echo       Uploading assets ...
scp -r "%PROJECT_DIR%dist\assets" %SERVER_USER%@%SERVER_IP%:%SERVER_DIR%/

if %errorlevel% neq 0 (
    echo [ERROR] Upload failed!
    pause
    exit /b 1
)

echo [3/3] Setting permissions...
ssh %SERVER_USER%@%SERVER_IP% "chmod -R 755 %SERVER_DIR% && chown -R www-data:www-data %SERVER_DIR%"

echo.
echo [OK] Upload success
echo.

echo ============================================
echo   Deploy success!
echo   Admin URL: http://%SERVER_IP%:8088
echo ============================================
echo.
pause
