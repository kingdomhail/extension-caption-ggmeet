# Script tạo trọn bộ ảnh đồ họa chuẩn Chrome Web Store trong thư mục store-assets/
# - store-icon-128x128.png   : 128x128 PNG (icon 96x96 căn giữa theo guideline CWS)
# - screenshot-1-1280x800.png: 1280x800 PNG 24-bit (KHÔNG alpha)
# - screenshot-2-1280x800.png: 1280x800 PNG 24-bit (KHÔNG alpha)
# - small-promo-440x280.png  : 440x280  PNG 24-bit (KHÔNG alpha)
# - marquee-1400x560.png     : 1400x560 PNG 24-bit (KHÔNG alpha)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $rootDir 'store-assets'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-RoundedRectPath {
  param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [Math]::Min($R * 2, [Math]::Min($W, $H))
  if ($d -le 0) {
    $path.AddRectangle((New-Object System.Drawing.RectangleF($X, $Y, $W, $H)))
    return $path
  }
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-CCBadge {
  param($g, [float]$X, [float]$Y, [float]$Size)
  $s = $Size / 96.0
  $tilePath = New-RoundedRectPath -X $X -Y $Y -W $Size -H $Size -R (22 * $s)
  $rect = New-Object System.Drawing.RectangleF($X, $Y, $Size, $Size)
  $c1 = [System.Drawing.Color]::FromArgb(255, 26, 115, 232)
  $c2 = [System.Drawing.Color]::FromArgb(255, 13, 148, 136)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
  $g.FillPath($bgBrush, $tilePath)

  $framePath = New-RoundedRectPath -X ($X + 14 * $s) -Y ($Y + 18 * $s) -W (68 * $s) -H (48 * $s) -R (12 * $s)
  $frameFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(46, 255, 255, 255))
  $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]([Math]::Max(1.8, 3.0 * $s)))
  $g.FillPath($frameFill, $framePath)
  $g.DrawPath($framePen, $framePath)

  $l1 = New-RoundedRectPath -X ($X + 20 * $s) -Y ($Y + 74 * $s) -W (38 * $s) -H (5.5 * $s) -R (2.75 * $s)
  $l2 = New-RoundedRectPath -X ($X + 63 * $s) -Y ($Y + 74 * $s) -W (14 * $s) -H (5.5 * $s) -R (2.75 * $s)
  $b1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
  $b2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(155, 255, 255, 255))
  $g.FillPath($b1, $l1)
  $g.FillPath($b2, $l2)

  $cx = $X + 78 * $s
  $cy = $Y + 18 * $s
  $rOut = 9.0 * $s
  $rIn = 6.2 * $s
  $wb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $rb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
  $g.FillEllipse($wb, $cx - $rOut, $cy - $rOut, $rOut * 2, $rOut * 2)
  $g.FillEllipse($rb, $cx - $rIn, $cy - $rIn, $rIn * 2, $rIn * 2)

  $font = New-Object System.Drawing.Font('Segoe UI', [float](28 * $s), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF(($X + 14 * $s), ($Y + 19 * $s), (68 * $s), (48 * $s))
  $g.DrawString('CC', $font, $wb, $textRect, $sf)

  $sf.Dispose(); $font.Dispose(); $wb.Dispose(); $rb.Dispose()
  $b1.Dispose(); $b2.Dispose(); $l1.Dispose(); $l2.Dispose()
  $frameFill.Dispose(); $framePen.Dispose(); $framePath.Dispose()
  $bgBrush.Dispose(); $tilePath.Dispose()
}

function Save-24BitPng {
  param($Bitmap, [string]$Path)
  $rgb = New-Object System.Drawing.Bitmap($Bitmap.Width, $Bitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $gr = [System.Drawing.Graphics]::FromImage($rgb)
  $gr.DrawImage($Bitmap, 0, 0, $Bitmap.Width, $Bitmap.Height)
  $gr.Dispose()
  $rgb.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $rgb.Dispose()
}

# ==============================================================================
# 1. STORE ICON 128x128 (96x96 centered with 16px transparent margin per CWS)
# ==============================================================================
$iconBmp = New-Object System.Drawing.Bitmap(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ig = [System.Drawing.Graphics]::FromImage($iconBmp)
$ig.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$ig.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$ig.Clear([System.Drawing.Color]::Transparent)

$shadowPath = New-RoundedRectPath -X 16 -Y 19 -W 96 -H 96 -R 22
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 15, 23, 42))
$ig.FillPath($shadowBrush, $shadowPath)
$shadowBrush.Dispose(); $shadowPath.Dispose()

