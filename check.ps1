$shell = New-Object -COMObject Shell.Application
$folder = $shell.Namespace('D:\')
Get-ChildItem -Path 'D:\' -Filter '*.mp3' | Select-Object -First 10 | ForEach-Object {
    $file = $folder.ParseName($_.Name)
    $title = $folder.GetDetailsOf($file, 21)
    Write-Output "$($_.Name) -> Title: $title"
}
