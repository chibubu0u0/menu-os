# Menu OS — 餐廳菜單管理系統

這是一個可以直接上傳 GitHub 並連接 Vercel 部署的 Next.js + Supabase 菜單管理網站。

## 功能

- 前台菜單頁：`/`
- 後台管理頁：`/admin`
- 管理員 Email / Password 登入
- 新增、編輯、刪除菜單品項
- 修改價格、分類、描述、排序
- 上架 / 下架品項
- 推薦品項區塊
- 自動依分類排版
- 支援手機版 RWD

---

## 1. 安裝專案

```bash
npm install
npm run dev
```

打開：

```txt
http://localhost:3000
```

後台：

```txt
http://localhost:3000/admin
```

---

## 2. 建立 Supabase 專案

1. 到 Supabase 建立新專案
2. 進入 `SQL Editor`
3. 複製 `supabase/schema.sql` 的內容
4. 貼上並執行

這會建立：

- `menu_items` 資料表
- Row Level Security 權限
- 測試菜單資料

---

## 3. 建立管理員帳號

到 Supabase：

```txt
Authentication → Users → Add user
```

建立一組 Email / Password。

之後就可以用這組帳密登入 `/admin`。

---

## 4. 設定環境變數

複製 `.env.example` 成 `.env.local`：

```bash
cp .env.example .env.local
```

填入 Supabase 的 Project URL 與 Anon Key：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_RESTAURANT_NAME=你的餐廳名稱
NEXT_PUBLIC_RESTAURANT_SUBTITLE=Seasonal Menu
```

Supabase 資訊位置：

```txt
Project Settings → API
```

---

## 5. 上傳 GitHub

```bash
git init
git add .
git commit -m "init menu os"
git branch -M main
git remote add origin 你的 GitHub repo URL
git push -u origin main
```

---

## 6. 連接 Vercel

1. 到 Vercel
2. Import GitHub Repository
3. 選擇這個專案
4. 到 Environment Variables 加上：

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_RESTAURANT_NAME
NEXT_PUBLIC_RESTAURANT_SUBTITLE
```

5. Deploy

---

## 注意事項

目前版本是 MVP，適合一間餐廳使用。如果要做成多餐廳 SaaS，可以再加入：

- restaurants 資料表
- 每間餐廳自己的 slug
- 多店家帳號權限
- 圖片上傳到 Supabase Storage
- QR Code 下載功能
- 拖拉排序

