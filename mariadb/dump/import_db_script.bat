@echo off
setlocal ENABLEDELAYEDEXPANSION

REM ================================
REM Fixed Configuration
REM ================================
set DB_NAME=pnac_sup_backup
set DUMP_FILE=full_sql_pnac_sup_2026-01-06.sql
set MYSQL_PATH="C:\Program Files\MariaDB 11.8\bin\mysql.exe"

REM ================================
REM User Input
REM ================================
echo.
set /p DB_HOST=Enter MariaDB host [default: localhost]: 
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT=Enter MariaDB port [default: 3306]: 
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_USER=Enter MariaDB username: 

echo Enter MariaDB password:
set /p DB_PASS=

REM ================================
REM Import Process
REM ================================
echo.
echo Importing %DUMP_FILE% into %DB_NAME% on %DB_HOST%:%DB_PORT% ...
echo.

%MYSQL_PATH% ^
 -h %DB_HOST% -P %DB_PORT% ^
 -u %DB_USER% -p%DB_PASS% ^
 %DB_NAME% < "%DUMP_FILE%"

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Import completed successfully.
) ELSE (
    echo.
    echo ❌ Import failed. Please check the error above.
)

pause
