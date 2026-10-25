param (
    [string]$Action = "GetState"
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and 
    $_.GetParameters().Count -eq 1 -and 
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
})[0]

function AwaitOperation($winRtOp, $resultType) {
    if (-not $winRtOp) { return $null }
    try {
        $netTask = $asTaskGeneric.MakeGenericMethod($resultType).Invoke($null, @($winRtOp))
        $netTask.Wait(2000) | Out-Null
        return $netTask.Result
    } catch {
        return $null
    }
}

try {
    [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime] | Out-Null
    $mgrOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()
    $mgr = AwaitOperation $mgrOp ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

    if ($mgr) {
        $session = $mgr.GetCurrentSession()
        if ($session) {
            # Check active sessions count across all Windows media
            $sessionCount = 1
            try {
                $allSessions = $mgr.GetSessions()
                if ($allSessions) {
                    $sessionCount = $allSessions.Count
                }
            } catch {}

            $info = $session.GetPlaybackInfo()
            $status = if ($info) { $info.PlaybackStatus.ToString() } else { "Unknown" }

            $canSkipNext = $false
            $canSkipPrev = $false
            if ($info -and $info.Controls) {
                $canSkipNext = [bool]$info.Controls.IsNextEnabled
                $canSkipPrev = [bool]$info.Controls.IsPreviousEnabled
            }

            # Only allow skip next / previous when more than 1 session is detected OR next track is explicitly supported
            $effectiveCanNext = ($sessionCount -ge 2) -or $canSkipNext
            $effectiveCanPrev = ($sessionCount -ge 2) -or $canSkipPrev

            if ($Action -eq "Toggle") {
                $session.TryTogglePlayPauseAsync() | Out-Null
                Write-Output '{"success":true}'
                exit 0
            } elseif ($Action -eq "Next") {
                if ($effectiveCanNext) {
                    $session.TrySkipNextAsync() | Out-Null
                }
                Write-Output '{"success":true}'
                exit 0
            } elseif ($Action -eq "Previous") {
                if ($effectiveCanPrev) {
                    $session.TrySkipPreviousAsync() | Out-Null
                }
                Write-Output '{"success":true}'
                exit 0
            }

            # Default: GetState
            $propOp = $session.TryGetMediaPropertiesAsync()
            $props = AwaitOperation $propOp ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])

            # Extract accurate playback timeline (Position & Duration)
            $positionSec = 0
            $durationSec = 0
            try {
                $timeline = $session.GetTimelineProperties()
                if ($timeline) {
                    if ($timeline.Position) {
                        $positionSec = [Math]::Round($timeline.Position.TotalSeconds)
                    }
                    if ($timeline.EndTime) {
                        $durationSec = [Math]::Round($timeline.EndTime.TotalSeconds)
                    }
                }
            } catch {}

            $thumbBase64 = ""
            if ($props -and $props.Thumbnail) {
                try {
                    $streamOp = $props.Thumbnail.OpenReadAsync()
                    $stream = AwaitOperation $streamOp ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
                    $asStreamMethod = [System.IO.WindowsRuntimeStreamExtensions].GetMethods() | Where-Object { 
                        $_.Name -eq 'AsStreamForRead' -and $_.GetParameters().Count -eq 1 
                    } | Select-Object -First 1
                    if ($asStreamMethod) {
                        $netStream = $asStreamMethod.Invoke($null, @($stream))
                        if ($netStream) {
                            $memStream = New-Object System.IO.MemoryStream
                            $netStream.CopyTo($memStream)
                            $bytes = $memStream.ToArray()
                            if ($bytes.Length -gt 0) {
                                $mime = "image/jpeg"
                                if ($stream.ContentType) { $mime = $stream.ContentType }
                                $thumbBase64 = "data:$mime;base64," + [Convert]::ToBase64String($bytes)
                            }
                        }
                    }
                } catch {
                    # Ignore thumbnail extraction failure
                }
            }

            $title = if ($props -and $props.Title) { $props.Title } else { "Unknown Title" }
            $artist = if ($props -and $props.Artist) { $props.Artist } else { "" }
            $album = if ($props -and $props.AlbumTitle) { $props.AlbumTitle } else { "" }

            [PSCustomObject]@{
                hasMedia = $true
                title = $title
                artist = $artist
                albumTitle = $album
                status = $status
                thumbnail = $thumbBase64
                position = $positionSec
                duration = $durationSec
                sessionCount = $sessionCount
                canSkipNext = $effectiveCanNext
                canSkipPrev = $effectiveCanPrev
            } | ConvertTo-Json -Compress
            exit 0
        }
    }
} catch {
    # Return false on error
}

Write-Output '{"hasMedia":false}'