Draw-CCBadge -g $ig -X 16 -Y 16 -Size 96
$iconOut = Join-Path $outDir 'store-icon-128x128.png'
$iconBmp.Save($iconOut, [System.Drawing.Imaging.ImageFormat]::Png)
$ig.Dispose(); $iconBmp.Dispose()

# Common brushes & fonts
$bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$bMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 71, 85, 105))
$bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 26, 115, 232))
$bGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 22, 163, 74))
$bLightGray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
$bCyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$shBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 15, 23, 42))
$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

# ==============================================================================
# 2. SCREENSHOT 1 (1280x800, 24-bit PNG, no alpha)
# ==============================================================================
$s1 = New-Object System.Drawing.Bitmap(1280, 800, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($s1)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bgGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, 1280, 800)),
  [System.Drawing.Color]::FromArgb(255, 241, 245, 249),
  [System.Drawing.Color]::FromArgb(255, 224, 242, 254),
  30.0
)
$g.FillRectangle($bgGrad, 0, 0, 1280, 800)
$bgGrad.Dispose()

Draw-CCBadge -g $g -X 64 -Y 44 -Size 52
$fTitle = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fSub = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fSmall = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fSmallBold = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$g.DrawString('Captions Recorder for Google Meet', $fTitle, $bDark, 130, 40)
$g.DrawString('Real-time caption capture, smart deduplication, and 1-click export - 100% local in your browser.', $fSub, $bMuted, 132, 78)

# Mock Google Meet window
$meetX = 64; $meetY = 132; $meetW = 720; $meetH = 590
$g.FillPath($shBrush, (New-RoundedRectPath -X ($meetX + 4) -Y ($meetY + 8) -W $meetW -H $meetH -R 18))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 32, 33, 36))), (New-RoundedRectPath -X $meetX -Y $meetY -W $meetW -H $meetH -R 18))

$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 48, 49, 52))), (New-RoundedRectPath -X ($meetX + 18) -Y ($meetY + 16) -W ($meetW - 36) -H 34 -R 10))
$g.DrawString('https://meet.google.com/abc-defg-hij', $fSmall, $bLightGray, $meetX + 34, $meetY + 24)

$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 51, 65, 85))), (New-RoundedRectPath -X ($meetX + 20) -Y ($meetY + 68) -W 332 -H 250 -R 14))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 45, 55, 72))), (New-RoundedRectPath -X ($meetX + 368) -Y ($meetY + 68) -W 332 -H 250 -R 14))

$g.FillEllipse($bBlue, $meetX + 144, $meetY + 146, 84, 84)
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 13, 148, 136))), $meetX + 492, $meetY + 146, 84, 84)
$fAv = New-Object System.Drawing.Font('Segoe UI', 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('AN', $fAv, $bWhite, [System.Drawing.RectangleF]::new($meetX + 144, $meetY + 146, 84, 84), $sfCenter)
$g.DrawString('MT', $fAv, $bWhite, [System.Drawing.RectangleF]::new($meetX + 492, $meetY + 146, 84, 84), $sfCenter)
$g.DrawString('Alex Nguyen', $fSmallBold, $bWhite, $meetX + 34, $meetY + 290)
$g.DrawString('Minh Tran', $fSmallBold, $bWhite, $meetX + 382, $meetY + 290)

# Live Captions region inside Meet
$capBox = New-RoundedRectPath -X ($meetX + 20) -Y ($meetY + 338) -W ($meetW - 40) -H 168 -R 12
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 24, 24, 27))), $capBox)
$g.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 56, 189, 248), 2)), $capBox)

$fCapName = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fCapTxt = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('LIVE CAPTIONS (CC ON)', $fSmallBold, $bCyan, $meetX + 38, $meetY + 352)
$g.DrawString('Alex Nguyen', $fCapName, $bWhite, $meetX + 38, $meetY + 382)
$g.DrawString('Welcome everyone! Let us review the Q4 roadmap and timeline.', $fCapTxt, $bLightGray, $meetX + 38, $meetY + 404)
$g.DrawString('Minh Tran', $fCapName, $bWhite, $meetX + 38, $meetY + 440)
$g.DrawString('Thanks Alex. Our release build is ready and all tests passed.', $fCapTxt, $bLightGray, $meetX + 38, $meetY + 462)

