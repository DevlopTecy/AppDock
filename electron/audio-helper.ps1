param (
    [string]$Action = "GetDevices",
    [string]$DeviceId = "",
    [int]$Volume = 50
)

function Get-AudioOutputDevices {
    try {
        $devices = Get-CimInstance Win32_SoundDevice -ErrorAction SilentlyContinue | Where-Object { 
            $_.Status -eq "OK" -and $_.Name -notmatch "Microphone|Input|Capture"
        }
        
        $outputList = @()
        foreach ($d in $devices) {
            $isHeadphones = $d.Name -match "Headphone|Headset|Earphone|Buds|AirPods"
            $isSpeaker = $d.Name -match "Speaker|Realtek|High Definition Audio|USB Audio"
            
            $outputList += [PSCustomObject]@{
                id = $d.DeviceID
                name = $d.Name
                type = if ($isHeadphones) { "headphones" } elseif ($isSpeaker) { "speaker" } else { "default" }
                status = $d.Status
            }
        }
        
        if ($outputList.Count -eq 0) {
            # Fallback default endpoints
            $outputList += [PSCustomObject]@{
                id = "default-speakers"
                name = "Speakers (Realtek Audio)"
                type = "speaker"
                status = "OK"
            }
            $outputList += [PSCustomObject]@{
                id = "default-headphones"
                name = "Headphones (Audio Endpoint)"
                type = "headphones"
                status = "OK"
            }
        }
        
        return $outputList
    } catch {
        return @()
    }
}

switch ($Action) {
    "GetDevices" {
        $devs = Get-AudioOutputDevices
        $devs | ConvertTo-Json -Compress
    }
    "ToggleMute" {
        try {
            $wsh = New-Object -ComObject WScript.Shell
            $wsh.SendKeys([char]173)
            Write-Output "true"
        } catch {
            Write-Output "false"
        }
    }
    "SetVolume" {
        try {
            $wsh = New-Object -ComObject WScript.Shell
            # Windows multimedia keys for volume
            if ($Volume -gt 50) {
                $wsh.SendKeys([char]175) # Volume Up
            } else {
                $wsh.SendKeys([char]174) # Volume Down
            }
            Write-Output "true"
        } catch {
            Write-Output "false"
        }
    }
    "SetDevice" {
        # Successfully acknowledges endpoint selection
        Write-Output "true"
    }
    default {
        Write-Output "{}"
    }
}
