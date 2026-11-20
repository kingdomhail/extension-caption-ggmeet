# Script đóng gói Chrome Extension chuẩn Chrome Web Store
# Tạo file extension-release.zip với manifest.json nằm ngay thư mục gốc,
# sử dụng đường dẫn chuẩn POSIX (/) và tự động loại trừ toàn bộ file không cần thiết.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$rootDir = $PSScriptRoot
$manifestPath = Join-Path $rootDir 'manifest.json'
$outputZip = Join-Path $rootDir 'extension-release.zip'

if (-not (Test-Path $manifestPath)) {
  throw "Không tìm thấy manifest.json tại $rootDir"
}

# Kiểm tra sơ bộ manifest.json trước khi đóng gói
$manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.manifest_version -ne 3) {
  throw "manifest_version phải là 3 (hiện tại: $($manifest.manifest_version))"
}
if ($manifest.description.Length -gt 132) {
  throw "description vượt quá 132 ký tự ($($manifest.description.Length) ký tự)"
}

# Danh sách whitelist các file chạy thực tế của Extension (tự động loại trừ .git, README, STORE_LISTING, PRIVACY_POLICY, scripts, icon.svg, file rác...)
$includeFiles = @(
  'manifest.json',
  'content.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
)

foreach ($relPath in $includeFiles) {
  $fullPath = Join-Path $rootDir ($relPath -replace '/', '\')
  if (-not (Test-Path $fullPath)) {
    throw "Thiếu file bắt buộc để đóng gói: $relPath"
  }
}

if (Test-Path $outputZip) {
  Remove-Item $outputZip -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($outputZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relPath in $includeFiles) {
    $fullPath = Join-Path $rootDir ($relPath -replace '/', '\')
    # Ép dùng dấu gạch chéo / chuẩn POSIX để tương thích tuyệt đối với Chrome Web Store
    $entryName = $relPath -replace '\\', '/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip,
      $fullPath,
      $entryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
} finally {
  $zip.Dispose()
}

# Kiểm tra lại nội dung file zip vừa tạo
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Đã đóng gói thành công: $outputZip" -ForegroundColor Green
Write-Host "Tên Extension : $($manifest.name) v$($manifest.version)"
Write-Host "Mô tả         : $($manifest.description.Length)/132 ký tự"
Write-Host "Danh sách file trong zip:" -ForegroundColor Cyan

$verifyZip = [System.IO.Compression.ZipFile]::OpenRead($outputZip)
try {
  foreach ($entry in $verifyZip.Entries) {
    Write-Host ("  - {0} ({1} bytes)" -f $entry.FullName, $entry.Length)
  }
} finally {
  $verifyZip.Dispose()
}

$zipSizeKB = [Math]::Round((Get-Item $outputZip).Length / 1024, 2)
Write-Host "Tổng dung lượng: $zipSizeKB KB" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
