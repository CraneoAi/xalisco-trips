param([string]$Root)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-LineNumber {
  param([string]$Text,[string]$Pattern)
  $m = [regex]::Match($Text,$Pattern,[System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if(-not $m.Success){ return $null }
  $prefix = $Text.Substring(0,$m.Index)
  return ($prefix -split "`n").Count
}

$domain = "https://xaliscotrips.lat"
$htmlFiles = Get-ChildItem -Path $Root -File -Filter *.html | Sort-Object Name
$fileNames = $htmlFiles.Name

$results = [ordered]@{}
$allIssues = New-Object System.Collections.Generic.List[object]
$allWarnings = New-Object System.Collections.Generic.List[object]
$allPass = New-Object System.Collections.Generic.List[string]

# Build URL map
$urlToFile = @{}
foreach($f in $htmlFiles){
  if($f.Name -ieq "index.html"){
    $urlToFile["$domain/"] = $f.Name
    $urlToFile["$domain/index.html"] = $f.Name
  } else {
    $urlToFile["$domain/$($f.Name)"] = $f.Name
  }
}

foreach($f in $htmlFiles){
  $text = Get-Content -Raw -Path $f.FullName
  $name = $f.Name
  $isEn = $name -like "*-en.html"
  $esPair = if($isEn){ $name -replace "-en\.html$",".html" } else { if($name -ieq "index.html"){"index.html"} elseif(Test-Path (Join-Path $Root (($name -replace "\.html$","-en.html")))){ $name -replace "\.html$","-en.html" } else { $null } }
  $enPair = if($isEn){ $name } else { if($name -ieq "index.html"){"index-en.html"} elseif(Test-Path (Join-Path $Root (($name -replace "\.html$","-en.html")))){ $name -replace "\.html$","-en.html" } else { $null } }

  $expectedSelf = if($name -ieq "index.html"){ "$domain/" } else { "$domain/$name" }
  $expectedEs = if($name -ieq "index.html"){ "$domain/" } elseif($isEn){ "$domain/$esPair" } else { "$domain/$name" }
  $expectedEn = if($name -ieq "index.html"){ "$domain/index-en.html" } elseif($isEn){ "$domain/$name" } elseif($enPair){ "$domain/$enPair" } else { $null }

  $fileData = [ordered]@{
    file = $name
    canonical = $null
    canonicalOk = $false
    hreflang = @{}
    title = $null
    titleLen = 0
    descriptionLen = 0
    robots = $null
    og = @{}
    twitter = @{}
    h1Count = 0
    headingJump = $false
    imagesTotal = 0
    imagesMissingAlt = @()
    imagesEmptyAlt = @()
    imagesMissingWH = @()
    nonModernImages = @()
    blockingHeadScripts = @()
    productSchemas = 0
    productMissing = @()
    hasLocalBusiness = $false
    localBusinessMissing = @()
    hasEvent = $false
    eventMissing = @()
    jsonErrors = @()
    internalBrokenLinks = @()
    lcpIssues = @()
  }

  # canonical
  $canonM = [regex]::Match($text,'<link[^>]+rel="canonical"[^>]+href="([^"]+)"','IgnoreCase')
  if($canonM.Success){
    $fileData.canonical = $canonM.Groups[1].Value.Trim()
    if($fileData.canonical -eq $expectedSelf -and $fileData.canonical -match '^https://'){
      $fileData.canonicalOk = $true
      $allPass.Add("$name canonical OK") | Out-Null
    } else {
      $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=(Get-LineNumber $text '<link[^>]+rel="canonical"');msg="Canonical incorrecto: $($fileData.canonical) (esperado: $expectedSelf)"}) | Out-Null
    }
  } else {
    $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta canonical'}) | Out-Null
  }

  # hreflang
  $altMatches = [regex]::Matches($text,'<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"','IgnoreCase')
  foreach($m in $altMatches){ $fileData.hreflang[$m.Groups[1].Value.ToLower()] = $m.Groups[2].Value.Trim() }
  if(-not $fileData.hreflang.ContainsKey('es')){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta hreflang es'}) | Out-Null }
  if(-not $fileData.hreflang.ContainsKey('en')){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta hreflang en'}) | Out-Null }
  if(-not $fileData.hreflang.ContainsKey('x-default')){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta hreflang x-default'}) | Out-Null }
  if($fileData.hreflang.ContainsKey('es') -and $fileData.hreflang['es'] -ne $expectedEs){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="hreflang es incorrecto: $($fileData.hreflang['es']) (esperado: $expectedEs)"}) | Out-Null }
  if($expectedEn){ if($fileData.hreflang.ContainsKey('en') -and $fileData.hreflang['en'] -ne $expectedEn){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="hreflang en incorrecto: $($fileData.hreflang['en']) (esperado: $expectedEn)"}) | Out-Null } }
  if($fileData.hreflang.ContainsKey('x-default') -and $expectedEn -and $fileData.hreflang['x-default'] -ne $expectedEn){ $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg="x-default no apunta a EN: $($fileData.hreflang['x-default']) (esperado: $expectedEn)"}) | Out-Null }

  # meta basics
  $titleM = [regex]::Match($text,'<title>([\s\S]*?)</title>','IgnoreCase')
  if($titleM.Success){
    $t = ($titleM.Groups[1].Value -replace '\s+',' ').Trim()
    $fileData.title = $t
    $fileData.titleLen = $t.Length
    if($t.Length -lt 50 -or $t.Length -gt 60){ $allWarnings.Add([pscustomobject]@{file=$name;line=(Get-LineNumber $text '<title>');msg="Title fuera de 50-60 caracteres ($($t.Length))"}) | Out-Null }
  } else { $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta <title>'}) | Out-Null }

  $descM = [regex]::Match($text,'<meta[^>]+name="description"[^>]+content="([^"]*)"','IgnoreCase')
  if($descM.Success){
    $d = $descM.Groups[1].Value.Trim(); $fileData.descriptionLen = $d.Length
    if($d.Length -lt 120 -or $d.Length -gt 155){ $allWarnings.Add([pscustomobject]@{file=$name;line=(Get-LineNumber $text 'name="description"');msg="Meta description fuera de 120-155 caracteres ($($d.Length))"}) | Out-Null }
  } else { $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta meta description'}) | Out-Null }

  $robotsM = [regex]::Match($text,'<meta[^>]+name="robots"[^>]+content="([^"]*)"','IgnoreCase')
  if($robotsM.Success){
    $r = $robotsM.Groups[1].Value.ToLower(); $fileData.robots = $r
    if($r -match 'noindex|nofollow'){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=(Get-LineNumber $text 'name="robots"');msg="Meta robots contiene bloqueo: $r"}) | Out-Null }
  }

  foreach($p in @('og:title','og:description','og:image','og:url','og:type')){
    $m = [regex]::Match($text,"<meta[^>]+property=\"$([regex]::Escape($p))\"[^>]+content=\"([^\"]*)\"",'IgnoreCase')
    if($m.Success){ $fileData.og[$p] = $m.Groups[1].Value.Trim() } else { $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="Falta $p"}) | Out-Null }
  }
  if($fileData.og.ContainsKey('og:url') -and $fileData.canonical){ if($fileData.og['og:url'] -ne $fileData.canonical){ $allWarnings.Add([pscustomobject]@{file=$name;line=(Get-LineNumber $text 'property="og:url"');msg="og:url no coincide con canonical ($($fileData.og['og:url']) vs $($fileData.canonical))"}) | Out-Null } }

  foreach($p in @('twitter:card','twitter:title','twitter:description')){
    $m = [regex]::Match($text,"<meta[^>]+name=\"$([regex]::Escape($p))\"[^>]+content=\"([^\"]*)\"",'IgnoreCase')
    if($m.Success){ $fileData.twitter[$p] = $m.Groups[1].Value.Trim() } else { $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg="Falta $p"}) | Out-Null }
  }

  # JSON-LD
  $ldMatches = [regex]::Matches($text,'<script[^>]+type="application/ld\+json"[^>]*>([\s\S]*?)</script>','IgnoreCase')
  foreach($ld in $ldMatches){
    $json = $ld.Groups[1].Value.Trim()
    if(-not $json){ continue }
    try {
      $obj = $json | ConvertFrom-Json -AsHashtable -Depth 100
      $nodes = @($obj)
      if($obj -is [System.Collections.IEnumerable] -and -not ($obj -is [hashtable])){ $nodes = @($obj) }
      foreach($n in $nodes){
        if(-not ($n -is [hashtable])){ continue }
        $types = @()
        if($n.ContainsKey('@type')){ if($n['@type'] -is [System.Collections.IEnumerable] -and -not ($n['@type'] -is [string])){ $types = @($n['@type']) } else { $types = @($n['@type']) } }
        if($types -contains 'Product'){
          $fileData.productSchemas++
          foreach($k in @('name','description','image','brand','offers')){ if(-not $n.ContainsKey($k)){ $fileData.productMissing += $k } }
          if($n.ContainsKey('image')){ if(($n['image'] -is [string]) -and ($n['image'] -notmatch '^https://')){ $fileData.productMissing += 'image-not-absolute' } }
          if($n.ContainsKey('offers') -and ($n['offers'] -is [hashtable])){
            foreach($ok in @('price','priceCurrency','availability','hasMerchantReturnPolicy','shippingDetails')){ if(-not $n['offers'].ContainsKey($ok)){ $fileData.productMissing += "offers.$ok" } }
          }
        }
        if($types -contains 'LocalBusiness'){
          $fileData.hasLocalBusiness = $true
          foreach($lk in @('name','description','url','telephone','address','geo','openingHours','priceRange','aggregateRating','review')){ if(-not $n.ContainsKey($lk)){ $fileData.localBusinessMissing += $lk } }
        }
        if($types -contains 'Event'){
          $fileData.hasEvent = $true
          foreach($ek in @('name','startDate','endDate','location','organizer','image')){ if(-not $n.ContainsKey($ek)){ $fileData.eventMissing += $ek } }
        }
      }
    } catch {
      $fileData.jsonErrors += 'JSON-LD inválido'
    }
  }
  if($fileData.jsonErrors.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='JSON-LD inválido'}) | Out-Null }
  if($name -ne 'index.html' -and $fileData.productSchemas -eq 0 -and $name -notlike 'airport-transfer*'){ $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg='No se detectó Product schema'}) | Out-Null }
  if($fileData.productMissing.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg=('Product schema incompleto: ' + (($fileData.productMissing | Select-Object -Unique) -join ', '))}) | Out-Null }
  if($name -eq 'index.html'){
    if(-not $fileData.hasLocalBusiness){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta LocalBusiness schema'}) | Out-Null }
    if($fileData.localBusinessMissing.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg=('LocalBusiness incompleto: ' + (($fileData.localBusinessMissing | Select-Object -Unique) -join ', '))}) | Out-Null }
  }
  if($name -like '*world-cup*'){
    if(-not $fileData.hasEvent){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg='Falta Event schema'}) | Out-Null }
    if($fileData.eventMissing.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg=('Event schema incompleto: ' + (($fileData.eventMissing | Select-Object -Unique) -join ', '))}) | Out-Null }
  }

  # headings
  $hMatches = [regex]::Matches($text,'<h([1-6])\b','IgnoreCase')
  $levels = @(); foreach($h in $hMatches){ $levels += [int]$h.Groups[1].Value }
  $fileData.h1Count = ($levels | Where-Object { $_ -eq 1 }).Count
  if($fileData.h1Count -ne 1){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="Cantidad de h1 inválida: $($fileData.h1Count)"}) | Out-Null }
  for($i=1;$i -lt $levels.Count;$i++){
    if(($levels[$i]-$levels[$i-1]) -gt 1){ $fileData.headingJump = $true; break }
  }
  if($fileData.headingJump){ $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg='Jerarquía de encabezados con salto de nivel'}) | Out-Null }

  # images
  $imgMatches = [regex]::Matches($text,'<img\b[\s\S]*?>','IgnoreCase')
  $fileData.imagesTotal = $imgMatches.Count
  $idx = 0
  foreach($img in $imgMatches){
    $idx++
    $tag = $img.Value
    $srcM = [regex]::Match($tag,'\bsrc="([^"]+)"','IgnoreCase')
    $src = if($srcM.Success){ $srcM.Groups[1].Value } else { '' }
    $altM = [regex]::Match($tag,'\balt="([^"]*)"','IgnoreCase')
    if(-not $altM.Success){ $fileData.imagesMissingAlt += $src } elseif([string]::IsNullOrWhiteSpace($altM.Groups[1].Value)){ $fileData.imagesEmptyAlt += $src }
    $w = [regex]::Match($tag,'\bwidth="([^"]+)"','IgnoreCase').Success
    $h = [regex]::Match($tag,'\bheight="([^"]+)"','IgnoreCase').Success
    if(-not ($w -and $h)){ $fileData.imagesMissingWH += $src }
    if($src -and $src -notmatch '\.(webp|avif)(\?|$)' -and $src -notmatch '^data:' -and $src -notmatch '\.svg(\?|$)'){ $fileData.nonModernImages += $src }
  }
  if($fileData.imagesMissingAlt.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="Imágenes sin alt: $($fileData.imagesMissingAlt.Count)"}) | Out-Null }
  if($fileData.imagesEmptyAlt.Count -gt 0){ $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg="Imágenes con alt vacío: $($fileData.imagesEmptyAlt.Count)"}) | Out-Null }

  # LCP heuristics
  $preloadImgs = [regex]::Matches($text,'<link[^>]+rel="preload"[^>]+as="image"[^>]+href="([^"]+)"[^>]*>','IgnoreCase')
  $preloadSet = @(); foreach($p in $preloadImgs){ $preloadSet += $p.Groups[1].Value }
  if($preloadSet.Count -eq 0){ $fileData.lcpIssues += 'Sin preload de imagen LCP'; $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg='Sin preload as=image para LCP'}) | Out-Null }
  $hero = [regex]::Match($text,'<img[^>]+(?:hero|portada|banner)[^>]*>','IgnoreCase')
  if($hero.Success){
    $htag = $hero.Value
    if($htag -match 'loading="lazy"'){ $fileData.lcpIssues += 'Hero con loading lazy'; $allIssues.Add([pscustomobject]@{type='perf';file=$name;line=$null;msg='Imagen hero tiene loading=lazy'}) | Out-Null }
    if($htag -notmatch 'fetchpriority="high"'){ $fileData.lcpIssues += 'Hero sin fetchpriority high'; $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg='Imagen hero sin fetchpriority=high'}) | Out-Null }
  }

  # blocking head scripts
  $headM = [regex]::Match($text,'<head>([\s\S]*?)</head>','IgnoreCase')
  if($headM.Success){
    $head = $headM.Groups[1].Value
    $sMatches = [regex]::Matches($head,'<script\b[\s\S]*?</script>|<script\b[^>]*>','IgnoreCase')
    foreach($s in $sMatches){
      $tag = $s.Value
      if($tag -notmatch '\b(defer|async)\b' -and $tag -notmatch 'type="application/ld\+json"'){
        $fileData.blockingHeadScripts += ($tag -replace '\s+',' ').Substring(0,[Math]::Min(120,($tag -replace '\s+',' ').Length))
      }
    }
  }
  if($fileData.blockingHeadScripts.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='perf';file=$name;line=$null;msg="Scripts bloqueantes en head: $($fileData.blockingHeadScripts.Count)"}) | Out-Null }

  # internal links
  $aMatches = [regex]::Matches($text,'<a\b[^>]+href="([^"]+)"','IgnoreCase')
  foreach($a in $aMatches){
    $href = $a.Groups[1].Value.Trim()
    if($href -match '^(#|mailto:|tel:|javascript:|https?://(?!xaliscotrips\.lat))'){ continue }
    $u = $href
    if($u.StartsWith('/')){ $u = "$domain$u" }
    if($u -notmatch '^https?://'){
      # relative local path
      if($u -match '\.html($|[?#])'){
        $local = ($u -split '[?#]')[0]
        if(-not (Test-Path (Join-Path $Root $local))){ $fileData.internalBrokenLinks += $href }
      }
      continue
    }
    # domain absolute
    if($u -match '^https?://xaliscotrips\.lat'){
      $clean = ($u -split '[?#]')[0]
      if(-not $urlToFile.ContainsKey($clean)){
        if($clean -eq "$domain"){ $clean = "$domain/" }
      }
      if(-not $urlToFile.ContainsKey($clean)){ $fileData.internalBrokenLinks += $href }
    }
  }
  if($fileData.internalBrokenLinks.Count -gt 0){ $allIssues.Add([pscustomobject]@{type='critical';file=$name;line=$null;msg="Enlaces internos potencialmente rotos: $((($fileData.internalBrokenLinks | Select-Object -Unique) -join ', '))"}) | Out-Null }

  # accessibility button names
  $btnMatches = [regex]::Matches($text,'<button\b[\s\S]*?</button>','IgnoreCase')
  foreach($b in $btnMatches){
    $bt = $b.Value
    $hasLabel = $bt -match 'aria-label="[^"]+"|aria-labelledby="[^"]+"'
    $inner = ($bt -replace '<button[^>]*>','' -replace '</button>','' -replace '<[^>]+>','' -replace '\s+',' ').Trim()
    if(-not $hasLabel -and [string]::IsNullOrWhiteSpace($inner)){
      $allWarnings.Add([pscustomobject]@{file=$name;line=$null;msg='Button sin nombre accesible detectado'}) | Out-Null
      break
    }
  }

  $results[$name] = $fileData
}

