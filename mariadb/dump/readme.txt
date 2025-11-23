Gawin mo muna ito bago mo import



Install mariaDB 11.8 (x64)


Control Panel > Search mo "Environment" then piliin mo "Edit the system environment variables" > Pop up


Click mo yung "Environment Variables..."

Sa baba System variables > New...

Variable name = mysqldump
Variable value = C:\Program Files\MariaDB 11.8\bin
Then ok


System variables pa din > hanapin mo yung "Path" sa options > open mo un click "New"
Lagay mo = %mysqldump%
Then ok

bukas ka terminal kung saan nakalagay yung full_sql_pnac_sup.sql

mysql -u root -p pnac_sup < full_sql_pnac_sup.sql

Then enter mo password ng database mo then check mo na



then update mo yung .env yung password pa kasi dun password ng database ko sa local palitan mo na lang




