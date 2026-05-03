import { prisma } from '@/lib/prisma'
import StoreLayout from '@/components/store/StoreLayout'
import ProductCard from '@/components/store/ProductCard'
import HeroSection from '@/components/store/HeroSection'
import CategoryFilter from '@/components/store/CategoryFilter'

interface PageProps {
  searchParams: { category?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const { category } = searchParams

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  })

  const categoryList = categories.map((c) => c.category)

  return (
    <StoreLayout>
      {/* Hero */}
      <HeroSection />

      {/* Products Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="products">
        <div className="text-center mb-12">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-[3px] mb-3">
            Curated Collection
          </p>
          <h2 className="section-title">
            {category ? `${category}` : 'All Products'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Discover our handpicked selection of trending products, delivered across all UAE emirates
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter categories={categoryList} activeCategory={category} />

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-dark-950 mb-2">No products found</h3>
            <p className="text-gray-400">Check back soon for new arrivals</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features Banner */}
      <section className="bg-dark-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: '2-5 Business Days' },
              { icon: '🇦🇪', title: 'All Emirates', desc: 'UAE-wide Delivery' },
              { icon: '💎', title: 'Premium Quality', desc: 'Curated Products' },
              { icon: '📱', title: 'Easy Returns', desc: '7-Day Return Policy' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-20 bg-gradient-to-r from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
            Contact Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Chat with us on WhatsApp for personalized recommendations and instant support
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501234567'}?text=Hello! I'm interested in your products.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-base shadow-lg hover:shadow-green-500/25"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </StoreLayout>
  )
}
