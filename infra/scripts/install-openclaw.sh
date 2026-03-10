#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${OPENCLAW_INSTALL_DIR:-$HOME/.openclaw}"
echo "开始安装 OpenClaw 到: ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

MARKER_PATH="${INSTALL_DIR}/.openclaw-installed"
{
  echo "installed_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "platform=macos"
} > "${MARKER_PATH}"

echo "OpenClaw 安装完成，标记文件: ${MARKER_PATH}"
