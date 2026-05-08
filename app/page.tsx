import { hasSupabaseEnv, MenuItem, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type GroupedMenu = Record<string, MenuItem[]>

function formatPrice(price: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(price)
}

function groupByCategory(items: MenuItem[]) {
  return items.reduce<GroupedMenu>((acc, item) => {
    const category = item.category || '未分類'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})
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

  return (data || []) as MenuItem[]
}

export default async function MenuPage() {
  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME || '離域餐廳'
  const subtitle = process.env.NEXT_PUBLIC_RESTAURANT_SUBTITLE || 'Seasonal Menu'
  const items = await getMenuItems()
  const grouped = groupByCategory(items)
  const categories = Object.entries(grouped)
  const featuredItems = items.filter((item) => item.featured)

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-soft backdrop-blur md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.42em] text-black/45">{subtitle}</p>
              <h1 className="font-serif text-5xl leading-tight tracking-tight md:text-7xl">{restaurantName}</h1>
            </div>
            <div className="max-w-sm text-sm leading-7 text-black/60">
              掃描 QR Code 或開啟網址即可查看最新菜單。店家在後台更新品項與價格後，這裡會自動同步顯示。
            </div>
          </div>
        </header>

        {!hasSupabaseEnv && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            尚未設定 Supabase 環境變數。請複製 <strong>.env.example</strong> 成 <strong>.env.local</strong>，並填入你的 Supabase URL 與 Anon Key。
          </div>
        )}

        {hasSupabaseEnv && items.length === 0 && (
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-soft">
            <p className="text-lg font-semibold">目前還沒有上架中的菜單品項</p>
            <p className="mt-2 text-sm text-black/55">登入 /admin 新增品項後，前台會自動顯示。</p>
          </div>
        )}

        {featuredItems.length > 0 && (
          <section className="rounded-[2rem] bg-black p-6 text-white shadow-soft md:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-serif text-3xl">推薦品項</h2>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/55">Featured</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <article key={item.id} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      {item.description && <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>}
                    </div>
                    <p className="whitespace-nowrap text-lg font-semibold">{formatPrice(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          {categories.map(([category, categoryItems]) => {
            const hasImages = categoryItems.some((item) => Boolean(item.image_url))
            const isCompact = categoryItems.length >= 8

            return (
              <div key={category} className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-soft backdrop-blur md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <h2 className="font-serif text-3xl">{category}</h2>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/45">{categoryItems.length} items</span>
                </div>

                <div className={hasImages ? 'grid gap-4 sm:grid-cols-2' : isCompact ? 'grid gap-x-6 gap-y-3 sm:grid-cols-2' : 'space-y-4'}>
                  {categoryItems.map((item) => (
                    <article
                      key={item.id}
                      className={
                        hasImages
                          ? 'overflow-hidden rounded-3xl border border-black/10 bg-[#fbfaf7]'
                          : 'rounded-2xl border border-black/5 bg-[#fbfaf7]/70 p-4'
                      }
                    >
                      {hasImages && item.image_url && (
                        <div
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image_url})` }}
                          aria-label={item.name}
                        />
                      )}
                      <div className={hasImages ? 'p-4' : ''}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium tracking-tight">{item.name}</h3>
                            {item.description && <p className="mt-1 text-sm leading-6 text-black/50">{item.description}</p>}
                          </div>
                          <p className="whitespace-nowrap font-semibold">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        <footer className="pb-6 text-center text-xs tracking-[0.28em] text-black/35">Powered by Menu OS</footer>
      </section>
    </main>
  )
}
