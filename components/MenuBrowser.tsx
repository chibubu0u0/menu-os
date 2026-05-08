'use client'

import { useMemo, useState } from 'react'
import type { MenuCategory, MenuItem } from '@/lib/supabase'

type GroupedMenu = Record<string, MenuItem[]>

type MenuBrowserProps = {
  items: MenuItem[]
  categories: MenuCategory[]
}

const ALL_CATEGORY = '全部'
const LIMITED_CATEGORY = '期間限定'

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

function normalizeDisplayText(value: string | null | undefined) {
  return (value || '').replace(/\\n/g, '\n')
}

function groupByCategory(items: MenuItem[]) {
  return items.reduce<GroupedMenu>((acc, item) => {
    const category = item.category || '未分類'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})
}

function cleanRegularDescription(description: string | null, category: MenuCategory | undefined) {
  if (!description) return ''

  description = normalizeDisplayText(description)

  if (category?.layout_style === 'flavor') return description

  return description
    .replace(/。?飲品可少冰，無提供去冰服務，甜度固定/g, '')
    .replace(/咖啡\/飲料可少冰，無提供去冰服務，甜度固定/g, '')
    .replace(/供餐最後加點 22:30 前。口味調整請洽櫃檯/g, '')
    .replace(/^\s*\/\s*/g, '')
    .replace(/\s*\/\s*$/g, '')
    .trim()
}

function HandBrewDescription({ description }: { description: string | null }) {
  if (!description) return null

  description = normalizeDisplayText(description)

  const [zhPart, ...enParts] = description.split(' / ')
  const zhTokens = zhPart.split('｜').map((part) => part.trim()).filter(Boolean)
  const zhMeta = zhTokens.slice(0, 3).join('｜')
  const zhFlavors = zhTokens.slice(3).join('、')
  const enText = enParts.join(' / ')
  const enTokens = enText.split(' / ').map((part) => part.trim()).filter(Boolean)
  const enMeta = enTokens.slice(0, 3).join(' / ')
  const enFlavors = enTokens.slice(3).join(', ')

  return (
    <div className="mt-3 space-y-1.5 text-sm leading-6 text-stone-500">
      {zhMeta && <p>{zhMeta}</p>}
      {zhFlavors && <p className="text-stone-800">- {zhFlavors}</p>}
      {enMeta && <p className="pt-1 text-xs uppercase tracking-[0.08em] text-stone-400">{enMeta}</p>}
      {enFlavors && <p className="text-xs leading-5 text-stone-400">- {enFlavors}</p>}
    </div>
  )
}

function MenuLine({ item, category }: { item: MenuItem; category?: MenuCategory }) {
  const { zh, en } = splitMenuName(item.name)
  const isFlavorLayout = category?.layout_style === 'flavor'
  const cleanedDescription = cleanRegularDescription(item.description, category)
  const badge = item.label || (item.is_limited ? 'LIMITED' : item.featured ? 'POPULAR' : '')

  return (
    <article className="group border-b border-stone-200 py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-[1.02rem] font-medium tracking-[0.03em] text-stone-900">{zh}</h3>
            {badge && (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[0.62rem] tracking-[0.16em] text-stone-400">{badge}</span>
            )}
          </div>
          {en && <p className="mt-0.5 text-xs leading-5 tracking-[0.08em] text-stone-400">{en}</p>}
        </div>
        <p className="whitespace-nowrap font-serif text-xl text-stone-900">{formatPrice(item.price)}</p>
      </div>

      {isFlavorLayout ? (
        <HandBrewDescription description={item.description} />
      ) : cleanedDescription ? (
        <p className="mt-2 text-sm leading-6 text-stone-500">{cleanedDescription}</p>
      ) : null}
    </article>
  )
}

