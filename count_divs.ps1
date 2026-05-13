param([string]$TargetFile)
$lines = Get-Content $TargetFile -Encoding UTF8
$balance = 0
$lineNum = 0
foreach ($l in $lines) {
    $lineNum++
    $opens = ([regex]::Matches($l, "<div")).Count
    $closes = ([regex]::Matches($l, "</div>")).Count
    $balance += ($opens - $closes)
    if ($opens -gt 0 -or $closes -gt 0) {
        Write-Host "Line ${lineNum}: +${opens} -${closes} = Balance ${balance} | ${l}"
    }
}
Write-Host "Final Balance for ${TargetFile}: ${balance}"
