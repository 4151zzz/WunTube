$files = Get-ChildItem -Path 'D:\' -Filter '*.mp3' -Recurse
$total = $files.Count
$i = 0

foreach ($file in $files) {
    $i++
    $tempFile = $file.FullName + '.tmp.mp3'
    Write-Host "[$i/$total] Converting: $($file.Name)"

    # แปลงเป็น CBR 192kbps MP3 มาตรฐาน
    & ffmpeg -i $file.FullName -codec:a libmp3lame -b:a 192k -ar 44100 -ac 2 -y $tempFile 2>$null

    if ($LASTEXITCODE -eq 0 -and (Test-Path $tempFile)) {
        Remove-Item -LiteralPath $file.FullName -Force
        Rename-Item -LiteralPath $tempFile -NewName $file.Name
        Write-Host "   OK"
    } else {
        if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
        Write-Host "   SKIP (convert failed)"
    }
}

Write-Host ""
Write-Host "Done! Converted $total files to CBR 192kbps MP3."
