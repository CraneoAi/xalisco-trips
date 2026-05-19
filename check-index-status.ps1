# Check remaining fixes needed in index.html
$content = Get-Content "index.html" -Raw
$pattern = '(?s)<script type="application/ld\+json">(.*?)</script>'
$matches = [regex]::Matches($content, $pattern)

Write-Host "Status check: index.html`n" -ForegroundColor Cyan
$needsFix = 0
for ($i = 0; $i -lt $matches.Count; $i++) {
    $json = $matches[$i].Groups[1].Value.Trim()
    if ($json.Contains('"touristType"') -or $json.Contains('"TourOperator"')) {
        Write-Host "Block $($i+1): ❌ Needs fixing" -ForegroundColor Yellow
        $needsFix++
    } else {
        try {
            $parsed = $json | ConvertFrom-Json
            Write-Host "Block $($i+1): ✅ $($parsed.'@type')" -ForegroundColor Green
        } catch {
            Write-Host "Block $($i+1): ❌ Invalid JSON: $($_.Exception.Message.Substring(0,50))" -ForegroundColor Red
        }
    }
}
Write-Host "`nBlocks to fix: $needsFix / $($matches.Count)" -ForegroundColor Cyan
