# 超市管理系统前端

基于 Vue 3 + TypeScript + Vuetify 3 构建的现代化超市管理系统前端。

## 技术栈

- Vue 3
- TypeScript
- Vuetify 3 (Material Design 3)
- Pinia (状态管理)
- Vue Router
- Axios
- Vite
- Cloudflare Turnstile (人机验证)

## 环境配置

1. 复制 `.env.example` 为 `.env`
2. 配置环境变量：

```bash
# API配置
VITE_API_BASE=http://localhost:5000

# Cloudflare Turnstile站点密钥
# 获取地址：https://dash.cloudflare.com/
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

### 获取 Turnstile 站点密钥

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 "Turnstile"
3. 创建新站点
4. 复制站点密钥到 `.env` 文件的 `VITE_TURNSTILE_SITE_KEY`

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览

```bash
npm run preview
```

## 功能特性

- ✅ Material Design 3 设计语言
- ✅ 玻璃形态效果 (Glassmorphism)
- ✅ 响应式设计
- ✅ 暗色模式支持
- ✅ Turnstile 人机验证
- ✅ 用户认证（登录/注册）
- ✅ 商品浏览与搜索
- ✅ 购物车管理
- ✅ 订单管理
- ✅ 个人信息管理
- ✅ 管理员仪表盘
