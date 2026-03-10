# openclaw-launcher

本仓库是 **本地安装型 OpenClaw 助手发行版** Monorepo。

## 快速开始

```bash
pnpm install
pnpm dev
```

## 工作区

- `apps/desktop`: Tauri + React 桌面安装器与控制台
- `apps/local-api`: 本地 NestJS 编排服务（安装/配置/运行）
- `apps/cloud-api`: 云端 NestJS 服务（账号/套餐/支付/授权）
- `packages/*`: 共享类型、组件、适配器与核心能力
