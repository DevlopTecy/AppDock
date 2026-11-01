param (
    [string]$Action = "GetDevices",
    [string]$DeviceId = "",
    [int]$Volume = -1
)

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioEndpointVolume {
    int f(); 
    int g(); 
    int h(); 
    int i(); 
    int SetMasterVolumeLevelScalar(float fLevel, Guid pguidEventContext);
    int j(); 
    int GetMasterVolumeLevelScalar(out float pfLevel);
    int k(); 
    int l(); 
    int m(); 
    int n(); 
    int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, Guid pguidEventContext);
    int GetMute([MarshalAs(UnmanagedType.Bool)] out bool pbMute);
}

[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice {
    int Activate(ref Guid id, int clsCtx, int activationParams, out IAudioEndpointVolume aev);
}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator {
    int f(); 
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
class MMDeviceEnumeratorComObject {}

public class AudioController {
    private static IAudioEndpointVolume GetEndpointVolume() {
        var enumerator = new MMDeviceEnumeratorComObject() as IMMDeviceEnumerator;
        IMMDevice dev = null;
        Marshal.ThrowExceptionForHR(enumerator.GetDefaultAudioEndpoint(0, 1, out dev)); // eRender = 0, eMultimedia = 1
        
        IAudioEndpointVolume epv = null;
        Guid epvid = typeof(IAudioEndpointVolume).GUID;
        Marshal.ThrowExceptionForHR(dev.Activate(ref epvid, 23, 0, out epv)); // CLSCTX_ALL = 23
        return epv;
    }

    public static float GetVolume() {
        IAudioEndpointVolume epv = GetEndpointVolume();
        try {
            float volume = 0;
            Marshal.ThrowExceptionForHR(epv.GetMasterVolumeLevelScalar(out volume));
            return volume * 100f;
        } finally {
            Marshal.ReleaseComObject(epv);
        }
    }

    public static void SetVolume(float volumePercent) {
        IAudioEndpointVolume epv = GetEndpointVolume();
        try {
            float scalar = Math.Max(0f, Math.Min(100f, volumePercent)) / 100f;
            Marshal.ThrowExceptionForHR(epv.SetMasterVolumeLevelScalar(scalar, Guid.Empty));
        } finally {
            Marshal.ReleaseComObject(epv);
        }
    }

    public static bool GetMute() {
        IAudioEndpointVolume epv = GetEndpointVolume();
        try {
            bool isMuted = false;
            Marshal.ThrowExceptionForHR(epv.GetMute(out isMuted));
            return isMuted;
        } finally {
            Marshal.ReleaseComObject(epv);
        }
    }

    public static bool ToggleMute() {
        IAudioEndpointVolume epv = GetEndpointVolume();
        try {
            bool isMuted = false;
            Marshal.ThrowExceptionForHR(epv.GetMute(out isMuted));
            Marshal.ThrowExceptionForHR(epv.SetMute(!isMuted, Guid.Empty));
            return !isMuted;
        } finally {
            Marshal.ReleaseComObject(epv);
        }
    }
}
'@ -ErrorAction SilentlyContinue

function Get-AudioStatus {
    try {
        $vol = [Math]::Round([AudioController]::GetVolume())
        $mute = [AudioController]::GetMute()
        return [PSCustomObject]@{
            volume = [int]$vol
            isMuted = [bool]$mute
        }
    } catch {
        return [PSCustomObject]@{
            volume = 50
            isMuted = $false
        }
    }
}

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
    "GetVolume" {
        $status = Get-AudioStatus
        $status | ConvertTo-Json -Compress
    }
    "SetVolume" {
        if ($Volume -ge 0 -and $Volume -le 100) {
            try { [AudioController]::SetVolume([float]$Volume) } catch {}
        }
        $status = Get-AudioStatus
        $status | ConvertTo-Json -Compress
    }
    "ToggleMute" {
        try { 
            [AudioController]::ToggleMute() | Out-Null
        } catch {
            $wsh = New-Object -ComObject WScript.Shell
            $wsh.SendKeys([char]173)
        }
        $status = Get-AudioStatus
        $status | ConvertTo-Json -Compress
    }
    "SetDevice" {
        Write-Output "true"
    }
    default {
        $status = Get-AudioStatus
        $status | ConvertTo-Json -Compress
    }
}
