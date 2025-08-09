# COSCUP2025_Web3

> **每天上鏈看錢包太累？讓我用 n8n 自動撈資料、再用 Gemini 告訴你今天該不該 FOMO**

這是 [COSCUP x RubyConf Taiwan 2025](https://coscup.org/2025/sessions/ZYFR8B) 的完整專案，展示如何使用開源工具自動化分析 Solana 區塊鏈數據，結合 AI 模型進行 FOMO 訊號判讀。

## 🎯 專案概述

本專案包含兩個核心組件：
1. **Richlist API** - Solana 富豪榜爬蟲服務
2. **n8n Workflow** - 自動化數據分析與 AI 判讀流程

透過這套系統，你可以：
- 🔄 自動抓取 Solana 富豪榜數據
- 🔍 分析錢包交易記錄
- 🤖 使用 Google Gemini AI 進行 FOMO 訊號分析
- 📧 自動發送分析報告到 Gmail

## 📋 系統需求

- Node.js 18+ 
- n8n (可用 Docker 或 npm 安裝)
- Chrome/Chromium (Puppeteer 需要)
- Google Gemini API Key
- Gmail 帳戶 (用於發送報告)

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/alichaw/COSCUP2025_Web3.git
cd COSCUP2025_Web3
```

### 2. 設置 Richlist API

```bash
cd richlist-api
npm install
node server.js
```

API 將在 `http://localhost:3005` 啟動，測試端點：
```bash
curl http://localhost:3005/richlist
```

### 3. 設置 n8n 工作流程

#### 方法一：使用 Docker (推薦)

```bash
# 啟動 n8n
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### 方法二：使用 npm

```bash
npm install n8n -g
n8n
```

### 4. 導入工作流程

1. 開啟 n8n 界面：`http://localhost:5678`
2. 點擊「Import from file」
3. 選擇 `COSCUP_test.json`
4. 配置必要的認證信息

## ⚙️ 配置指南

### Google Gemini API 設置

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 創建 API Key
3. 在 n8n 中設置 Google PaLM API 憑證

### Gmail 集成設置

1. 在 Google Cloud Console 創建 OAuth 2.0 憑證
2. 在 n8n 中設置 Gmail OAuth2 憑證
3. 授權應用訪問你的 Gmail 帳戶

### Solana RPC 配置

工作流程使用 Helius RPC 節點，你需要：
1. 註冊 [Helius](https://www.helius.dev/)
2. 獲取免費 API Key
3. 在工作流程中替換 API Key

## 🔧 工作流程說明

### 數據流程

1. **觸發器** → 手動執行或定時觸發
2. **富豪榜 API** → 獲取 Solana 富豪榜前 20 名
3. **地址處理** → 提取錢包地址
4. **批次循環** → 逐個分析錢包
5. **簽名查詢** → 獲取最近 5 筆交易簽名
6. **交易詳情** → 獲取完整交易資訊
7. **數據簡化** → 提取關鍵指標
8. **AI 分析** → Gemini 判讀 FOMO 等級
9. **郵件通知** → 發送分析報告

### 關鍵節點配置

#### 富豪榜節點
```javascript
// API URL 配置
url: "http://localhost:3005/richlist"
```

#### Helius RPC 節點
```javascript
// RPC 端點配置  
url: "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
```

#### AI 分析提示詞
```
你是一位專業的區塊鏈分析師，專門分析 Solana 鏈上交易數據來識別 FOMO 訊號。

請以 JSON 格式回答，包含以下欄位：
{
  "fomo_level": "high/medium/low",
  "confidence_score": 0.85,
  "reasoning": "詳細分析理由",
  "key_indicators": ["關鍵指標1", "關鍵指標2"],
  "risk_assessment": "風險評估",
  "recommended_action": "建議行動"
}
```

## 🎛️ 自定義設置

### 修改分析頻率

在 n8n 工作流程中，你可以：
- 添加 Cron 觸發器進行定時分析
- 調整每次分析的錢包數量
- 修改交易歷史查詢深度

### 增加通知渠道

除了 Gmail，你還可以添加：
- Slack 通知
- Discord Webhook
- Telegram Bot
- LINE Notify

### AI 模型選擇

工作流程支援多種 AI 模型：
- Google Gemini (雲端)
- Ollama (本地部署)
- OpenAI GPT (需額外配置)

## 📊 輸出範例

### FOMO 分析報告

```json
{
  "fomo_level": "high",
  "confidence_score": 0.87,
  "reasoning": "檢測到多個大額 SOL 轉移和高頻 DeFi 互動",
  "key_indicators": [
    "24小時內 5筆 >1000 SOL 交易",
    "新代幣交易量激增 300%"
  ],
  "risk_assessment": "高風險：可能為炒作階段",
  "recommended_action": "謹慎觀察，建議小額試水"
}
```

## 🛠️ 故障排除

### 常見問題

**Q: Richlist API 返回空數據**
A: 檢查 CoinCarp 網站結構是否變更，可能需要更新選擇器

**Q: n8n 工作流程執行失敗**
A: 檢查 API Keys 是否正確配置，確認網絡連接正常

**Q: Gmail 發送失敗**
A: 確認 OAuth 2.0 憑證配置正確，檢查 Gmail API 配額

### 調試模式

在 `richlist-api/server.js` 中啟用詳細日志：
```javascript
console.log('Debug info:', debug);
```

## 🚧 開發計畫

- [ ] 支援更多區塊鏈 (Ethereum, BSC)
- [ ] Web 控制面板
- [ ] 歷史數據存儲
- [ ] 更多 AI 模型支援
- [ ] 移動端通知

## 📄 授權條款

本專案採用 MIT License，詳見 [LICENSE](LICENSE) 文件。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

**⚠️ 免責聲明**: 本專案僅供教育和研究用途，不構成投資建議。加密貨幣投資有風險，請自行承擔投資風險。
