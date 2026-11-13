@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PHP_BIN=php"
where php >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\xampp\php\php.exe" (
        set "PHP_BIN=C:\xampp\php\php.exe"
    ) else if exist "C:\php\php.exe" (
        set "PHP_BIN=C:\php\php.exe"
    ) else (
        for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP*") do (
            if exist "%%D\php.exe" set "PHP_BIN=%%D\php.exe"
        )
    )
)

"%PHP_BIN%" --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PHP not found! Please install PHP 8.x or XAMPP/Laragon.
    pause
    exit /b 1
)

if not defined PORT set "PORT=3000"

echo.
echo Starting WunTube PHP Server...
echo Browser will open at http://localhost:%PORT%
"%PHP_BIN%" -r "require 'src/InfoController.php'; foreach (WunTube\InfoController::getLocalIPs() as $ip) echo 'Wi-Fi URL: http://' . $ip . ':' . getenv('PORT') . PHP_EOL;"
echo Close this window to stop the server.
echo.

start "" cmd /c "timeout /t 2 >nul && start http://localhost:%PORT%"

"%PHP_BIN%" -S 0.0.0.0:%PORT% -t public router.php

pause
