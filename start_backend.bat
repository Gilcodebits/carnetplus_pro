@echo off
setlocal enabledelayedexpansion

echo Checking for PHP...

:: Check if php is in PATH
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo PHP found in PATH.
    set PHP_CMD=php
) else (
    echo PHP not found in PATH. Searching in WAMP...
    
    :: Common WAMP PHP paths (ordered by preference)
    set "WAMP_PHP_DIR=C:\wamp64\bin\php"
    if exist "!WAMP_PHP_DIR!" (
        for /f "delims=" %%D in ('dir /b /ad /o-n "!WAMP_PHP_DIR!\php*"') do (
            if exist "!WAMP_PHP_DIR!\%%D\php.exe" (
                set "PHP_CMD=!WAMP_PHP_DIR!\%%D\php.exe"
                echo Found PHP in WAMP: !PHP_CMD!
                goto :found
            )
        )
    )
    
    echo.
    echo ERROR: PHP was not found on your system.
    echo Please install PHP or add it to your PATH.
    echo If you use WAMP, ensure it is installed in C:\wamp64.
    pause
    exit /b 1
)

:found
echo Starting CarnetPlus Backend...
echo Access at http://localhost:8000
"!PHP_CMD!" -S localhost:8000 -t backend
pause