$g.FillPath($bBlue, (New-RoundedRectPath -X ($meetX + 298) -Y ($meetY + 526) -W 124 -H 42 -R 21))
$g.DrawString('CC   Active', $fSmallBold, $bWhite, [System.Drawing.RectangleF]::new($meetX + 298, $meetY + 526, 124, 42), $sfCenter)

# Extension Popup on the right
$popX = 824; $popY = 132; $popW = 392; $popH = 590
$popPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 203, 213, 225), 1.5)
$g.FillPath($shBrush, (New-RoundedRectPath -X ($popX + 6) -Y ($popY + 10) -W $popW -H $popH -R 18))
$popPath = New-RoundedRectPath -X $popX -Y $popY -W $popW -H $popH -R 18
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 250, 252))), $popPath)
$g.DrawPath($popPen, $popPath)

Draw-CCBadge -g $g -X ($popX + 18) -Y ($popY + 18) -Size 36
$fPopTitle = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fPopMeta = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Meet Captions', $fPopTitle, $bDark, $popX + 64, $popY + 18)
$g.DrawString('Room: abc-defg-hij', $fPopMeta, $bMuted, $popX + 64, $popY + 38)

$cntPill = New-RoundedRectPath -X ($popX + 300) -Y ($popY + 23) -W 74 -H 26 -R 13
$g.FillPath($bWhite, $cntPill)
$g.DrawPath($popPen, $cntPill)
$g.DrawString('4 lines', $fSmallBold, $bMuted, [System.Drawing.RectangleF]::new($popX + 300, $popY + 23, 74, 26), $sfCenter)

$stPath = New-RoundedRectPath -X ($popX + 18) -Y ($popY + 68) -W 356 -H 38 -R 10
$g.FillPath($bWhite, $stPath)
$g.DrawPath($popPen, $stPath)
$g.FillEllipse($bGreen, $popX + 32, $popY + 82, 10, 10)
$g.DrawString('Recording', $fSmallBold, $bDark, $popX + 50, $popY + 79)
$g.DrawString('Captions ON', $fPopMeta, $bMuted, $popX + 286, $popY + 80)

$pvPath = New-RoundedRectPath -X ($popX + 18) -Y ($popY + 118) -W 356 -H 332 -R 10
$g.FillPath($bWhite, $pvPath)
$g.DrawPath($popPen, $pvPath)

$pvItems = @(
  @{ t='[09:15:04]'; s='Alex Nguyen:'; m='Welcome everyone! Let us review the Q4 roadmap and timeline.'; hi=$false },
  @{ t='[09:15:18]'; s='Minh Tran:'; m='Thanks Alex. Our release build is ready and all tests passed.'; hi=$false },
  @{ t='[09:15:34]'; s='Alex Nguyen:'; m='Great work! Let us publish the update this afternoon.'; hi=$false },
  @{ t='[09:15:49]'; s='Minh Tran:'; m='Confirmed, I will export the meeting captions right now.'; hi=$true }
)

$fMono = New-Object System.Drawing.Font('Consolas', 11.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fCardTxt = New-Object System.Drawing.Font('Segoe UI', 12.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$iy = $popY + 130
foreach ($it in $pvItems) {
  $cardPath = New-RoundedRectPath -X ($popX + 28) -Y $iy -W 336 -H 72 -R 8
  if ($it.hi) {
    $cBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 246, 255))
    $cBd = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 191, 219, 254), 1)
  } else {
    $cBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
    $cBd = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 226, 232, 240), 1)
  }
  $g.FillPath($cBg, $cardPath)
  $g.DrawPath($cBd, $cardPath)
  $g.DrawString($it.t, $fMono, $bMuted, $popX + 38, $iy + 8)
  $g.DrawString($it.s, $fSmallBold, $bBlue, $popX + 114, $iy + 7)
  $g.DrawString($it.m, $fCardTxt, $bDark, [System.Drawing.RectangleF]::new($popX + 38, $iy + 28, 316, 40))
  $cBg.Dispose(); $cBd.Dispose(); $cardPath.Dispose()
  $iy += 79
}