# hreflang bidirectional
foreach($f in $htmlFiles){
  $name = $f.Name
  $isEn = $name -like "*-en.html"
  $pair = if($isEn){ $name -replace "-en\.html$",".html" } else { if($name -ieq 'index.html'){'index-en.html'} else { $name -replace '\.html$','-en.html' } }
  if(-not $results.Contains($pair)){ continue }
  $selfUrl = if($name -ieq 'index.html'){ "$domain/" } else { "$domain/$name" }
  $pairNeeds = if($isEn){ 'en' } else { 'es' }
  if($results[$pair].hreflang.ContainsKey($pairNeeds)){
    if($results[$pair].hreflang[$pairNeeds] -ne (if($pair -ieq 'index.html'){"$domain/"} else {"$domain/$pair"})){
      $allIssues.Add([pscustomobject]@{type='critical';file=$pair;line=$null;msg="Hreflang bidireccional asimétrico con $name"}) | Out-Null
    }
  }
}

# sitemap
$sitemapPath = Join-Path $Root 'sitemap.xml'
$sitemapIssues = @()
$sitemapWarnings = @()
if(Test-Path $sitemapPath){
  [xml]$sx = Get-Content -Raw $sitemapPath
  $locs = @($sx.urlset.url.loc | ForEach-Object { $_.'#text' })
  if($locs.Count -eq 0){ $locs = @($sx.urlset.url.loc | ForEach-Object { $_.ToString() }) }
  $sitemapSet = New-Object System.Collections.Generic.HashSet[string]
  foreach($l in $locs){ if($l){ [void]$sitemapSet.Add(($l.Trim())) } }
  foreach($l in $sitemapSet){
    $clean = ($l -split '[?#]')[0]
    if($clean -eq "$domain"){ $clean = "$domain/" }
    if(-not $urlToFile.ContainsKey($clean)){
      $sitemapIssues += "URL en sitemap sin archivo local: $l"
    }
  }
  foreach($f in $htmlFiles){
    $u = if($f.Name -ieq 'index.html'){ "$domain/" } else { "$domain/$($f.Name)" }
    if(-not $sitemapSet.Contains($u)){
      $sitemapWarnings += "Archivo HTML no listado en sitemap: $($f.Name)"
    }
  }
}

$out = [ordered]@{
  totalPages = $htmlFiles.Count
  issues = $allIssues
  warnings = $allWarnings
  passes = ($allPass | Select-Object -Unique)
  perFile = $results
  sitemapIssues = $sitemapIssues
  sitemapWarnings = $sitemapWarnings
}
$out | ConvertTo-Json -Depth 100