param(
    [string]$Action = "Single",
    [string]$Path = "",
    [string]$Paths = ""
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'SilentlyContinue'

$wscriptShell = $null
try {
    $wscriptShell = New-Object -ComObject WScript.Shell
} catch {}

function Get-IconBase64([string]$targetFile) {
    if (-not [System.IO.File]::Exists($targetFile)) {
        return $null
    }

    $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()

    # Direct image formats
    if ($ext -in @('.png', '.jpg', '.jpeg', '.webp')) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $mime = if ($ext -eq '.png') { 'image/png' } else { 'image/jpeg' }
            return "data:$mime;base64," + [Convert]::ToBase64String($bytes)
        } catch {}
    }

    if ($ext -eq '.ico') {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            return "data:image/x-icon;base64," + [Convert]::ToBase64String($bytes)
        } catch {}
    }

    $extractTarget = $targetFile

    # If it's a shortcut .lnk, resolve target executable / icon location
    if ($ext -eq '.lnk') {
        $resolved = $false
        if ($wscriptShell -ne $null) {
            try {
                $sc = $wscriptShell.CreateShortcut($targetFile)
                if ($sc) {
                    if (![string]::IsNullOrEmpty($sc.IconLocation)) {
                        $parts = $sc.IconLocation.Split(',')
                        $cand = $parts[0].Trim()
                        if ([System.IO.File]::Exists($cand)) {
                            $extractTarget = $cand
                            $resolved = $true
                        }
                    }
                    if (-not $resolved -and ![string]::IsNullOrEmpty($sc.TargetPath)) {
                        if ([System.IO.File]::Exists($sc.TargetPath)) {
                            $extractTarget = $sc.TargetPath
                            $resolved = $true
                        }
                    }
                }
            } catch {}
        }

        # If not resolved via COM, inspect binary for installer/target path (MSI advertised shortcuts, odd/even UTF16, ASCII)
        if (-not $resolved) {
            try {
                $raw = [System.IO.File]::ReadAllBytes($targetFile)
                $text = [System.Text.Encoding]::Default.GetString($raw)
                $matches = [regex]::Matches($text, '[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico)', 'IgnoreCase')
                foreach ($m in $matches) {
                    if ([System.IO.File]::Exists($m.Value)) {
                        $extractTarget = $m.Value
                        $resolved = $true
                        break
                    }
                }

                if (-not $resolved) {
                    # UTF-16 Even offset
                    $u1 = [System.Text.Encoding]::Unicode.GetString($raw)
                    $matchesU1 = [regex]::Matches($u1, '[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico)', 'IgnoreCase')
                    foreach ($m in $matchesU1) {
                        if ([System.IO.File]::Exists($m.Value)) {
                            $extractTarget = $m.Value
                            $resolved = $true
                            break
                        }
                    }
                }

                if (-not $resolved -and $raw.Length -gt 1) {
                    # UTF-16 Odd offset (MSI Advertised shortcuts)
                    $rawOdd = New-Object byte[] ($raw.Length - 1)
                    [Array]::Copy($raw, 1, $rawOdd, 0, $raw.Length - 1)
                    $u2 = [System.Text.Encoding]::Unicode.GetString($rawOdd)
                    $matchesU2 = [regex]::Matches($u2, '[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico)', 'IgnoreCase')
                    foreach ($m in $matchesU2) {
                        if ([System.IO.File]::Exists($m.Value)) {
                            $extractTarget = $m.Value
                            $resolved = $true
                            break
                        }
                    }
                }
            } catch {}
        }
    }

    # Extract icon from target
    $icon = $null
    try {
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($extractTarget)
    } catch {}

    # If target extraction failed and we diverted from original .lnk, try original .lnk
    if ($icon -eq $null -and $extractTarget -ne $targetFile) {
        try {
            $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($targetFile)
        } catch {}
    }

    if ($icon -ne $null) {
        try {
            $bmp = $icon.ToBitmap()
            $ms = New-Object System.IO.MemoryStream
            $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
            $bytes = $ms.ToArray()
            $ms.Close()
            $bmp.Dispose()
            $icon.Dispose()
            return "data:image/png;base64," + [Convert]::ToBase64String($bytes)
        } catch {}
    }

    return $null
}

if ($Action -eq "Single") {
    $res = Get-IconBase64 $Path
    if ($res) {
        Write-Output $res
    } else {
        Write-Output ""
    }
} elseif ($Action -eq "Batch") {
    $arr = $Paths -split '\|'
    $dict = @{}
    foreach ($p in $arr) {
        if (![string]::IsNullOrEmpty($p)) {
            $data = Get-IconBase64 $p
            if ($data) {
                $dict[$p] = $data
            }
        }
    }
    $json = $dict | ConvertTo-Json -Compress
    Write-Output $json
}
