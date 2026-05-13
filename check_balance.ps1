param([string]$File)
$content = Get-Content $File -Raw
$openDivs = [regex]::Matches($content, '<div').Count
$closeDivs = [regex]::Matches($content, '</div>').Count
$openCards = [regex]::Matches($content, '<Card').Count
$closeCards = [regex]::Matches($content, '</Card>').Count
Write-Host "File: $File"
Write-Host "Divs - Open: $openDivs, Close: $closeDivs, Diff: $($openDivs - $closeDivs)"
Write-Host "Cards - Open: $openCards, Close: $closeCards, Diff: $($openCards - $closeCards)"
