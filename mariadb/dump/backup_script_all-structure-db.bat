@echo off
set DB_NAME=pnac_sup
set DB_USER=root
set DB_PASS=siakol
set BACKUP_FILE=full_sql_%DB_NAME%_%date:~-4,4%-%date:~-10,2%-%date:~-7,2%.sql

mysqldump ^
 -u %DB_USER% -p%DB_PASS% ^
 --add-drop-table --routines --triggers --events ^
 %DB_NAME% > "%BACKUP_FILE%"

echo Backup complete: %BACKUP_FILE%

