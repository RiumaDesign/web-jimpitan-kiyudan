@echo off
echo ===================================================
echo   UPLOADING KE GITHUB: web-jimpitan-kiyudan
echo ===================================================
echo.
"C:\Users\62821\AppData\Local\MinGit\cmd\git.exe" add .
set /p msg="Masukkan pesan update (atau tekan Enter untuk default): "
if "%msg%"=="" set msg=Update sistem jimpitan dusun kiyudan
"C:\Users\62821\AppData\Local\MinGit\cmd\git.exe" commit -m "%msg%"
"C:\Users\62821\AppData\Local\MinGit\cmd\git.exe" push
echo.
echo ===================================================
echo   SELESAI! Perubahan berhasil diupload ke GitHub.
echo ===================================================
pause
