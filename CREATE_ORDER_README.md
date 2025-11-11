# 建立訂單功能 - 使用說明

## 功能概述

本專案新增了完整的建立訂單功能，包含：

- 訂單列表展示 (`/orders`)
- 建立新訂單 (`/orders/create`)
- 商品選擇與庫存檢查
- 訂單驗證與提交
- Mock 資料支援開發測試

## 功能特色

### 1. 建立訂單頁面 (`/orders/create`)

- **用戶資訊輸入**：用戶ID、訂單描述
- **商品選擇**：從商品列表中選擇，自動檢查庫存
- **數量調整**：支援增減數量，不超過庫存限制
- **即時計算**：自動計算小計和總金額
- **表單驗證**：確保必填欄位完整性

### 2. 訂單列表頁面 (`/orders`)

- **列表展示**：顯示所有訂單基本資訊
- **狀態標記**：以不同顏色標示訂單狀態
- **格式化顯示**：金額、日期時間本地化顯示
- **操作功能**：編輯、刪除訂單

### 3. Mock 資料系統

開發模式下自動使用 Mock 資料，包含：
- 4 個測試商品（含缺貨商品）
- 1 個示例訂單
- 完整的 CRUD 操作模擬

## 檔案結構

```
src/
├── api/
│   ├── order.ts          # 訂單 API
│   ├── product.ts        # 商品 API
│   └── mockApi.ts        # Mock 資料服務
├── types/
│   └── api.ts           # TypeScript 類型定義
├── views/
│   ├── OrderList.vue    # 訂單列表頁面
│   └── CreateOrder.vue  # 建立訂單頁面
└── router/
    └── index.ts         # 路由設定
```

## 使用步驟

### 1. 啟動開發伺服器

```bash
npm run dev
```

### 2. 訪問頁面

- 訂單列表：`http://localhost:5173/orders`
- 建立訂單：`http://localhost:5173/orders/create`

### 3. 建立訂單流程

1. 點擊「新增訂單」按鈕
2. 填入用戶ID（必填）
3. 選擇商品並加入訂單
4. 調整商品數量
5. 檢查訂單總計
6. 點擊「建立訂單」提交

## 技術規格

### 前端技術棧

- **Vue 3** + TypeScript
- **Ant Design Vue** UI 框架
- **Vue Router** 路由管理
- **Axios** HTTP 請求
- **Vite** 建置工具

### API 規格

遵循 OpenAPI 3.0 規範，詳見：
- `TestSDDProject/specs/004-create-order/contracts/openapi.yaml`

### 資料模型

依據 Prisma Schema 設計：
- Order（訂單主檔）
- OrderItem（訂單明細）
- Product（商品資料）

## 開發模式設定

### 環境變數

`.env.development` 檔案控制開發模式設定：

```env
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:3000
```

- `VITE_USE_MOCK=true`：啟用 Mock 資料
- `VITE_USE_MOCK=false`：連接真實後端 API

### Mock 資料說明

Mock 服務模擬完整的 API 行為：
- 網路延遲模擬
- 庫存檢查
- 錯誤處理
- 狀態更新

## 後端整合

要連接真實後端 API：

1. 設定 `VITE_USE_MOCK=false`
2. 確保後端服務運行在 `http://localhost:3000`
3. 實現以下 API 端點：
   - `GET /api/orders/list` - 訂單列表
   - `POST /api/orders` - 建立訂單
   - `DELETE /api/orders/{id}` - 刪除訂單
   - `GET /api/products/list` - 商品列表

## 驗證與測試

### 功能驗證

- [ ] 用戶ID 必填驗證
- [ ] 商品選擇驗證（至少一項）
- [ ] 庫存不足提示
- [ ] 重複商品合併
- [ ] 數量上限控制
- [ ] 總金額計算正確性

### 使用者體驗

- [ ] 載入狀態顯示
- [ ] 操作回饋訊息
- [ ] 錯誤處理提示
- [ ] 響應式介面設計

## 未來擴充

1. **用戶系統整合**：登入狀態、用戶選擇器
2. **商品搜索**：名稱搜索、分類篩選
3. **批次操作**：批次刪除、匯出功能
4. **通知系統**：即時通知、郵件通知
5. **訂單追蹤**：狀態變更歷史、物流追蹤

## 錯誤排除

### 常見問題

1. **Mock 資料未載入**
   - 確認 `.env.development` 檔案存在
   - 檢查 `VITE_USE_MOCK=true` 設定

2. **API 連線錯誤**
   - 確認後端服務運行狀態
   - 檢查 API 端點 URL 設定

3. **類型錯誤**
   - 確保 TypeScript 定義正確
   - 檢查 API 回應格式

---

## 聯絡資訊

如有問題或建議，請聯繫開發團隊。