'use client'

import { useMemo, useState } from 'react'
import type { MenuItem } from '@/lib/supabase'

type GroupedMenu = Record<string, MenuItem[]>

type MenuBrowserProps = {
  items: MenuItem[]
}

type CategoryMeta = {
  eyebrow?: string
  title: string
  english?: string
  note?: string
  subnote?: string
}

const ALL_CATEGORY = '全部'

const CATEGORY_ORDER = [
  '黑咖啡',
  '牛奶咖啡',
  '特調咖啡',
  '手沖咖啡',
  '不想喝咖啡',
  '茶飲',
  '氣泡飲',
  '義大利麵',
  '飯食',
  '套餐',
  '想吃點甜',
  '來點點心'
]

const CATEGORY_META: Record<string, CategoryMeta> = {
  黑咖啡: {
    title: '黑咖啡',
    english: 'Black Coffee',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定'
  },
  牛奶咖啡: {
    eyebrow: '加點料',
    title: '牛奶咖啡',
    english: 'Milk Coffee',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定',
    subnote: '風味拿鐵：桂花 / 海鹽 / 焦糖 / 香草 / 黑糖'
  },
  特調咖啡: {
    title: '特調咖啡',
    english: 'Signature Coffee',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定'
  },
  手沖咖啡: {
    title: '手沖咖啡',
    english: 'Pour Over Coffee',
    note: '160$｜單品風味依現場供應為主'
  },
  不想喝咖啡: {
    title: '不想喝咖啡',
    english: 'Non-Coffee Drinks',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定'
  },
  茶飲: {
    title: '茶飲',
    english: 'Tea',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定'
  },
  氣泡飲: {
    title: '氣泡飲',
    english: 'Sparkling Drinks',
    note: '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定'
  },
  義大利麵: {
    eyebrow: '想吃點鹹',
    title: '義大利麵',
    english: 'Pasta',
    note: '供餐時間：最後加點 22:30 前',
    subnote: '口味調整請洽櫃檯 / Please speak to our staff for flavor adjustments.'
  },
  飯食: {
    eyebrow: '想吃點鹹',
    title: '燒肉飯',
    english: 'Rice',
    note: '供餐時間：最後加點 22:30 前',
    subnote: '口味調整請洽櫃檯 / Please speak to our staff for flavor adjustments.'
  },
  套餐: {
    title: '套餐',
    english: 'Set Menu',
    note: '點主餐可加購任一套餐',
    subnote: '以上套餐可補差額更換'
  },
  想吃點甜: {
    title: '想吃點甜',
    english: 'Desserts',
    note: '招牌人氣甜點：離域蘋果派'
  },
  來點點心: {
    title: '來點點心',
    english: 'Snacks & Savory Pie'
  }
}

