$counter = @{}

# ─── Step 1: Rename Thai filenames to ASCII ───────────────────
Write-Host "=== Step 1: Renaming Thai filenames ==="
Get-ChildItem -Path 'D:\' -Filter '*.mp3' -Recurse | ForEach-Object {
    $base = $_.BaseName
    $hasNonAscii = $false
    foreach ($c in $base.ToCharArray()) {
        if ([int]$c -lt 32 -or [int]$c -gt 126) { $hasNonAscii = $true; break }
    }
    if (-not $hasNonAscii) { return }

    $ascii = ($base.ToCharArray() | Where-Object { [int]$_ -ge 32 -and [int]$_ -le 126 }) -join ''
    $ascii = $ascii -replace '\[.*?\]', ''
    $ascii = $ascii -replace '\(.*?\)', ''
    $ascii = $ascii -replace 'Official MV|Official Audio|Official Music Video|OFFICIAL MV|OFFICIAL|Audio|Cover By|Cover|cover|feat\.|Ft\.|Prod\. By|Live session|LIVE SESSION|COVER VERSION|NEW VERSION', ''
    $ascii = $ascii.Trim() -replace '\s+', '_'
    $ascii = $ascii -replace '[^a-zA-Z0-9_]', ''
    $ascii = $ascii -replace '_+', '_' -replace '^_|_$', ''
    if ($ascii.Length -lt 2) { $ascii = 'Song' }
    if ($ascii.Length -gt 40) { $ascii = $ascii.Substring(0, 40) }

    $key = $ascii
    if ($counter.ContainsKey($key)) { $counter[$key]++; $newName = $ascii + '_' + $counter[$key] + '.mp3' }
    else { $counter[$key] = 1; $newName = $ascii + '.mp3' }

    Write-Host "  Rename: $newName"
    Rename-Item -LiteralPath $_.FullName -NewName $newName
}
Write-Host "Rename done."
Write-Host ""

# ─── Step 2: Convert all MP3s to CBR 192kbps ─────────────────
Write-Host "=== Step 2: Converting to CBR 192kbps ==="
$files = Get-ChildItem -Path 'D:\' -Filter '*.mp3' -Recurse
$total = $files.Count
$i = 0

foreach ($file in $files) {
    $i++
    $tempFile = [System.IO.Path]::Combine($file.DirectoryName, '__tmp_cbr__.mp3')
    Write-Host "[$i/$total] $($file.Name)"

    & ffmpeg -i $file.FullName -codec:a libmp3lame -b:a 192k -ar 44100 -ac 2 -y $tempFile 2>$null

    if ($LASTEXITCODE -eq 0 -and (Test-Path $tempFile)) {
        Remove-Item -LiteralPath $file.FullName -Force
        Rename-Item -LiteralPath $tempFile -NewName $file.Name
        Write-Host "   OK"
    } else {
        if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
        Write-Host "   SKIP"
    }
}

Write-Host ""
Write-Host "All done! $total files processed."