$g.FillPath($bBlue, (New-RoundedRectPath -X ($popX + 18) -Y ($popY + 462) -W 356 -H 40 -R 8))
$g.DrawString('Copy All Captions', $fSmallBold, $bWhite, [System.Drawing.RectangleF]::new($popX + 18, $popY + 462, 356, 40), $sfCenter)

$btnDl = New-RoundedRectPath -X ($popX + 18) -Y ($popY + 510) -W 173 -H 38 -R 8
$g.FillPath($bWhite, $btnDl)
$g.DrawPath($popPen, $btnDl)
$g.DrawString('Download .txt', $fSmallBold, $bDark, [System.Drawing.RectangleF]::new($popX + 18, $popY + 510, 173, 38), $sfCenter)

$btnClr = New-RoundedRectPath -X ($popX + 201) -Y ($popY + 510) -W 173 -H 38 -R 8
$bRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 220, 38, 38))
$pRed = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 254, 202, 202), 1.2)
$g.FillPath($bWhite, $btnClr)
$g.DrawPath($pRed, $btnClr)
$g.DrawString('Clear Data', $fSmallBold, $bRed, [System.Drawing.RectangleF]::new($popX + 201, $popY + 510, 173, 38), $sfCenter)

$g.DrawString('© 2026 Hải Lập Trình', $fPopMeta, $bMuted, [System.Drawing.RectangleF]::new($popX, $popY + 556, $popW, 22), $sfCenter)
$g.DrawString('Works with English & Vietnamese Google Meet Captions   •   Zero External Servers   •   Manifest V3', $fSmallBold, $bMuted, [System.Drawing.RectangleF]::new(0, 742, 1280, 34), $sfCenter)

Save-24BitPng -Bitmap $s1 -Path (Join-Path $outDir 'screenshot-1-1280x800.png')
$g.Dispose(); $s1.Dispose()

# ==============================================================================
# 3. SCREENSHOT 2 (1280x800, 24-bit PNG, no alpha)
# ==============================================================================
$s2 = New-Object System.Drawing.Bitmap(1280, 800, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g2 = [System.Drawing.Graphics]::FromImage($s2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bgGrad2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, 1280, 800)),
  [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
  [System.Drawing.Color]::FromArgb(255, 17, 94, 89),
  35.0
)
$g2.FillRectangle($bgGrad2, 0, 0, 1280, 800)
$bgGrad2.Dispose()

$fHero = New-Object System.Drawing.Font('Segoe UI', 38, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fHeroSub = New-Object System.Drawing.Font('Segoe UI', 19, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g2.DrawString('Clean Timestamped Transcripts', $fHero, $bWhite, 76, 68)
$g2.DrawString('Copy to clipboard or download as meet-captions-YYYY-MM-DD.txt in one click.', $fHeroSub, $bLightGray, 78, 122)

$txtCard = New-RoundedRectPath -X 76 -Y 192 -W 690 -H 516 -R 16
$g2.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))), $txtCard)
$g2.DrawPath((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 51, 65, 85), 1.5)), $txtCard)

