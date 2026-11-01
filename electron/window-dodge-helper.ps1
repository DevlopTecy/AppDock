param (
    [string]$Action = "Check"
)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class WinDodgeHelper {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool IsZoomed(IntPtr hWnd);
}
"@ -ErrorAction SilentlyContinue

$fg = [WinDodgeHelper]::GetForegroundWindow()
if ($fg -eq [IntPtr]::Zero) {
    Write-Output "false"
    exit 0
}

$isMax = [WinDodgeHelper]::IsZoomed($fg)
if ($isMax) {
    Write-Output "true"
} else {
    Write-Output "false"
}

