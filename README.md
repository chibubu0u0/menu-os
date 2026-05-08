# 離域菜單 CMS 最新整合更新包

這是整合版更新包，包含：

- 前台深色模式
- 前台分類按鈕
- 入店規章合併顯示
- 後台 CMS 2.0
- 系列分類可編輯
- 前台區塊可編輯
- 期間限定品項欄位
- 版面樣式範例卡片，一列一列顯示
- 修正 `MenuCategory` / `SiteSection` 型別匯出問題

## 更新順序

### 1. 先更新 Supabase

到 Supabase → SQL Editor → New query，先執行：

```text
supabase/cms_2_update.sql
```

如果也想刪掉「風味拿鐵：桂花 / 海鹽 / 焦糖 / 香草 / 黑糖」那段補充說明，再執行：

```text
supabase/remove_flavored_latte_note.sql
```

### 2. 再更新 GitHub

請把以下檔案覆蓋到 GitHub 專案裡：

```text
app/page.tsx
app/admin/page.tsx
components/MenuBrowser.tsx
lib/supabase.ts
```

也可以順便把 supabase 裡的 SQL 檔上傳留存。

### 3. Commit

Commit message 可寫：

```text
sync latest liyu cms update
```

### 4. 等 Vercel 部署

Vercel 部署完成後，前台請用 Command + Shift + R 強制重新整理。

### 5. 驗收

進入：

```text
你的網址/admin
```

應該可以看到：

- 菜單品項
- 系列分類
- 前台區塊

在「系列分類」中可以修改像「牛奶咖啡」的：

- 上方小字 / Eyebrow
- 英文名稱
- 分類說明
- 補充說明
- 版面樣式
- 是否顯示

修改後前台會同步更新。