$g2.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))), 100, 214, 12, 12)
$g2.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))), 120, 214, 12, 12)
$g2.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))), 140, 214, 12, 12)
$fFileHead = New-Object System.Drawing.Font('Consolas', 14, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fCode = New-Object System.Drawing.Font('Consolas', 14.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g2.DrawString('meet-captions-2026-11-20.txt', $fFileHead, $bCyan, 174, 211)

$lines = @(
  '[09:15:04] Alex Nguyen: Welcome everyone to today''s sprint review.',
  '[09:15:18] Minh Tran: Thanks Alex, let me share this week''s updates.',
  '[09:15:35] Minh Tran: All tests passed and the release zip is ready.',
  '[09:15:52] Lan Pham: Awesome! I also verified Vietnamese captions.',
  '[09:16:10] Alex Nguyen: Perfect. Let us publish v1.0.0 this afternoon.',
  '[09:16:28] Lan Pham: Done! Downloading the full transcript now.'
)
$ly = 272
foreach ($ln in $lines) {
  $g2.DrawString($ln, $fCode, $bWhite, 102, $ly)
  $ly += 62
}

$cards = @(
  @{ title='Smart Deduplication'; desc='Updates live sentences word-by-word without duplicate lines. Creates a new timestamp only on a new speaker or sentence.' },
  @{ title='Per-Room Persistence'; desc='Temporarily saves captions by Google Meet room ID in chrome.storage.local so closing the popup never loses data.' },
  @{ title='100% Local & Private'; desc='Runs only on meet.google.com. Zero tracking, zero analytics, and zero data sent to any external server.' }
)
$fCardH = New-Object System.Drawing.Font('Segoe UI', 21, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fCardB = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$cy = 192
foreach ($c in $cards) {
  $cp = New-RoundedRectPath -X 802 -Y $cy -W 402 -H 156 -R 14
  $g2.FillPath($bWhite, $cp)
  $g2.DrawString($c.title, $fCardH, $bBlue, 826, $cy + 20)
  $g2.DrawString($c.desc, $fCardB, $bMuted, [System.Drawing.RectangleF]::new(826, $cy + 56, 354, 88))
  $cp.Dispose()
  $cy += 180
}

Save-24BitPng -Bitmap $s2 -Path (Join-Path $outDir 'screenshot-2-1280x800.png')
$g2.Dispose(); $s2.Dispose()

# ==============================================================================
# 4. SMALL PROMO TILE (440x280, 24-bit PNG, no alpha)
# ==============================================================================
$promo = New-Object System.Drawing.Bitmap(440, 280, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gp = [System.Drawing.Graphics]::FromImage($promo)
$gp.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gp.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$pGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, 440, 280)),
  [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
  [System.Drawing.Color]::FromArgb(255, 13, 148, 136),
  40.0
)
$gp.FillRectangle($pGrad, 0, 0, 440, 280)
$pGrad.Dispose()

Draw-CCBadge -g $gp -X 176 -Y 26 -Size 88
$fPromoT = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fPromoS = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$gp.DrawString('Captions Recorder', $fPromoT, $bWhite, [System.Drawing.RectangleF]::new(20, 128, 400, 34), $sfCenter)
$gp.DrawString('for Google Meet', $fPromoT, $bCyan, [System.Drawing.RectangleF]::new(20, 160, 400, 34), $sfCenter)
$gp.DrawString('Live Captions  •  Timestamps  •  100% Local', $fPromoS, $bLightGray, [System.Drawing.RectangleF]::new(20, 214, 400, 28), $sfCenter)

Save-24BitPng -Bitmap $promo -Path (Join-Path $outDir 'small-promo-440x280.png')
$gp.Dispose(); $promo.Dispose()

# ==============================================================================
# 5. MARQUEE PROMO TILE (1400x560, 24-bit PNG, no alpha)
# ==============================================================================
$mq = New-Object System.Drawing.Bitmap(1400, 560, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gm = [System.Drawing.Graphics]::FromImage($mq)
$gm.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gm.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$mGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(0, 0, 1400, 560)),
  [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
  [System.Drawing.Color]::FromArgb(255, 13, 148, 136),
  30.0
)
$gm.FillRectangle($mGrad, 0, 0, 1400, 560)
$mGrad.Dispose()

Draw-CCBadge -g $gm -X 110 -Y 178 -Size 190
$fMqTitle = New-Object System.Drawing.Font('Segoe UI', 54, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fMqSub = New-Object System.Drawing.Font('Segoe UI', 25, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fMqTag = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$gm.DrawString('Captions Recorder', $fMqTitle, $bWhite, 348, 146)
$gm.DrawString('for Google Meet', $fMqTitle, $bCyan, 348, 212)
$gm.DrawString('Capture, deduplicate, copy & export live meeting captions locally.', $fMqSub, $bLightGray, 352, 294)

$tagPill = New-RoundedRectPath -X 352 -Y 356 -W 600 -H 54 -R 27
$gm.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 255, 255))), $tagPill)
$gm.DrawString('[HH:MM:SS] Timestamps   •   .TXT Export   •   100% Local', $fMqTag, $bWhite, [System.Drawing.RectangleF]::new(352, 356, 600, 54), $sfCenter)

Save-24BitPng -Bitmap $mq -Path (Join-Path $outDir 'marquee-1400x560.png')
$gm.Dispose(); $mq.Dispose()

Get-ChildItem $outDir -Filter '*.png' | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  Write-Host ("VERIFIED: {0} -> {1}x{2}, PixelFormat={3}, Size={4} KB" -f $_.Name, $img.Width, $img.Height, $img.PixelFormat, [Math]::Round($_.Length / 1024, 1))
  $img.Dispose()
}
