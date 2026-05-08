'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabaseEnv, MenuItem, supabase } from '@/lib/supabase'

type FormState = {
  id?: string
  category: string
  name: string
  description: string
  price: string
  image_url: string
  available: boolean
  featured: boolean
  sort_order: string
}

const emptyForm: FormState = {
  category: '主餐',
  name: '',
  description: '',
  price: '',
  image_url: '',
  available: true,
  featured: false,
  sort_order: '0'
}

function toFormState(item: MenuItem): FormState {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description || '',
    price: String(item.price ?? ''),
    image_url: item.image_url || '',
    available: item.available,
    featured: item.featured,
    sort_order: String(item.sort_order ?? 0)
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(price)
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [items, setItems] = useState<MenuItem[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category))).sort((a, b) => a.localeCompare(b, 'zh-Hant'))
  }, [items])

  async function fetchItems() {
    if (!hasSupabaseEnv) return
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      setMessage(error.message)
    } else {
      setItems((data || []) as MenuItem[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) fetchItems()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) fetchItems()
      else setItems([])
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setSaving(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setSaving(false)
    if (error) setMessage(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setForm(emptyForm)
    setMessage('已登出')
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!form.name.trim()) {
      setMessage('請輸入品項名稱')
      return
    }

    const payload = {
      category: form.category.trim() || '未分類',
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price || 0),
      image_url: form.image_url.trim() || null,
      available: form.available,
      featured: form.featured,
      sort_order: Number(form.sort_order || 0)
    }

    setSaving(true)

    const result = form.id
      ? await supabase.from('menu_items').update(payload).eq('id', form.id)
      : await supabase.from('menu_items').insert(payload)

    setSaving(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setForm(emptyForm)
    setMessage(form.id ? '已更新品項' : '已新增品項')
    fetchItems()
  }

  async function handleDelete(item: MenuItem) {
    const confirmed = window.confirm(`確定要刪除「${item.name}」嗎？`)
    if (!confirmed) return

    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) setMessage(error.message)
    else {
      setMessage('已刪除品項')
      fetchItems()
      if (form.id === item.id) setForm(emptyForm)
    }
  }

  async function toggleAvailable(item: MenuItem) {
    const { error } = await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id)
    if (error) setMessage(error.message)
    else fetchItems()
  }

  if (!hasSupabaseEnv) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="max-w-xl rounded-[2rem] border border-amber-300 bg-amber-50 p-8 text-amber-950 shadow-soft">
          <h1 className="text-2xl font-semibold">尚未完成環境變數設定</h1>
          <p className="mt-4 leading-7">請先複製 .env.example 成 .env.local，填入 Supabase URL 與 Anon Key。部署到 Vercel 時，也要在 Project Settings → Environment Variables 填入同樣的值。</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft backdrop-blur">
          <p className="mb-3 text-xs uppercase tracking-[0.36em] text-black/40">Menu OS Admin</p>
          <h1 className="font-serif text-4xl">管理員登入</h1>
          <p className="mt-3 text-sm leading-7 text-black/55">請使用你在 Supabase Authentication 建立的管理員帳號登入。</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-black/60">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/40"
                placeholder="admin@example.com"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-black/60">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/40"
                placeholder="••••••••"
                required
              />
            </label>
            {message && <p className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-black/65">{message}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-black px-4 py-3 font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
            >
              {saving ? '登入中...' : '登入後台'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.36em] text-black/40">Menu OS Admin</p>
            <h1 className="font-serif text-4xl md:text-5xl">菜單管理後台</h1>
            <p className="mt-3 text-sm text-black/55">新增、修改、下架菜單後，前台首頁會自動套用最新內容。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" target="_blank" className="rounded-full border border-black/10 px-5 py-3 text-sm transition hover:bg-white">查看前台</a>
            <button onClick={handleLogout} className="rounded-full bg-black px-5 py-3 text-sm text-white transition hover:bg-black/80">登出</button>
          </div>
        </header>

        {message && <div className="mb-6 rounded-3xl border border-black/10 bg-white/75 px-5 py-4 text-sm text-black/65 shadow-soft">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{form.id ? '編輯品項' : '新增品項'}</h2>
              {form.id && (
                <button onClick={() => setForm(emptyForm)} className="text-sm text-black/45 underline-offset-4 hover:text-black hover:underline">取消編輯</button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-black/60">分類</span>
                <input
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  list="category-options"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                  placeholder="例如：咖啡、甜點、主餐"
                  required
                />
                <datalist id="category-options">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-black/60">品項名稱</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                  placeholder="例如：炙燒明太子義大利麵"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-black/60">描述</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                  placeholder="可留空，例如：自製醬汁、季節蔬菜、微辣"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-black/60">價格</span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) => updateField('price', event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                    placeholder="180"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-black/60">排序</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => updateField('sort_order', event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                    placeholder="0"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-black/60">圖片網址，可留空</span>
                <input
                  value={form.image_url}
                  onChange={(event) => updateField('image_url', event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black/40"
                  placeholder="https://..."
                />
              </label>

              <div className="grid gap-3 rounded-3xl bg-black/5 p-4">
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>前台顯示</span>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(event) => updateField('available', event.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>設為推薦品項</span>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateField('featured', event.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-black px-5 py-3 font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {saving ? '儲存中...' : form.id ? '儲存修改' : '新增品項'}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">目前菜單</h2>
              <span className="rounded-full bg-black/5 px-3 py-1 text-sm text-black/45">{items.length} items</span>
            </div>

            {loading ? (
              <p className="rounded-3xl bg-black/5 p-6 text-center text-sm text-black/50">載入中...</p>
            ) : items.length === 0 ? (
              <p className="rounded-3xl bg-black/5 p-6 text-center text-sm text-black/50">目前沒有品項，先從左側新增。</p>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-black/10">
                <div className="hidden grid-cols-[80px_1fr_110px_90px_170px] bg-black px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/55 md:grid">
                  <span>排序</span>
                  <span>品項</span>
                  <span>價格</span>
                  <span>狀態</span>
                  <span className="text-right">操作</span>
                </div>
                <div className="divide-y divide-black/10">
                  {items.map((item) => (
                    <article key={item.id} className="grid gap-4 bg-white px-4 py-4 md:grid-cols-[80px_1fr_110px_90px_170px] md:items-center">
                      <div className="text-sm text-black/45">#{item.sort_order}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-black/50">{item.category}</span>
                          {item.featured && <span className="rounded-full bg-black px-2.5 py-1 text-xs text-white">推薦</span>}
                        </div>
                        <h3 className="mt-2 font-medium">{item.name}</h3>
                        {item.description && <p className="mt-1 text-sm leading-6 text-black/50">{item.description}</p>}
                      </div>
                      <div className="font-semibold">{formatPrice(item.price)}</div>
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={item.available ? 'rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800' : 'rounded-full bg-stone-200 px-3 py-1 text-sm text-stone-600'}
                      >
                        {item.available ? '上架' : '下架'}
                      </button>
                      <div className="flex gap-2 md:justify-end">
                        <button onClick={() => setForm(toFormState(item))} className="rounded-full border border-black/10 px-4 py-2 text-sm transition hover:bg-black hover:text-white">編輯</button>
                        <button onClick={() => handleDelete(item)} className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50">刪除</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
