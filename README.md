# 離域菜單淺色模式修正包

這個更新包會把前台菜單從深色模式改回淺色模式，同時保留 CMS 2.0 功能：

- 右上角 Opening Time 卡片
- 前台區塊 / 入店規章
- 系列分類管理
- 期間限定品項
- 分類按鈕
- 後台資料同步
- 修正資料庫內 `\\n` 被直接顯示的問題

## 需要替換的檔案

請把以下兩個檔案覆蓋到 GitHub 專案：

```txt
app/page.tsx
components/MenuBrowser.tsx
```

## 不需要重新跑 SQL

這次只是前台顏色與版面樣式調整，不需要到 Supabase 執行 SQL。

## Commit 建議

```txt
restore light menu theme
```

Commit 後等 Vercel 自動部署完成，前台按 `Command + Shift + R` 強制重新整理。