const SECTION_GROUPS = [
  {
    label: '想喝點咖啡',
    english: 'Coffee',
    categories: ['黑咖啡', '牛奶咖啡', '特調咖啡', '手沖咖啡']
  },
  {
    label: '不想喝咖啡',
    english: 'Non-Coffee',
    categories: ['不想喝咖啡', '茶飲', '氣泡飲']
  },
  {
    label: '想吃點鹹',
    english: 'Savory',
    categories: ['義大利麵', '飯食', '套餐']
  },
  {
    label: '想吃點甜',
    english: 'Desserts & Snacks',
    categories: ['想吃點甜', '來點點心']
  }
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

function groupByCategory(items: MenuItem[]) {
  return items.reduce<GroupedMenu>((acc, item) => {
    const category = item.category || '未分類'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})
}

function sortCategories(categories: string[]) {
  return [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a)
    const bIndex = CATEGORY_ORDER.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b, 'zh-Hant')
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

function cleanRegularDescription(description: string | null, category: string) {
  if (!description) return ''

  if (category === '手沖咖啡') return description

  return description
    .replace(/。?飲品可少冰，無提供去冰服務，甜度固定/g, '')
    .replace(/供餐最後加點 22:30 前。口味調整請洽櫃檯/g, '')
    .replace(/^\s*\/\s*/g, '')
    .replace(/\s*\/\s*$/g, '')
    .trim()
}

function HandBrewDescription({ description }: { description: string | null }) {
  if (!description) return null

  const [zhPart, ...enParts] = description.split(' / ')
  const zhTokens = zhPart.split('｜').map((part) => part.trim()).filter(Boolean)
  const zhMeta = zhTokens.slice(0, 3).join('｜')
  const zhFlavors = zhTokens.slice(3).join('、')
  const enText = enParts.join(' / ')
  const enTokens = enText.split(' / ').map((part) => part.trim()).filter(Boolean)
  const enMeta = enTokens.slice(0, 3).join(' / ')
  const enFlavors = enTokens.slice(3).join(', ')

  return (
    <div className="mt-3 space-y-1.5 text-sm leading-6 text-black/55">
      {zhMeta && <p>{zhMeta}</p>}
      {zhFlavors && <p className="text-black/70">- {zhFlavors}</p>}
      {enMeta && <p className="pt-1 text-xs uppercase tracking-[0.08em] text-black/35">{enMeta}</p>}
      {enFlavors && <p className="text-xs leading-5 text-black/40">- {enFlavors}</p>}
    </div>
  )
}

function MenuLine({ item, category }: { item: MenuItem; category: string }) {
  const { zh, en } = splitMenuName(item.name)
  const isHandBrew = category === '手沖咖啡'
  const cleanedDescription = cleanRegularDescription(item.description, category)

  return (
    <article className="group border-b border-black/10 py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-[1.02rem] font-medium tracking-[0.03em] text-black/85">{zh}</h3>
            {item.featured && (
              <span className="rounded-full border border-black/10 px-2 py-0.5 text-[0.62rem] tracking-[0.16em] text-black/35">POPULAR</span>
            )}
          </div>
          {en && <p className="mt-0.5 text-xs leading-5 tracking-[0.08em] text-black/38">{en}</p>}
        </div>
        <p className="whitespace-nowrap font-serif text-xl text-black/80">{formatPrice(item.price)}</p>
      </div>

      {isHandBrew ? (
        <HandBrewDescription description={item.description} />
      ) : cleanedDescription ? (
        <p className="mt-2 text-sm leading-6 text-black/48">{cleanedDescription}</p>
      ) : null}
    </article>
  )
}

function CategoryPanel({ category, items }: { category: string; items: MenuItem[] }) {
  const meta = CATEGORY_META[category] || { title: category }
  const isHandBrew = category === '手沖咖啡'

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-soft backdrop-blur md:p-8">
      <div className="mb-4 border-b border-black/10 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {meta.eyebrow && <p className="mb-2 text-xs tracking-[0.32em] text-black/35">{meta.eyebrow}</p>}
            <h2 className="font-serif text-4xl leading-none tracking-tight text-black/85">{meta.title}</h2>
            {meta.english && <p className="mt-2 text-xs uppercase tracking-[0.28em] text-black/35">{meta.english}</p>}
          </div>
          <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/35">{items.length} items</span>
        </div>

        {(meta.note || meta.subnote) && (
          <div className="mt-4 space-y-1 text-sm leading-6 text-black/50">
            {meta.note && <p>{meta.note}</p>}
            {meta.subnote && <p>{meta.subnote}</p>}
          </div>
        )}
      </div>

      <div className={isHandBrew ? 'space-y-0' : 'grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}>
        {items.map((item) => (
          <MenuLine key={item.id} item={item} category={category} />
        ))}
      </div>
    </section>
  )
}

function FeaturedMenu({ items }: { items: MenuItem[] }) {
  const featuredItems = items.filter((item) => item.featured).slice(0, 3)
  if (featuredItems.length === 0) return null

  return (
    <section className="rounded-[2rem] bg-[#1f1b16] p-6 text-[#fffaf0] shadow-soft md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-white/35">Featured</p>
          <h2 className="font-serif text-3xl">推薦品項</h2>
        </div>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/45">少量精選</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {featuredItems.map((item) => {
          const { zh, en } = splitMenuName(item.name)
          return (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{zh}</h3>
                  {en && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/38">{en}</p>}
                </div>
                <p className="whitespace-nowrap font-serif text-xl">{formatPrice(item.price)}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function MenuBrowser({ items }: MenuBrowserProps) {
  const grouped = useMemo(() => groupByCategory(items), [items])
  const sortedCategories = useMemo(() => sortCategories(Object.keys(grouped)), [grouped])
  const categories = useMemo(() => [ALL_CATEGORY, ...sortedCategories], [sortedCategories])
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)

  const activeItems = activeCategory === ALL_CATEGORY ? [] : grouped[activeCategory] || []

  return (
    <>
      <FeaturedMenu items={items} />

      <nav className="sticky top-4 z-10 -mx-5 overflow-x-auto border-y border-black/10 bg-[#f7f3ea]/90 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:bg-white/75">
        <div className="flex w-max gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={
                  isActive
                    ? 'rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-sm transition'
                    : 'rounded-full border border-black/10 bg-white/70 px-5 py-2 text-sm font-medium text-black/60 transition hover:border-black/30 hover:text-black'
                }
              >
                {category}
              </button>
            )
          })}
        </div>
      </nav>

      {activeCategory !== ALL_CATEGORY ? (
        <CategoryPanel category={activeCategory} items={activeItems} />
      ) : (
        <div className="space-y-10">
          {SECTION_GROUPS.map((group) => {
            const existingCategories = group.categories.filter((category) => grouped[category]?.length)
            if (existingCategories.length === 0) return null

            return (
              <section key={group.label} className="space-y-5">
                <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-3">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.32em] text-black/35">{group.english}</p>
                    <h2 className="font-serif text-4xl text-black/80">{group.label}</h2>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {existingCategories.map((category) => (
                    <CategoryPanel key={category} category={category} items={grouped[category]} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
