---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】渲染登入表單
**範例輸入**：渲染 `LoginPage` 元件  
**期待輸出**：顯示 Email 欄位、密碼欄位、登入按鈕與歡迎圖示等初始 UI

---

## [x] 【function 邏輯】Email 格式驗證失敗
**範例輸入**：Email 輸入 "invalid-email"，密碼輸入 "Valid123" 並按下登入  
**期待輸出**：畫面顯示「請輸入有效的 Email 格式」錯誤訊息，並且不會觸發 login 請求

---

## [x] 【function 邏輯】密碼長度驗證失敗
**範例輸入**：Email 輸入 "test@example.com"，密碼輸入 "a12" 並按下登入  
**期待輸出**：畫面顯示「密碼必須至少 8 個字元」錯誤訊息，並且不會觸發 login 請求

---

## [x] 【function 邏輯】密碼格式驗證失敗
**範例輸入**：Email 輸入 "test@example.com"，密碼輸入 "onlyletters" 或 "12345678" 並按下登入  
**期待輸出**：畫面顯示「密碼必須包含英文字母和數字」錯誤訊息，並且不會觸發 login 請求

---

## [x] 【Mock API】登入成功並導向 Dashboard
**範例輸入**：輸入正確格式的 Email 和密碼，並模擬 login 成功  
**期待輸出**：登入按鈕狀態切換為「登入中...」，成功後呼叫 `navigate('/dashboard', { replace: true })`

---

## [x] 【Mock API】登入失敗並顯示 API 錯誤訊息
**範例輸入**：輸入格式正確的帳密，但模擬 API 回傳 401 錯誤（message: "帳號或密碼錯誤"）  
**期待輸出**：畫面頂部顯示帶有 ⚠️ 圖示的錯誤訊息 "帳號或密碼錯誤"

---

## [x] 【驗證權限】已登入狀態下自動導向
**範例輸入**：在 `isAuthenticated` 為 true 的狀態下渲染 `LoginPage`  
**期待輸出**：元件載入後自動呼叫 `navigate('/dashboard', { replace: true })`，不會停留在登入頁

---

## [x] 【驗證權限】捕獲認證過期訊息
**範例輸入**：在 `authExpiredMessage` 為 "請重新登入" 的狀態下渲染 `LoginPage`  
**期待輸出**：畫面頂部顯示錯誤訊息 "請重新登入"，並成功呼叫 `clearAuthExpiredMessage()`
