# Script xuất 3 file icon PNG (16x16, 48x48, 128x128) đồng bộ thiết kế với icon.svg
# Không cần cài thêm thư viện ngoài - chạy trực tiếp trên Windows PowerShell.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $rootDir 'icons'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [Math]::Min($Radius * 2, [Math]::Min($Width, $Height))
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $Width - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $Width - $d, $Y + $Height - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $Height - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

foreach ($size in @(16, 48, 128)) {
  $scale = $size / 128.0
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  # Nền bo góc gradient xanh dương -> xanh ngọc
  $pad = [float](8 * $scale)
  $tileSize = [float](112 * $scale)
  $tileRadius = [float](26 * $scale)
  if ($size -eq 16) {
    $pad = 0.5
    $tileSize = 15.0
    $tileRadius = 3.5
  }

  $tilePath = New-RoundedRectPath -X $pad -Y $pad -Width $tileSize -Height $tileSize -Radius $tileRadius
  $gradRect = New-Object System.Drawing.RectangleF($pad, $pad, $tileSize, $tileSize)
  $c1 = [System.Drawing.Color]::FromArgb(255, 26, 115, 232)
  $c2 = [System.Drawing.Color]::FromArgb(255, 13, 148, 136)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($gradRect, $c1, $c2, 45.0)
  $g.FillPath($bgBrush, $tilePath)

  if ($size -ge 48) {
    # Khung phụ đề tối giản
    $framePath = New-RoundedRectPath -X (22 * $scale) -Y (28 * $scale) -Width (84 * $scale) -Height (58 * $scale) -Radius (14 * $scale)
    $frameFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(46, 255, 255, 255))
    $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]([Math]::Max(1.5, 3.5 * $scale)))
    $g.FillPath($frameFill, $framePath)
    $g.DrawPath($framePen, $framePath)
    $frameFill.Dispose()
    $framePen.Dispose()
    $framePath.Dispose()

    # Hai thanh transcript bên dưới
    $line1Path = New-RoundedRectPath -X (30 * $scale) -Y (96 * $scale) -Width (44 * $scale) -Height (6 * $scale) -Radius (3 * $scale)
    $line2Path = New-RoundedRectPath -X (80 * $scale) -Y (96 * $scale) -Width (18 * $scale) -Height (6 * $scale) -Radius (3 * $scale)
    $line1Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
    $line2Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(155, 255, 255, 255))
    $g.FillPath($line1Brush, $line1Path)
    $g.FillPath($line2Brush, $line2Path)
    $line1Brush.Dispose(); $line2Brush.Dispose(); $line1Path.Dispose(); $line2Path.Dispose()

    # Chấm đỏ trạng thái đang ghi ở góc trên phải
    $outerR = [float](10.5 * $scale)
    $innerR = [float](7.5 * $scale)
    $cx = [float](99 * $scale)
    $cy = [float](29 * $scale)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $g.FillEllipse($whiteBrush, $cx - $outerR, $cy - $outerR, $outerR * 2, $outerR * 2)
    $g.FillEllipse($redBrush, $cx - $innerR, $cy - $innerR, $innerR * 2, $innerR * 2)
    $whiteBrush.Dispose(); $redBrush.Dispose()

    # Chữ CC sắc nét
    $fontSize = [float](34 * $scale)
    $textRect = New-Object System.Drawing.RectangleF((22 * $scale), (29 * $scale), (84 * $scale), (58 * $scale))
  } else {
    # Kích thước 16px tối ưu độ nét cao cho thanh công cụ Chrome
    $fontSize = 6.6
    $textRect = New-Object System.Drawing.RectangleF(0, 0.6, 16, 15.4)
  }

  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString('CC', $font, $textBrush, $textRect, $sf)

  $outPath = Join-Path $outDir "icon$size.png"
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $sf.Dispose(); $textBrush.Dispose(); $font.Dispose(); $bgBrush.Dispose(); $tilePath.Dispose(); $g.Dispose(); $bmp.Dispose()
  Write-Host "Generated: icons/icon$size.png"
}
