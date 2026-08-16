$env:PATH = "$env:LOCALAPPDATA\MinGit\cmd;$env:PATH"
Write-Host "Mengunggah perubahan ke GitHub..." -ForegroundColor Cyan
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "Update sistem jimpitan dusun kiyudan"
    git push
    Write-Host "Berhasil diunggah ke GitHub!" -ForegroundColor Green
} else {
    Write-Host "Tidak ada perubahan baru untuk diupload." -ForegroundColor Yellow
}
