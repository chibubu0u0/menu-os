'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabaseEnv, MenuCategory, MenuItem, SiteSection, supabase } from '@/lib/supabase'

type ActiveTab = 'items' | 'categories' | 'sections'

type ItemFormState = {
  id?: string
  category: string
  name: string
  description: string
  price: string
  image_url: string
  available: boolean
  featured: boolean
  sort_order: string
  label: string
  is_limited: boolean
  start_date: string
  end_date: string
}

type CategoryFormState = {
  id?: string
  originalTitle?: string
  title: string
  english: string
  eyebrow: string
  note: string
  subnote: string
  sort_order: string
  visible: boolean
  layout_style: string
  group_title: string
  group_english: string
}

type SectionFormState = {
  id?: string
  section_key: string
  title: string
  english: string
  body: string
  style: string
  visible: boolean
  sort_order: string
}

const emptyItemForm: ItemFormState = {
  category: '黑咖啡',
  name: '',
  description: '',
  price: '',
  image_url: '',
  available: true,
  featured: false,
  sort_order: '0',
  label: '',
  is_limited: false,
  start_date: '',
  end_date: ''
}

const emptyCategoryForm: CategoryFormState = {
  title: '',
  english: '',
  eyebrow: '',
  note: '',
  subnote: '',
  sort_order: '0',
  visible: true,
  layout_style: 'list',
  group_title: '',
  group_english: ''
}

const emptySectionForm: SectionFormState = {
  section_key: '',
  title: '',
  english: '',
  body: '',
  style: 'text',
  visible: true,
  sort_order: '0'
}

const layoutOptions = [
  { value: 'list', label: '標準列表' },
  { value: 'flavor', label: '手沖 / 風味描述' },
  { value: 'card', label: '單欄卡片' }
]

const sectionStyleOptions = [
  { value: 'text', label: '文字區塊' },
  { value: 'opening', label: '營業時間' },
  { value: 'rules', label: '規章清單' },
  { value: 'notice', label: '深色公告 / 期間限定' },
  { value: 'hero', label: '首頁主視覺' }
]

function formatPrice(price: number | string) {
  const value = Number(price)
  if (Number.isNaN(value)) return `${price}$`
  return `${value.toLocaleString('zh-TW')}$`
}

function splitMenuName(name: string) {
  const [zh, ...rest] = name.split(/[｜|]/).map((part) => part.trim())
  return {
    zh: zh || name,
    en: rest.join(' | ')
  }
}

function toItemForm(item: MenuItem): ItemFormState {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description || '',
    price: String(item.price ?? ''),
    image_url: item.image_url || '',
    available: item.available,
    featured: item.featured,
    sort_order: String(item.sort_order ?? 0),
    label: item.label || '',
    is_limited: item.is_limited || false,
    start_date: item.start_date || '',
    end_date: item.end_date || ''
  }
}

function toCategoryForm(category: MenuCategory): CategoryFormState {
  return {
    id: category.id,
    originalTitle: category.title,
    title: category.title,
    english: category.english || '',
    eyebrow: category.eyebrow || '',
    note: category.note || '',
    subnote: category.subnote || '',
    sort_order: String(category.sort_order ?? 0),
    visible: category.visible,
    layout_style: category.layout_style || 'list',
    group_title: category.group_title || '',
    group_english: category.group_english || ''
  }
}

function toSectionForm(section: SiteSection): SectionFormState {
  return {
    id: section.id,
    section_key: section.section_key,
    title: section.title,
    english: section.english || '',
    body: section.body || '',
    style: section.style || 'text',
    visible: section.visible,
    sort_order: String(section.sort_order ?? 0)
  }
}

function getNextSortOrder(values: Array<{ sort_order: number }>, step = 10) {
  if (values.length === 0) return step
  return Math.max(...values.map((value) => value.sort_order || 0)) + step
}

