import MenuBrowser from '@/components/MenuBrowser'
import { hasSupabaseEnv, MenuItem, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME || '離域'
  const subtitle = process.env.NEXT_PUBLIC_RESTAURANT_SUBTITLE || 'Li-Yu Menu'
  const items = await getMenuItems()

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-soft backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.42em] text-black/45">Opening Time</p>
              <h1 className="font-serif text-6xl leading-none tracking-tight md:text-8xl">{restaurantName}</h1>
              <p className="mt-4 text-sm uppercase tracking-[0.32em] text-black/45">{subtitle}</p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-[#fbfaf7] p-5 text-sm leading-8 text-black/65">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <p>
                  <span className="block text-[0.68rem] uppercase tracking-[0.25em] text-black/40">Monday ~ Friday</span>
                  <span className="text-lg text-black/80">15:00 ~ 00:00</span>
                </p>
                <p>
                  <span className="block text-[0.68rem] uppercase tracking-[0.25em] text-black/40">Saturday & Sunday</span>
                  <span className="text-lg text-black/80">14:00 ~ 00:00</span>
                </p>
              </div>
              <p className="mt-4 border-t border-black/10 pt-4 text-xs leading-6 text-black/50">
                （最後收客 23:30） We stop seating guests 30 minutes before closing time.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 text-sm leading-7 text-black/60 shadow-soft backdrop-blur md:p-8">
          <div className="mb-5 border-b border-black/10 pb-4">
            <p className="mb-2 text-xs uppercase tracking-[0.32em] text-black/35">House Rules</p>
            <h2 className="font-serif text-4xl leading-none tracking-tight text-black/85">入店規章</h2>
          </div>

          <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
            <ul className="space-y-2">
              <li>‧ 每人低消兩百五十元，不合併計算</li>
              <li>‧ 座位依現場安排為主，用餐時間兩小時，禁用外食</li>
              <li>‧ 目前僅提供現金結帳</li>
              <li>‧ 點主餐可加購任一套餐</li>
              <li>‧ 外食垃圾請自行帶出去處理，遺留者收取 200 元清潔費</li>
            </ul>

            <ul className="space-y-2">
              <li>‧ 破杯清潔費酌收 300 元，嘔吐清潔費酌收 2000 元</li>
              <li>‧ 目前無配合特約停車場，請勿違停影響交通與住戶出入</li>
              <li>‧ 晚間十點後，二樓戶外區不開放，請勿大聲喧嘩</li>
              <li>‧ 如有寵物隨行請置於寵物推車或寵物籃，勿影響其他客人用餐權益</li>
            </ul>
          </div>
        </section>

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

        {items.length > 0 && <MenuBrowser items={items} />}

        <footer className="pb-6 text-center text-xs tracking-[0.28em] text-black/35">Powered by Menu OS</footer>
      </section>
    </main>
  )
}
