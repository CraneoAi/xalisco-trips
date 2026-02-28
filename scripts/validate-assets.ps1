param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string[]]$HtmlFiles = @("index.html", "index-en.html")
)

$ErrorActionPreference = "Stop"

$assetPattern = 'img/[A-Za-z0-9_./\- ]+\.(webp|png|jpg|jpeg|svg|ico)'
$hasError = $false

Write-Host "Validando assets en: $Root" -ForegroundColor Cyan

foreach ($htmlFile in $HtmlFiles) {
  $fullPath = Join-Path $Root $htmlFile

  if (-not (Test-Path $fullPath)) {
    Write-Host "[ERROR] No existe: $htmlFile" -ForegroundColor Red
    $hasError = $true
    continue
  }

  $content = Get-Content -Raw -Path $fullPath
  $references = [regex]::Matches($content, $assetPattern) |
    ForEach-Object { $_.Value } |
    Sort-Object -Unique

  $missing = New-Object System.Collections.Generic.List[string]
  $invalidNaming = New-Object System.Collections.Generic.List[string]

  foreach ($reference in $references) {
    if ($reference -match '\.\.') {
      $invalidNaming.Add($reference)
      continue
    }

    $absoluteAssetPath = Join-Path $Root ($reference -replace '/', '\')
    if (-not (Test-Path $absoluteAssetPath)) {
      $missing.Add($reference)
    }
  }

  Write-Host "--- $htmlFile ---" -ForegroundColor Yellow
  Write-Host "Referencias únicas: $($references.Count)"

  if ($invalidNaming.Count -gt 0) {
    Write-Host "[ERROR] Nombres inválidos (doble punto):" -ForegroundColor Red
    $invalidNaming | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    $hasError = $true
  } else {
    Write-Host "Nombres inválidos: 0" -ForegroundColor Green
  }

  if ($missing.Count -gt 0) {
    Write-Host "[ERROR] Referencias faltantes:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    $hasError = $true
  } else {
    Write-Host "Referencias faltantes: 0" -ForegroundColor Green
  }
}

if ($hasError) {
  Write-Host "\nValidación final: FALLÓ" -ForegroundColor Red
  exit 1
}

Write-Host "\nValidación final: OK (100%)" -ForegroundColor Green
exit 0
