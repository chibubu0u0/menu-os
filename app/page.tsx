import MenuBrowser from '@/components/MenuBrowser'
import { hasSupabaseEnv, MenuCategory, MenuItem, SiteSection, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function isWithinLimitedPeriod(item: MenuItem) {
  if (!item.is_limited) return true

  const today = todayISO()
  if (item.start_date && today < item.start_date) return false
  if (item.end_date && today > item.end_date) return false
  return true
}

async function getMenuItems() {
  if (!hasSupabaseEnv) return []

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return ((data || []) as MenuItem[]).filter(isWithinLimitedPeriod)
}

async function getMenuCategories() {
  if (!hasSupabaseEnv) return []

  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return (data || []) as MenuCategory[]
}

async function getSiteSections() {
  if (!hasSupabaseEnv) return []

  const { data, error } = await supabase
    .from('site_sections')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return (data || []) as SiteSection[]
}

function splitLines(body: string | null) {
  return (body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function SiteSectionCard({ section }: { section: SiteSection }) {
  const lines = splitLines(section.body)

  if (section.style === 'opening') {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-[#211d18]/80 p-6 shadow-soft backdrop-blur md:p-8">
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-white/35">{section.english || 'Opening Time'}</p>
          <h2 className="font-serif text-4xl leading-none tracking-tight text-[#f8f1e6]">{section.title}</h2>
        </div>
        <div className="grid gap-4 text-sm leading-7 text-[#d8cfbf]/65 md:grid-cols-3">
          {lines.map((line) => (
            <p key={line} className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
              {line}
            </p>
          ))}
        </div>
      </section>
    )
  }

  if (section.style === 'rules') {
    const midpoint = Math.ceil(lines.length / 2)
    return (
      <section className="rounded-[2rem] border border-white/10 bg-[#211d18]/80 p-6 text-sm leading-7 text-[#d8cfbf]/65 shadow-soft backdrop-blur md:p-8">
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-white/35">{section.english || 'House Rules'}</p>
          <h2 className="font-serif text-4xl leading-none tracking-tight text-[#f8f1e6]">{section.title}</h2>
        </div>
        <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
          {[lines.slice(0, midpoint), lines.slice(midpoint)].map((chunk, index) => (
            <ul key={index} className="space-y-2">
              {chunk.map((line) => (
                <li key={line}>‧ {line.replace(/^‧\s*/, '')}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>
    )
  }

  if (section.style === 'notice') {
    return (
      <section className="rounded-[2rem] bg-[#2a241d] p-6 text-[#fff6e6] shadow-soft md:p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.32em] text-white/35">{section.english || 'Notice'}</p>
        <h2 className="font-serif text-4xl leading-none tracking-tight">{section.title}</h2>
        {lines.length > 0 && (
          <div className="mt-5 space-y-2 text-sm leading-7 text-white/60">
            {lines.map((line) => <p key={line}>{line}</p>)}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#211d18]/80 p-6 text-sm leading-7 text-[#d8cfbf]/65 shadow-soft backdrop-blur md:p-8">
      <p className="mb-2 text-xs uppercase tracking-[0.32em] text-white/35">{section.english || 'Section'}</p>
      <h2 className="font-serif text-4xl leading-none tracking-tight text-[#f8f1e6]">{section.title}</h2>
      {lines.length > 0 && (
        <div className="mt-5 space-y-2">
          {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
      )}
    </section>
  )
}

export default async function MenuPage() {
  const [items, categories, sections] = await Promise.all([
    getMenuItems(),
    getMenuCategories(),
    getSiteSections()
  ])

  const hero = sections.find((section) => section.style === 'hero' || section.section_key === 'hero')
  const visibleSections = sections.filter((section) => section.id !== hero?.id)
  const categorySet = new Set(categories.map((category) => category.title))
  const displayItems = categories.length > 0 ? items.filter((item) => categorySet.has(item.category)) : items

  const restaurantName = hero?.title || process.env.NEXT_PUBLIC_RESTAURANT_NAME || '離域'
  const subtitle = hero?.english || process.env.NEXT_PUBLIC_RESTAURANT_SUBTITLE || 'Li-Yu Menu'
  const heroLines = splitLines(hero?.body || '在城市的縫隙裡，留一段可以慢下來的時間。')

  return (
    <main className="min-h-screen bg-[#15130f] px-5 py-8 text-[#f8f1e6] sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/10 bg-[#211d18]/85 p-7 shadow-soft backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.42em] text-white/40">Menu OS</p>
              <h1 className="font-serif text-6xl leading-none tracking-tight md:text-8xl">{restaurantName}</h1>
              <p className="mt-4 text-sm uppercase tracking-[0.32em] text-white/40">{subtitle}</p>
            </div>

            {heroLines.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-8 text-[#d8cfbf]/65">
                {heroLines.map((line) => <p key={line}>{line}</p>)}
              </div>
            )}
          </div>
        </header>

        {visibleSections.map((section) => <SiteSectionCard key={section.id} section={section} />)}

        {!hasSupabaseEnv && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            尚未設定 Supabase 環境變數。請複製 <strong>.env.example</strong> 成 <strong>.env.local</strong>，並填入你的 Supabase URL 與 Anon Key。
          </div>
        )}

        {hasSupabaseEnv && displayItems.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#211d18]/80 p-8 text-center shadow-soft">
            <p className="text-lg font-semibold text-[#f8f1e6]">目前還沒有上架中的菜單品項</p>
            <p className="mt-2 text-sm text-[#d8cfbf]/55">登入 /admin 新增品項後，前台會自動顯示。</p>
          </div>
        )}

        {displayItems.length > 0 && <MenuBrowser items={displayItems} categories={categories} />}

        <footer className="pb-6 text-center text-xs tracking-[0.28em] text-white/35">Powered by Menu OS</footer>
      </section>
    </main>
  )
}
