$lines = Get-Content 'C:\Users\GILBERT KEKO\Desktop\carnetplus_pro\src\screens\BilanSante.tsx' -Encoding UTF8
$tags = @('Card', 'motion.div', 'AnimatePresence', 'CardContent')
foreach ($tag in $tags) {
    $opens = 0
    $closes = 0
    foreach ($l in $lines) {
        $opens += ([regex]::Matches($l, "<$tag")).Count
        $closes += ([regex]::Matches($l, "</$tag>")).Count
    }
    Write-Host "$tag - Opens: $opens, Closes: $closes, Diff: $($opens - $closes)"
}

# Check fragments
$frag_opens = 0
$frag_closes = 0
foreach ($l in $lines) {
    $frag_opens += ([regex]::Matches($l, '<>')).Count
    $frag_closes += ([regex]::Matches($l, '</>')).Count
}
Write-Host "Fragments - Opens: $frag_opens, Closes: $frag_closes, Diff: $($frag_opens - $frag_closes)"
