<#
.SYNOPSIS
    Copies and prepares icon files from the LanBucket app assets for the website.

.DESCRIPTION
    Grabs icon files from ..\LanBucket\LanBucket\assets and copies/renames them
    to match what index.html expects:
      - logo.svg
      - favicon.ico          (from LanBucket.ico)
      - favicon-96x96.png    (from AppList.targetsize-96.png)
      - favicon-48x48.png    (from AppList.targetsize-48.png)
      - apple-touch-icon.png (from AppList.targetsize-256.png, resized to 180x180)
#>

param(
    [string]$AssetsPath = (Join-Path $PSScriptRoot '..\LanBucket\LanBucket\assets')
)

$ErrorActionPreference = 'Stop'

$AssetsPath = Resolve-Path $AssetsPath
$DestPath = $PSScriptRoot

Write-Host "Source: $AssetsPath"
Write-Host "Destination: $DestPath"
Write-Host ""

# Mapping: destination filename -> source filename
$copyMap = @{
    'logo.svg'           = 'logo.svg'
    'favicon.ico'        = 'LanBucket.ico'
    'favicon-96x96.png'  = 'AppList.targetsize-96.png'
    'favicon-48x48.png'  = 'AppList.targetsize-48.png'
}

foreach ($entry in $copyMap.GetEnumerator()) {
    $src = Join-Path $AssetsPath $entry.Value
    $dst = Join-Path $DestPath $entry.Key

    if (-not (Test-Path $src)) {
        Write-Warning "Missing source: $($entry.Value)"
        continue
    }

    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "Copied $($entry.Value) -> $($entry.Key)"
}

# apple-touch-icon.png needs to be 180x180, resize from the 256px targetsize
$appleSrc = Join-Path $AssetsPath 'AppList.targetsize-256.png'
$appleDst = Join-Path $DestPath 'apple-touch-icon.png'

if (Test-Path $appleSrc) {
    Add-Type -AssemblyName System.Drawing

    $srcImage = [System.Drawing.Image]::FromFile($appleSrc)
    $destBitmap = New-Object System.Drawing.Bitmap(180, 180)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)

    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, 0, 0, 180, 180)

    $destBitmap.Save($appleDst, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcImage.Dispose()

    Write-Host "Copied AppList.targetsize-256.png -> apple-touch-icon.png (resized 256 -> 180)"
} else {
    Write-Warning "Missing source: AppList.targetsize-256.png (needed for apple-touch-icon.png)"
}

Write-Host ""
Write-Host "Done."
