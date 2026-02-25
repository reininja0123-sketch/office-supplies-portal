@echo off
setlocal ENABLEDELAYEDEXPANSION

REM ================================
REM Fixed Configuration
REM ================================
set MYSQL_PATH="C:\Program Files\MariaDB 11.8\bin\mysql.exe"

REM ================================
REM 1. Select SQL File
REM ================================
echo.
echo Scanning for SQL files...
echo --------------------------------
set count=0

REM Loop through all .sql files in the current directory
for %%f in (*.sql) do (
    set /a count+=1
    set "file_!count!=%%f"
    echo [!count!] %%f
)

echo --------------------------------

IF %count%==0 (
    echo ❌ No .sql files found in this folder.
    pause
    exit /b
)

:ASK_FILE
set /p file_choice="Select file number to import: "

REM Check if input is empty or invalid
if "%file_choice%"=="" goto ASK_FILE
if !file_choice! GTR %count% (
    echo Invalid selection. Try again.
    goto ASK_FILE
)
if !file_choice! LSS 1 (
    echo Invalid selection. Try again.
    goto ASK_FILE
)

REM Set the DUMP_FILE variable based on selection
set "DUMP_FILE=!file_%file_choice%!"
echo.
echo Selected File: %DUMP_FILE%

REM ================================
REM 2. Connection Details
REM ================================
echo.
set /p DB_HOST=Enter MariaDB host [default: localhost]:
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT=Enter MariaDB port [default: 3306]:
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_NAME=Enter Database Name [default: pnac_sup]:
if "%DB_NAME%"=="" set DB_NAME=pnac_sup

set /p DB_USER=Enter MariaDB username [default: root]:
if "%DB_USER%"=="" set DB_USER=root

echo Enter MariaDB password:
set /p DB_PASS=

REM ================================
REM 3. Create Database (If Not Exists)
REM ================================
echo.
echo Checking/Creating database %DB_NAME%...

%MYSQL_PATH% ^
 -h %DB_HOST% -P %DB_PORT% ^
 -u %DB_USER% -p%DB_PASS% ^
 -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to create database. Check credentials or connection.
    pause
    exit /b %ERRORLEVEL%
)

REM ================================
REM 4. Import Process
REM ================================
echo.
echo Importing %DUMP_FILE% into %DB_NAME% ...
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