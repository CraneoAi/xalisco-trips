# Validate JSON-LD blocks in index.html
$content = Get-Content "index.html" -Raw
$pattern = '(?s)<script type="application/ld\+json">(.*?)</script>'
$matches = [regex]::Matches($content, $pattern)

Write-Host "Validating $($matches.Count) JSON-LD blocks in index.html...`n" -ForegroundColor Cyan

for ($i = 0; $i -lt $matches.Count; $i++) {
    $json = $matches[$i].Groups[1].Value.Trim()
    
    try {
        $parsed = $json | ConvertFrom-Json
        $type = $parsed.'@type'
        Write-Host "Block $($i+1): ✅ $type" -ForegroundColor Green
    } catch {
        Write-Host "Block $($i+1): ❌ ERROR" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