function createSectionKey(title: string) {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return clean || `section-${Date.now()}`
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm text-black/60">{children}</span>
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/40 ${props.className || ''}`} />
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-28 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 leading-7 outline-none transition focus:border-black/40 ${props.className || ''}`} />
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black/40 ${props.className || ''}`} />
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-black" />
      {label}
    </label>
  )
}

function PreviewItem({ item, category }: { item: ItemFormState; category?: MenuCategory }) {
  const { zh, en } = splitMenuName(item.name || '品項名稱｜English Name')
  const label = item.label || (item.is_limited ? 'LIMITED' : item.featured ? 'POPULAR' : '')

  return (
    <div className="rounded-[2rem] border border-black/10 bg-[#fbfaf7] p-5 shadow-soft">
      <div className="mb-4 border-b border-black/10 pb-4">
        <p className="mb-2 text-xs tracking-[0.28em] text-black/35">前台預覽</p>
        <h3 className="font-serif text-3xl text-black/85">{category?.title || item.category || '系列分類'}</h3>
        {category?.english && <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/35">{category.english}</p>}
      </div>
      <article className="border-b border-black/10 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4 className="text-[1.02rem] font-medium tracking-[0.03em] text-black/85">{zh}</h4>
              {label && <span className="rounded-full border border-black/10 px-2 py-0.5 text-[0.62rem] tracking-[0.16em] text-black/35">{label}</span>}
            </div>
            {en && <p className="mt-0.5 text-xs leading-5 tracking-[0.08em] text-black/38">{en}</p>}
          </div>
          <p className="whitespace-nowrap font-serif text-xl text-black/80">{formatPrice(item.price || 0)}</p>
        </div>
        {item.description && <p className="mt-3 text-sm leading-6 text-black/48">{item.description}</p>}
      </article>
      {item.is_limited && (
        <p className="mt-4 text-xs leading-5 text-black/40">
          期間：{item.start_date || '未設定開始'} ～ {item.end_date || '未設定結束'}
        </p>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [sections, setSections] = useState<SiteSection[]>([])
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [sectionForm, setSectionForm] = useState<SectionFormState>(emptySectionForm)
  const [activeTab, setActiveTab] = useState<ActiveTab>('items')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [categories])
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.title, category])), [categories])
  const currentItemCategory = categoryMap.get(itemForm.category)

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = activeCategory === '全部' || item.category === activeCategory
      const matchesKeyword = !keyword || [item.name, item.description || '', item.category, item.label || ''].join(' ').toLowerCase().includes(keyword)
      return matchesCategory && matchesKeyword
    })
  }, [items, activeCategory, searchTerm])

  const counts = useMemo(() => ({
    total: items.length,
    available: items.filter((item) => item.available).length,
    hidden: items.filter((item) => !item.available).length,
    featured: items.filter((item) => item.featured).length,
    limited: items.filter((item) => item.is_limited).length,
    categories: categories.length,
    sections: sections.length
  }), [items, categories, sections])

  async function fetchAll() {
    if (!hasSupabaseEnv) return
    setLoading(true)
    const [itemsResult, categoriesResult, sectionsResult] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('menu_categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('site_sections').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    ])

    if (itemsResult.error) setMessage(itemsResult.error.message)
    else setItems((itemsResult.data || []) as MenuItem[])

    if (categoriesResult.error) setMessage(categoriesResult.error.message)
    else setCategories((categoriesResult.data || []) as MenuCategory[])

    if (sectionsResult.error) setMessage(sectionsResult.error.message)
    else setSections((sectionsResult.data || []) as SiteSection[])

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
      if (data.session) fetchAll()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) fetchAll()
      else {
        setItems([])
        setCategories([])
        setSections([])
      }
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
    setMessage('已登出')
  }

  function startCreateItem(category?: string) {
    const nextCategory = category || (activeCategory === '全部' ? sortedCategories[0]?.title || '黑咖啡' : activeCategory)
    const nextSort = getNextSortOrder(items.filter((item) => item.category === nextCategory))
    setItemForm({ ...emptyItemForm, category: nextCategory, sort_order: String(nextSort) })
    setActiveTab('items')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startCreateCategory() {
    setCategoryForm({ ...emptyCategoryForm, sort_order: String(getNextSortOrder(categories)) })
    setActiveTab('categories')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startCreateSection() {
    setSectionForm({ ...emptySectionForm, sort_order: String(getNextSortOrder(sections)), section_key: createSectionKey('新區塊') })
    setActiveTab('sections')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!itemForm.name.trim()) {
      setMessage('請輸入品項名稱')
      return
    }

    if (!itemForm.category.trim()) {
      setMessage('請選擇系列分類')
      return
    }

    const payload = {
      category: itemForm.category.trim(),
      name: itemForm.name.trim(),
      description: itemForm.description.trim() || null,
      price: Number(itemForm.price || 0),
      image_url: itemForm.image_url.trim() || null,
      available: itemForm.available,
      featured: itemForm.featured,
      sort_order: Number(itemForm.sort_order || 0),
      label: itemForm.label.trim() || null,
      is_limited: itemForm.is_limited,
      start_date: itemForm.is_limited && itemForm.start_date ? itemForm.start_date : null,
      end_date: itemForm.is_limited && itemForm.end_date ? itemForm.end_date : null
    }

    setSaving(true)
    const result = itemForm.id
      ? await supabase.from('menu_items').update(payload).eq('id', itemForm.id)
      : await supabase.from('menu_items').insert(payload)
    setSaving(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(itemForm.id ? '已更新品項，前台會同步更新' : '已新增品項，前台會同步更新')
    setActiveCategory(payload.category)
    setItemForm({ ...emptyItemForm, category: payload.category, sort_order: String(getNextSortOrder(items.filter((item) => item.category === payload.category))) })
    fetchAll()
  }

  async function handleSaveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!categoryForm.title.trim()) {
      setMessage('請輸入系列名稱')
      return
    }

    const payload = {
      title: categoryForm.title.trim(),
      english: categoryForm.english.trim() || null,
      eyebrow: categoryForm.eyebrow.trim() || null,
      note: categoryForm.note.trim() || null,
      subnote: categoryForm.subnote.trim() || null,
      sort_order: Number(categoryForm.sort_order || 0),
      visible: categoryForm.visible,
      layout_style: categoryForm.layout_style,
      group_title: categoryForm.group_title.trim() || null,
      group_english: categoryForm.group_english.trim() || null
    }

    setSaving(true)
    const result = categoryForm.id
      ? await supabase.from('menu_categories').update(payload).eq('id', categoryForm.id)
      : await supabase.from('menu_categories').insert(payload)

    if (!result.error && categoryForm.id && categoryForm.originalTitle && categoryForm.originalTitle !== payload.title) {
      await supabase.from('menu_items').update({ category: payload.title }).eq('category', categoryForm.originalTitle)
    }

    setSaving(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(categoryForm.id ? '已更新系列，前台分類會同步更新' : '已新增系列，可以在品項管理中使用')
    setCategoryForm({ ...emptyCategoryForm, sort_order: String(getNextSortOrder(categories)) })
    fetchAll()
  }

  async function handleSaveSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!sectionForm.title.trim()) {
      setMessage('請輸入區塊標題')
      return
    }

    const payload = {
      section_key: sectionForm.section_key.trim() || createSectionKey(sectionForm.title),
      title: sectionForm.title.trim(),
      english: sectionForm.english.trim() || null,
      body: sectionForm.body.trim() || null,
      style: sectionForm.style,
      visible: sectionForm.visible,
      sort_order: Number(sectionForm.sort_order || 0)
    }

    setSaving(true)
    const result = sectionForm.id
      ? await supabase.from('site_sections').update(payload).eq('id', sectionForm.id)
      : await supabase.from('site_sections').insert(payload)
    setSaving(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(sectionForm.id ? '已更新前台區塊' : '已新增前台區塊')
    setSectionForm({ ...emptySectionForm, sort_order: String(getNextSortOrder(sections)), section_key: createSectionKey('新區塊') })
    fetchAll()
  }

  async function deleteItem(item: MenuItem) {
    if (!window.confirm(`確定要刪除「${item.name}」嗎？`)) return
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) setMessage(error.message)
    else {
      setMessage('已刪除品項')
      fetchAll()
    }
  }

  async function deleteCategory(category: MenuCategory) {
    const usedCount = items.filter((item) => item.category === category.title).length
    if (usedCount > 0) {
      setMessage(`「${category.title}」底下還有 ${usedCount} 個品項，請先移動或刪除品項再刪除系列。`)
      return
    }
    if (!window.confirm(`確定要刪除系列「${category.title}」嗎？`)) return
    const { error } = await supabase.from('menu_categories').delete().eq('id', category.id)
    if (error) setMessage(error.message)
    else {
      setMessage('已刪除系列')
      fetchAll()
    }
  }

  async function deleteSection(section: SiteSection) {
    if (!window.confirm(`確定要刪除區塊「${section.title}」嗎？`)) return
    const { error } = await supabase.from('site_sections').delete().eq('id', section.id)
    if (error) setMessage(error.message)
    else {
      setMessage('已刪除區塊')
      fetchAll()
    }
  }

  async function quickUpdateItem(item: MenuItem, payload: Partial<MenuItem>) {
    const { error } = await supabase.from('menu_items').update(payload).eq('id', item.id)
    if (error) setMessage(error.message)
    else fetchAll()
  }

  async function quickUpdateCategory(category: MenuCategory, payload: Partial<MenuCategory>) {
    const { error } = await supabase.from('menu_categories').update(payload).eq('id', category.id)
    if (error) setMessage(error.message)
    else fetchAll()
  }

  async function quickUpdateSection(section: SiteSection, payload: Partial<SiteSection>) {
    const { error } = await supabase.from('site_sections').update(payload).eq('id', section.id)
    if (error) setMessage(error.message)
    else fetchAll()
  }

  if (!hasSupabaseEnv) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="max-w-xl rounded-[2rem] border border-amber-300 bg-amber-50 p-8 text-amber-950 shadow-soft">
          <h1 className="text-2xl font-semibold">尚未完成環境變數設定</h1>
          <p className="mt-4 leading-7">請先在 Vercel Project Settings → Environment Variables 填入 Supabase URL 與 Publishable Key。</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-soft backdrop-blur">
          <p className="mb-3 text-xs uppercase tracking-[0.36em] text-black/40">Li-Yu Menu OS</p>
          <h1 className="font-serif text-4xl">離域後台登入</h1>
          <p className="mt-3 text-sm leading-7 text-black/55">請使用你在 Supabase Authentication 建立的管理員帳號登入。</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <FieldLabel>Email</FieldLabel>
              <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />
            </label>
            <label className="block">
              <FieldLabel>Password</FieldLabel>
              <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
            </label>
            {message && <p className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-black/60">{message}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50">
              {saving ? '登入中...' : '登入後台'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.36em] text-black/35">CMS 2.0</p>
              <h1 className="font-serif text-5xl leading-none text-black/85">離域菜單後台</h1>
              <p className="mt-3 text-sm leading-7 text-black/55">可以管理品項、系列分類、期間限定與前台區塊。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/" target="_blank" className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm text-black/60 transition hover:border-black/30">預覽前台</a>
              <button type="button" onClick={fetchAll} className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm text-black/60 transition hover:border-black/30">重新整理</button>
              <button type="button" onClick={handleLogout} className="rounded-full bg-black px-5 py-2 text-sm text-white transition hover:bg-black/80">登出</button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {[
            ['全部品項', counts.total],
            ['上架', counts.available],
            ['下架', counts.hidden],
            ['推薦', counts.featured],
            ['期間限定', counts.limited],
            ['系列', counts.categories],
            ['前台區塊', counts.sections]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-soft">
              <p className="text-xs tracking-[0.24em] text-black/35">{label}</p>
              <p className="mt-2 font-serif text-3xl text-black/80">{value}</p>
            </div>
          ))}
        </section>

        <nav className="flex flex-wrap gap-2 rounded-[2rem] border border-black/10 bg-white/70 p-2 shadow-soft">
          {[
            ['items', '菜單品項'],
            ['categories', '系列分類'],
            ['sections', '前台區塊']
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as ActiveTab)}
              className={activeTab === tab ? 'rounded-full bg-black px-5 py-2 text-sm text-white' : 'rounded-full px-5 py-2 text-sm text-black/55 transition hover:bg-black/5'}
            >
              {label}
            </button>
          ))}
        </nav>

        {message && <div className="rounded-3xl border border-black/10 bg-white/80 px-5 py-4 text-sm text-black/60 shadow-soft">{message}</div>}

        {activeTab === 'items' && (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <form onSubmit={handleSaveItem} className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Menu Item</p>
                    <h2 className="font-serif text-4xl text-black/85">{itemForm.id ? '編輯品項' : '新增品項'}</h2>
                  </div>
                  <button type="button" onClick={() => startCreateItem()} className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/50">清空</button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <FieldLabel>系列 / Category</FieldLabel>
                    <SelectInput value={itemForm.category} onChange={(event) => setItemForm((current) => ({ ...current, category: event.target.value, sort_order: String(getNextSortOrder(items.filter((item) => item.category === event.target.value))) }))}>
                      {sortedCategories.map((category) => <option key={category.id} value={category.title}>{category.title}</option>)}
                    </SelectInput>
                  </label>
                  <label className="block">
                    <FieldLabel>價格</FieldLabel>
                    <TextInput type="number" value={itemForm.price} onChange={(event) => setItemForm((current) => ({ ...current, price: event.target.value }))} placeholder="150" />
                  </label>
                  <label className="block md:col-span-2">
                    <FieldLabel>品項名稱，中英文可用 ｜ 分隔</FieldLabel>
                    <TextInput value={itemForm.name} onChange={(event) => setItemForm((current) => ({ ...current, name: event.target.value }))} placeholder="林檎美式｜Apple Coffee" />
                  </label>
                  <label className="block md:col-span-2">
                    <FieldLabel>描述 / 風味 / 備註</FieldLabel>
                    <TextArea value={itemForm.description} onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))} placeholder="咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定" />
                  </label>
                  <label className="block">
                    <FieldLabel>標籤文字</FieldLabel>
                    <TextInput value={itemForm.label} onChange={(event) => setItemForm((current) => ({ ...current, label: event.target.value }))} placeholder="季節限定 / NEW / 店長推薦" />
                  </label>
                  <label className="block">
                    <FieldLabel>排序</FieldLabel>
                    <TextInput type="number" value={itemForm.sort_order} onChange={(event) => setItemForm((current) => ({ ...current, sort_order: event.target.value }))} />
                  </label>
                  <label className="block md:col-span-2">
                    <FieldLabel>圖片網址（可留空）</FieldLabel>
                    <TextInput value={itemForm.image_url} onChange={(event) => setItemForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="https://..." />
                  </label>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Toggle checked={itemForm.available} onChange={(value) => setItemForm((current) => ({ ...current, available: value }))} label="前台顯示" />
                  <Toggle checked={itemForm.featured} onChange={(value) => setItemForm((current) => ({ ...current, featured: value }))} label="推薦品項" />
                  <Toggle checked={itemForm.is_limited} onChange={(value) => setItemForm((current) => ({ ...current, is_limited: value, label: value && !current.label ? 'LIMITED' : current.label }))} label="期間限定" />
                </div>

                {itemForm.is_limited && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <FieldLabel>開始日期</FieldLabel>
                      <TextInput type="date" value={itemForm.start_date} onChange={(event) => setItemForm((current) => ({ ...current, start_date: event.target.value }))} />
                    </label>
                    <label className="block">
                      <FieldLabel>結束日期</FieldLabel>
                      <TextInput type="date" value={itemForm.end_date} onChange={(event) => setItemForm((current) => ({ ...current, end_date: event.target.value }))} />
                    </label>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="submit" disabled={saving} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50">
                    {saving ? '儲存中...' : itemForm.id ? '更新品項' : '新增品項'}
                  </button>
                  {itemForm.id && <button type="button" onClick={() => setItemForm(emptyItemForm)} className="rounded-full border border-black/10 px-6 py-3 text-sm text-black/55">取消編輯</button>}
                </div>
              </form>

              <PreviewItem item={itemForm} category={currentItemCategory} />
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
              <div className="mb-5 flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Items</p>
                  <h2 className="font-serif text-4xl text-black/85">品項列表</h2>
                </div>
                <button type="button" onClick={() => startCreateItem()} className="rounded-full bg-black px-5 py-2 text-sm text-white">新增</button>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
                <SelectInput value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
                  <option value="全部">全部系列</option>
                  {sortedCategories.map((category) => <option key={category.id} value={category.title}>{category.title}</option>)}
                </SelectInput>
                <TextInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="搜尋品項 / 描述 / 標籤" />
              </div>

              <div className="space-y-3">
                {loading && <p className="text-sm text-black/45">讀取中...</p>}
                {!loading && filteredItems.length === 0 && <p className="rounded-3xl bg-black/5 p-5 text-sm text-black/45">目前沒有符合條件的品項。</p>}
                {filteredItems.map((item) => {
                  const { zh, en } = splitMenuName(item.name)
                  return (
                    <article key={item.id} className="rounded-3xl border border-black/10 bg-[#fbfaf7] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-black/80">{zh}</h3>
                            {!item.available && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[0.65rem] text-stone-600">下架</span>}
                            {item.featured && <span className="rounded-full bg-black px-2 py-0.5 text-[0.65rem] text-white">推薦</span>}
                            {item.is_limited && <span className="rounded-full border border-black/10 px-2 py-0.5 text-[0.65rem] text-black/45">期間限定</span>}
                          </div>
                          {en && <p className="mt-1 text-xs tracking-[0.1em] text-black/35">{en}</p>}
                          <p className="mt-2 text-xs text-black/40">{item.category} · {formatPrice(item.price)} · 排序 {item.sort_order}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                          <button type="button" onClick={() => quickUpdateItem(item, { available: !item.available })} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{item.available ? '下架' : '上架'}</button>
                          <button type="button" onClick={() => quickUpdateItem(item, { featured: !item.featured })} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{item.featured ? '取消推薦' : '推薦'}</button>
                          <button type="button" onClick={() => setItemForm(toItemForm(item))} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">編輯</button>
                          <button type="button" onClick={() => deleteItem(item)} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500">刪除</button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'categories' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSaveCategory} className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Series</p>
                  <h2 className="font-serif text-4xl text-black/85">{categoryForm.id ? '編輯系列' : '新增系列'}</h2>
                  <p className="mt-3 text-sm leading-7 text-black/50">系列會變成前台分類按鈕，也可以當作「春季限定」「隱藏菜單」使用。</p>
                </div>
                <button type="button" onClick={startCreateCategory} className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/50">清空</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>系列名稱</FieldLabel>
                  <TextInput value={categoryForm.title} onChange={(event) => setCategoryForm((current) => ({ ...current, title: event.target.value }))} placeholder="春季限定" />
                </label>
                <label className="block">
                  <FieldLabel>英文名稱</FieldLabel>
                  <TextInput value={categoryForm.english} onChange={(event) => setCategoryForm((current) => ({ ...current, english: event.target.value }))} placeholder="Spring Limited" />
                </label>
                <label className="block">
                  <FieldLabel>上方小字 / Eyebrow</FieldLabel>
                  <TextInput value={categoryForm.eyebrow} onChange={(event) => setCategoryForm((current) => ({ ...current, eyebrow: event.target.value }))} placeholder="Seasonal" />
                </label>
                <label className="block">
                  <FieldLabel>版面樣式</FieldLabel>
                  <SelectInput value={categoryForm.layout_style} onChange={(event) => setCategoryForm((current) => ({ ...current, layout_style: event.target.value }))}>
                    {layoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectInput>
                </label>
                <label className="block">
                  <FieldLabel>群組標題</FieldLabel>
                  <TextInput value={categoryForm.group_title} onChange={(event) => setCategoryForm((current) => ({ ...current, group_title: event.target.value }))} placeholder="想喝點咖啡 / 期間限定" />
                </label>
                <label className="block">
                  <FieldLabel>群組英文</FieldLabel>
                  <TextInput value={categoryForm.group_english} onChange={(event) => setCategoryForm((current) => ({ ...current, group_english: event.target.value }))} placeholder="Coffee / Limited" />
                </label>
                <label className="block md:col-span-2">
                  <FieldLabel>分類說明</FieldLabel>
                  <TextArea value={categoryForm.note} onChange={(event) => setCategoryForm((current) => ({ ...current, note: event.target.value }))} placeholder="咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定" />
                </label>
                <label className="block md:col-span-2">
                  <FieldLabel>補充說明</FieldLabel>
                  <TextArea value={categoryForm.subnote} onChange={(event) => setCategoryForm((current) => ({ ...current, subnote: event.target.value }))} placeholder="以上套餐可補差額更換" />
                </label>
                <label className="block">
                  <FieldLabel>排序</FieldLabel>
                  <TextInput type="number" value={categoryForm.sort_order} onChange={(event) => setCategoryForm((current) => ({ ...current, sort_order: event.target.value }))} />
                </label>
                <Toggle checked={categoryForm.visible} onChange={(value) => setCategoryForm((current) => ({ ...current, visible: value }))} label="前台顯示此系列" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50">
                  {saving ? '儲存中...' : categoryForm.id ? '更新系列' : '新增系列'}
                </button>
              </div>
            </form>

            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Categories</p>
                  <h2 className="font-serif text-4xl text-black/85">系列列表</h2>
                </div>
                <button type="button" onClick={startCreateCategory} className="rounded-full bg-black px-5 py-2 text-sm text-white">新增系列</button>
              </div>
              <div className="space-y-3">
                {sortedCategories.map((category) => {
                  const usedCount = items.filter((item) => item.category === category.title).length
                  return (
                    <article key={category.id} className="rounded-3xl border border-black/10 bg-[#fbfaf7] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-2xl text-black/80">{category.title}</h3>
                            {!category.visible && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[0.65rem] text-stone-600">隱藏</span>}
                            <span className="rounded-full border border-black/10 px-2 py-0.5 text-[0.65rem] text-black/45">{usedCount} items</span>
                          </div>
                          {category.english && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/35">{category.english}</p>}
                          <p className="mt-2 text-xs text-black/40">{category.group_title || '未分群'} · {layoutOptions.find((option) => option.value === category.layout_style)?.label || category.layout_style} · 排序 {category.sort_order}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                          <button type="button" onClick={() => quickUpdateCategory(category, { visible: !category.visible })} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{category.visible ? '隱藏' : '顯示'}</button>
                          <button type="button" onClick={() => startCreateItem(category.title)} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">新增品項</button>
                          <button type="button" onClick={() => setCategoryForm(toCategoryForm(category))} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">編輯</button>
                          <button type="button" onClick={() => deleteCategory(category)} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500">刪除</button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'sections' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSaveSection} className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Front Page</p>
                  <h2 className="font-serif text-4xl text-black/85">{sectionForm.id ? '編輯區塊' : '新增區塊'}</h2>
                  <p className="mt-3 text-sm leading-7 text-black/50">可以新增公告、期間限定說明、規章、營業時間，也可以控制前台區塊順序。</p>
                </div>
                <button type="button" onClick={startCreateSection} className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/50">清空</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>區塊代號</FieldLabel>
                  <TextInput value={sectionForm.section_key} onChange={(event) => setSectionForm((current) => ({ ...current, section_key: event.target.value }))} placeholder="spring_notice" />
                </label>
                <label className="block">
                  <FieldLabel>區塊樣式</FieldLabel>
                  <SelectInput value={sectionForm.style} onChange={(event) => setSectionForm((current) => ({ ...current, style: event.target.value }))}>
                    {sectionStyleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </SelectInput>
                </label>
                <label className="block">
                  <FieldLabel>標題</FieldLabel>
                  <TextInput value={sectionForm.title} onChange={(event) => setSectionForm((current) => ({ ...current, title: event.target.value, section_key: current.section_key || createSectionKey(event.target.value) }))} placeholder="期間限定" />
                </label>
                <label className="block">
                  <FieldLabel>英文 / 小字</FieldLabel>
                  <TextInput value={sectionForm.english} onChange={(event) => setSectionForm((current) => ({ ...current, english: event.target.value }))} placeholder="Limited Items" />
                </label>
                <label className="block md:col-span-2">
                  <FieldLabel>內容，每一行會成為一段或一條規章</FieldLabel>
                  <TextArea value={sectionForm.body} onChange={(event) => setSectionForm((current) => ({ ...current, body: event.target.value }))} placeholder={'每人低消兩百五十元，不合併計算\n目前僅提供現金結帳'} className="min-h-44" />
                </label>
                <label className="block">
                  <FieldLabel>排序</FieldLabel>
                  <TextInput type="number" value={sectionForm.sort_order} onChange={(event) => setSectionForm((current) => ({ ...current, sort_order: event.target.value }))} />
                </label>
                <Toggle checked={sectionForm.visible} onChange={(value) => setSectionForm((current) => ({ ...current, visible: value }))} label="前台顯示此區塊" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50">
                  {saving ? '儲存中...' : sectionForm.id ? '更新區塊' : '新增區塊'}
                </button>
              </div>
            </form>

            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft md:p-8">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/35">Sections</p>
                  <h2 className="font-serif text-4xl text-black/85">前台區塊</h2>
                </div>
                <button type="button" onClick={startCreateSection} className="rounded-full bg-black px-5 py-2 text-sm text-white">新增區塊</button>
              </div>
              <div className="space-y-3">
                {sections.map((section) => (
                  <article key={section.id} className="rounded-3xl border border-black/10 bg-[#fbfaf7] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-2xl text-black/80">{section.title}</h3>
                          {!section.visible && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[0.65rem] text-stone-600">隱藏</span>}
                        </div>
                        {section.english && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/35">{section.english}</p>}
                        <p className="mt-2 text-xs text-black/40">{section.section_key} · {sectionStyleOptions.find((option) => option.value === section.style)?.label || section.style} · 排序 {section.sort_order}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => quickUpdateSection(section, { visible: !section.visible })} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">{section.visible ? '隱藏' : '顯示'}</button>
                        <button type="button" onClick={() => setSectionForm(toSectionForm(section))} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">編輯</button>
                        <button type="button" onClick={() => deleteSection(section)} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500">刪除</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
