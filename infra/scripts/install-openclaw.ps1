$ErrorActionPreference = 'Stop'

$installDir = if ($env:OPENCLAW_INSTALL_DIR) { $env:OPENCLAW_INSTALL_DIR } else { Join-Path $env:USERPROFILE '.openclaw' }

Write-Host "开始安装 OpenClaw 到: $installDir"
if (-not (Test-Path $installDir)) {
  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

$markerPath = Join-Path $installDir '.openclaw-installed'
@"
installed_at=$(Get-Date -Format o)
platform=windows
"@ | Set-Content -Encoding UTF8 $markerPath

Write-Host "OpenClaw 安装完成，标记文件: $markerPath"
exit 0
