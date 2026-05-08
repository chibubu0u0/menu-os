# 離域 Menu OS｜Clean Full Project

這是一份可以直接上傳 GitHub、再連接 Vercel 部署的完整專案。

## 內含功能

- Next.js + Tailwind 前台菜單
- Supabase 登入後台
- 菜單品項新增 / 編輯 / 刪除
- 系列分類管理
- 前台區塊管理
- 期間限定品項
- 淺色模式前台
- 分類按鈕
- 版面樣式範例卡片

## GitHub 重新上傳方式

如果你想把 GitHub 原本檔案全部刪掉後重新上傳：

1. 解壓縮這個 ZIP
2. 打開解壓縮後的資料夾
3. 上傳裡面的所有檔案與資料夾到 GitHub repo 根目錄
4. 不要只上傳外層資料夾本身
5. GitHub 首頁必須直接看得到 `package.json`

正確結構：

```txt
app/
components/
lib/
supabase/
package.json
README.md
```

錯誤結構：

```txt
liyu-menu-clean-full-project/
  app/
  package.json
```

## Supabase SQL

如果你的 Supabase 已經設定好，而且前台已有資料，通常不用重跑全部 SQL。

如果你要重新整理資料庫，請依序執行：

1. `supabase/01_schema.sql`
2. `supabase/02_liyu_menu_import.sql`
3. `supabase/03_cms_2_update.sql`
4. 選用：`supabase/04_remove_flavored_latte_note.sql`

如果只是重新上傳 GitHub 程式碼，不需要動 Supabase。

## Vercel 環境變數

在 Vercel Project Settings → Environment Variables 設定：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase Publishable Key
```

注意：不要把 `.env.local` 上傳到 GitHub。

## 部署後網址

前台：

```txt
https://你的網址.vercel.app/
```

後台：

```txt
https://你的網址.vercel.app/admin
```
