> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【UI 渲染】畫面應正確渲染登入表單與初始狀態
**範例輸入**：進入 LoginPage 頁面
**期待輸出**：應顯示標題「歡迎回來」、Email 輸入框、密碼輸入框以及「登入」按鈕，且無任何錯誤訊息。

---

## [x] 【UI 渲染】Context 存在 authExpiredMessage 時應顯示錯誤並清除
**範例輸入**：Context 中的 `authExpiredMessage` 為 `登入已過期` 進入頁面
**期待輸出**：畫面上方的 error-banner 顯示 `登入已過期`，並呼叫 `clearAuthExpiredMessage()`。

---

## [x] 【表單驗證】Email 格式錯誤時應阻擋提交並顯示錯誤訊息
**範例輸入**：輸入 Email 為 `invalid-email`，點擊登入按鈕
**期待輸出**：畫面應顯示 `請輸入有效的 Email 格式` 錯誤訊息，且不會呼叫 login API。

---

## [x] 【表單驗證】密碼長度不足 8 碼時應阻擋提交並顯示錯誤訊息
**範例輸入**：輸入 Email `test@example.com`，密碼 `1234567`，點擊登入按鈕
**期待輸出**：畫面應顯示 `密碼必須至少 8 個字元` 錯誤訊息，且不會呼叫 login API。

---

## [x] 【表單驗證】密碼未包含英數字時應阻擋提交並顯示錯誤訊息
**範例輸入**：輸入 Email `test@example.com`，密碼 `12345678` (全數字)，點擊登入按鈕
**期待輸出**：畫面應顯示 `密碼必須包含英文字母和數字` 錯誤訊息，且不會呼叫 login API。

---

## [x] 【登入邏輯與導向】成功登入後應導向至 Dashboard
**範例輸入**：輸入正確格式的帳號 `test@example.com` 與密碼 `pass1234`，Mock `login` 成功回傳
**期待輸出**：`login` 函數被正確呼叫，且成功後使用 `navigate` 導向至 `/dashboard` (replace: true)。

---

## [x] 【登入邏輯與導向】登入失敗時應顯示 API 錯誤訊息
**範例輸入**：輸入正確格式的帳號密碼，Mock `login` 拋出錯誤並夾帶 message `帳號或密碼錯誤`
**期待輸出**：畫面上方的 error-banner 顯示 `帳號或密碼錯誤`。

---

## [x] 【登入邏輯與導向】已登入狀態下應自動導向至 Dashboard
**範例輸入**：進入 LoginPage 時，Context 的 `isAuthenticated` 為 `true`
**期待輸出**：直接觸發 useEffect 導向至 `/dashboard` (replace: true)。
