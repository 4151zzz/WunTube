$counter = @{}

Get-ChildItem -Path 'D:\' -Filter '*.mp3' -Recurse | ForEach-Object {
    $base = $_.BaseName

    # ตรวจว่ามีอักขระนอก ASCII ไหม ถ้าไม่มีก็ข้ามไป
    $hasNonAscii = $false
    foreach ($c in $base.ToCharArray()) {
        if ([int]$c -lt 32 -or [int]$c -gt 126) { $hasNonAscii = $true; break }
    }
    if (-not $hasNonAscii) { return }

    # เอาเฉพาะตัวอักษร ASCII ออกมา
    $ascii = ($base.ToCharArray() | Where-Object { [int]$_ -ge 32 -and [int]$_ -le 126 }) -join ''

    # ตัดคำที่ไม่ต้องการ
    $ascii = $ascii -replace '\[.*?\]', ''
    $ascii = $ascii -replace '\(.*?\)', ''
    $ascii = $ascii -replace 'Official MV|Official Audio|Official Music Video|OFFICIAL MV|OFFICIAL|Audio|Cover By|Cover|cover|feat\.|Ft\.|Prod\. By', ''
    $ascii = $ascii -replace 'Live session|LIVE SESSION|COVER VERSION|NEW VERSION', ''

    # ทำความสะอาด
    $ascii = $ascii.Trim()
    $ascii = $ascii -replace '\s+', '_'
    $ascii = $ascii -replace '[^a-zA-Z0-9_]', ''
    $ascii = $ascii -replace '_+', '_'
    $ascii = $ascii -replace '^_|_$', ''

    if ($ascii.Length -lt 2) { $ascii = 'Song' }
    if ($ascii.Length -gt 40) { $ascii = $ascii.Substring(0, 40) }

    # จัดการชื่อซ้ำ
    $key = $ascii
    if ($counter.ContainsKey($key)) {
        $counter[$key]++
        $newName = $ascii + '_' + $counter[$key] + '.mp3'
    } else {
        $counter[$key] = 1
        $newName = $ascii + '.mp3'
    }

    Write-Host "-> $newName  (จาก $($_.DirectoryName))"
    Rename-Item -LiteralPath $_.FullName -NewName $newName
}

Write-Host ""
Write-Host "Done! All Thai-named files have been renamed."