function CategoryPanel({ category, items }: { category: MenuCategory; items: MenuItem[] }) {
  const isFlavorLayout = category.layout_style === 'flavor'
  const isCardLayout = category.layout_style === 'card'

  return (
    <section className="rounded-[2rem] border border-stone-200/90 bg-white/80 p-6 shadow-sm backdrop-blur md:p-8">
      <div className="mb-4 border-b border-stone-200 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {category.eyebrow && <p className="mb-2 text-xs tracking-[0.32em] text-stone-400">{category.eyebrow}</p>}
            <h2 className="font-serif text-4xl leading-none tracking-tight text-stone-950">{category.title}</h2>
            {category.english && <p className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-400">{category.english}</p>}
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-400">{items.length} items</span>
        </div>

        {(category.note || category.subnote) && (
          <div className="mt-4 space-y-1 text-sm leading-6 text-stone-500">
            {category.note && <p>{normalizeDisplayText(category.note)}</p>}
            {category.subnote && <p>{normalizeDisplayText(category.subnote)}</p>}
          </div>
        )}
      </div>

      <div className={isFlavorLayout || isCardLayout ? 'space-y-0' : 'grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}>
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
    <section className="rounded-[2rem] border border-stone-200 bg-[#fbf7ef] p-6 text-stone-950 shadow-sm md:p-8">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-stone-400">Featured</p>
          <h2 className="font-serif text-3xl">推薦品項</h2>
        </div>
        <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs text-stone-500">少量精選</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {featuredItems.map((item) => {
          const { zh, en } = splitMenuName(item.name)
          return (
            <article key={item.id} className="rounded-3xl border border-stone-200 bg-white/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{zh}</h3>
                  {en && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-400">{en}</p>}
                  {(item.label || item.is_limited) && <p className="mt-3 text-xs tracking-[0.2em] text-stone-400">{item.label || 'LIMITED'}</p>}
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

function LimitedPanel({ items, fallbackCategory }: { items: MenuItem[]; fallbackCategory?: MenuCategory }) {
  const category: MenuCategory = {
    id: 'limited',
    title: '期間限定',
    english: 'Limited Items',
    eyebrow: 'Seasonal',
    note: '依現場供應與期間為主',
    subnote: null,
    sort_order: -1,
    visible: true,
    layout_style: 'list',
    group_title: '期間限定',
    group_english: 'Limited',
    created_at: '',
    updated_at: ''
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.32em] text-stone-400">Limited</p>
          <h2 className="font-serif text-4xl text-stone-900">期間限定</h2>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPanel category={fallbackCategory || category} items={items} />
      </div>
    </section>
  )
}

export default function MenuBrowser({ items, categories }: MenuBrowserProps) {
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.title, category])), [categories])
  const grouped = useMemo(() => groupByCategory(items), [items])
  const sortedCategories = useMemo(() => {
    const fromCategoryTable = categories.filter((category) => grouped[category.title]?.length)
    const categoryTitles = new Set(fromCategoryTable.map((category) => category.title))
    const unknownCategories = Object.keys(grouped)
      .filter((title) => !categoryTitles.has(title))
      .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
      .map((title, index) => ({
        id: `unknown-${title}`,
        title,
        english: null,
        eyebrow: null,
        note: null,
        subnote: null,
        sort_order: 900 + index,
        visible: true,
        layout_style: 'list',
        group_title: '其他',
        group_english: 'Others'
      } as MenuCategory))

    return [...fromCategoryTable, ...unknownCategories]
  }, [categories, grouped])

  const hasLimitedItems = useMemo(() => items.some((item) => item.is_limited), [items])
  const navCategories = useMemo(() => [ALL_CATEGORY, ...(hasLimitedItems ? [LIMITED_CATEGORY] : []), ...sortedCategories.map((category) => category.title)], [hasLimitedItems, sortedCategories])
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)

  const activeItems = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return []
    if (activeCategory === LIMITED_CATEGORY) return items.filter((item) => item.is_limited)
    return grouped[activeCategory] || []
  }, [activeCategory, grouped, items])

  const groupedCategoryPanels = useMemo(() => {
    return sortedCategories.reduce<Record<string, { english: string; categories: MenuCategory[] }>>((acc, category) => {
      const title = category.group_title || 'Menu'
      if (!acc[title]) acc[title] = { english: category.group_english || 'Menu', categories: [] }
      acc[title].categories.push(category)
      return acc
    }, {})
  }, [sortedCategories])

  return (
    <>
      <FeaturedMenu items={items} />

      <nav className="sticky top-4 z-10 -mx-5 overflow-x-auto border-y border-stone-200 bg-[#f4efe7]/90 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:bg-white/80">
        <div className="flex w-max gap-2">
          {navCategories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={
                  isActive
                    ? 'rounded-full bg-stone-950 px-5 py-2 text-sm font-medium text-white shadow-sm transition'
                    : 'rounded-full border border-stone-200 bg-white/75 px-5 py-2 text-sm font-medium text-stone-500 transition hover:border-stone-400 hover:text-stone-900'
                }
              >
                {category}
              </button>
            )
          })}
        </div>
      </nav>

      {activeCategory === LIMITED_CATEGORY ? (
        <LimitedPanel items={activeItems} />
      ) : activeCategory !== ALL_CATEGORY ? (
        <CategoryPanel category={categoryMap.get(activeCategory) || sortedCategories.find((category) => category.title === activeCategory)!} items={activeItems} />
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedCategoryPanels).map(([groupTitle, group]) => (
            <section key={groupTitle} className="space-y-5">
              <div className="flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.32em] text-stone-400">{group.english}</p>
                  <h2 className="font-serif text-4xl text-stone-900">{groupTitle}</h2>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {group.categories.map((category) => (
                  <CategoryPanel key={category.title} category={category} items={grouped[category.title] || []} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
