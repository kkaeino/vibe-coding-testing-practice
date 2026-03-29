---
description: AdminPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】渲染管理後台頁面
**範例輸入**：渲染 `AdminPage` 元件  
**期待輸出**：顯示「🛠️ 管理後台」標題、返回按鈕、登出按鈕與管理員相關資訊卡片

---

## [x] 【function 邏輯】點擊登出按鈕
**範例輸入**：點擊「登出」按鈕  
**期待輸出**：呼叫 `logout()`，並呼叫 `navigate('/login', { replace: true, state: null })` 導向登入頁
