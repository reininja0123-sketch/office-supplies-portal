@echo off


set MYSQL_DUMP="C:\Program Files\MariaDB 11.8\bin\mysqldump.exe"

set /p DB_NAME=Enter Database Name [default: pnac_sup]:
if "%DB_NAME%"=="" set DB_NAME=pnac_sup

set /p DB_USER=Enter MariaDB username [default: root]:
if "%DB_USER%"=="" set DB_USER=root

echo Enter MariaDB password:
set /p DB_PASS=


set BACKUP_FILE=full_sql_%DB_NAME%_%date:~-4,4%-%date:~-10,2%-%date:~-7,2%.sql

%MYSQL_DUMP% ^
 -u %DB_USER% -p%DB_PASS% ^
 --add-drop-table --routines --triggers --events ^
 %DB_NAME% > "%BACKUP_FILE%"

echo Backup complete: %BACKUP_FILE%

pause
