import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin
  const passwordHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@trendhub.ae' },
    update: {},
    create: {
      email: 'admin@trendhub.ae',
      passwordHash,
      name: 'TrendHub Admin',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create sample products
  const products = [
    {
      title: 'Luxury Leather Crossbody Bag',
      description: 'Elevate your style with this premium leather crossbody bag. Crafted from genuine Italian leather with gold-tone hardware. Features multiple compartments, adjustable strap, and a timeless design perfect for both day and evening looks.',
      price: 299,
      category: 'Bags',
      images: JSON.stringify(['/uploads/placeholder-bag.svg']),
      variants: JSON.stringify({
        colors: ['Black', 'Brown', 'Camel', 'White'],
        sizes: [],
        materials: ['Genuine Leather', 'Vegan Leather'],
      }),
      stock: 50,
      isActive: true,
    },
    {
      title: 'Premium Oversized Blazer',
      description: 'Make a statement with this premium oversized blazer. Features a relaxed silhouette with structured shoulders, perfect for creating effortlessly chic looks. Pair with jeans for casual elegance or dress up for formal occasions.',
      price: 450,
      category: 'Clothing',
      images: JSON.stringify(['/uploads/placeholder-blazer.svg']),
      variants: JSON.stringify({
        colors: ['Black', 'Beige', 'Navy', 'Charcoal'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        materials: ['Wool Blend', 'Linen'],
      }),
      stock: 75,
      isActive: true,
    },
    {
      title: 'Designer Silk Scarf',
      description: 'This exquisite silk scarf features intricate patterns inspired by UAE heritage. Made from 100% pure silk with hand-rolled edges. Versatile enough to be worn around the neck, tied to a bag, or as a head accessory.',
      price: 185,
      category: 'Accessories',
      images: JSON.stringify(['/uploads/placeholder-scarf.svg']),
      variants: JSON.stringify({
        colors: ['Gold & Black', 'Navy & Gold', 'Emerald & Gold', 'Rose & Gold'],
        sizes: [],
        materials: ['100% Silk'],
      }),
      stock: 100,
      isActive: true,
    },
    {
      title: 'Structured Tote Bag',
      description: 'The ultimate everyday luxury tote. This structured bag offers ample space for all your essentials while maintaining a sleek, sophisticated silhouette. Features interior pockets, a zip closure, and durable handles.',
      price: 380,
      category: 'Bags',
      images: JSON.stringify(['/uploads/placeholder-tote.svg']),
      variants: JSON.stringify({
        colors: ['Black', 'Nude', 'Burgundy'],
        sizes: ['Medium', 'Large'],
        materials: [],
      }),
      stock: 40,
      isActive: true,
    },
  ]

  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    console.log(`✅ Product created: ${created.title}`)
  }

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Login credentials:')
  console.log('   Email: admin@trendhub.ae')
  console.log('   Password: admin123')
  console.log('\n🌐 Visit http://localhost:3000 to see the store')
  console.log('🔐 Visit http://localhost:3000/admin to access the admin panel')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
