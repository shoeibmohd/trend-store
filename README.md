# TrendHub UAE - E-Commerce Store

A complete full-stack e-commerce application for a UAE-based trend products store, built with Next.js 14, Tailwind CSS, Prisma, and SQLite.

## Features

### Customer Store
- Beautiful landing page with hero section and product grid
- Product detail pages with image gallery and variant selectors (color, size, material)
- Shopping cart (localStorage-based)
- Checkout with UAE-specific address fields and emirate dropdown
- WhatsApp quick inquiry buttons throughout
- Mobile-first, responsive design

### Admin Panel
- Secure login with JWT cookie sessions
- Dashboard with order stats and revenue overview
- Product management: add/edit/delete, image upload, variant configuration
- Order management: view all orders, update status, contact customers via WhatsApp/phone

### Technical
- Next.js 14 App Router
- Tailwind CSS with custom gold/dark luxury theme
- Prisma ORM with SQLite database
- bcryptjs for password hashing
- jose for JWT tokens
- nodemailer for order notification emails
- Image uploads stored in /public/uploads/

## Quick Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env with your email credentials

# 3. Set up database (creates DB, generates client, seeds data)
npm run db:setup

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the store.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Default Admin Credentials

- **Email:** admin@trendhub.ae
- **Password:** admin123

> Change these credentials in production!

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT tokens | Change in production! |
| `EMAIL_HOST` | SMTP host for emails | `smtp.ethereal.email` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_SECURE` | Use SSL | `false` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | Sender name/email | `TrendHub UAE <noreply@trendhub.ae>` |
| `ADMIN_EMAIL` | Admin notification email | `admin@trendhub.ae` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Store WhatsApp number | `971501234567` |

### Email Setup

**Development (Ethereal):**
1. Go to [https://ethereal.email/](https://ethereal.email/) and create a free account
2. Copy the credentials to your `.env` file
3. Emails will be captured and viewable at Ethereal (not actually sent)

**Production (Gmail example):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed with sample data |
| `npm run db:setup` | Full database setup (generate + push + seed) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## Project Structure

```
trend-store/
├── app/
│   ├── page.tsx                    # Store homepage
│   ├── product/[id]/page.tsx       # Product detail
│   ├── cart/page.tsx               # Shopping cart
│   ├── checkout/page.tsx           # Checkout
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── login/page.tsx          # Admin login
│   │   ├── products/page.tsx       # Product management
│   │   └── orders/page.tsx         # Order management
│   └── api/
│       ├── products/               # Products API
│       ├── orders/                 # Orders API
│       ├── admin/                  # Auth API
│       └── upload/                 # Image upload API
├── components/
│   ├── store/                      # Customer-facing components
│   └── admin/                      # Admin panel components
├── lib/
│   ├── prisma.ts                   # Database client
│   ├── auth.ts                     # JWT authentication
│   ├── email.ts                    # Email notifications
│   └── utils.ts                    # Shared utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Sample data seeder
└── public/
    └── uploads/                    # Product image uploads
```

## Production Deployment

1. Set a strong `JWT_SECRET` (32+ random characters)
2. Configure real SMTP credentials for email notifications
3. Update `NEXT_PUBLIC_APP_URL` to your domain
4. Update `NEXT_PUBLIC_WHATSAPP_NUMBER` to your store's WhatsApp
5. Change the default admin password from `admin123`

## Customization

### Store Name & Branding
- Update store name in `components/store/Navbar.tsx` and `components/store/Footer.tsx`
- Adjust colors in `tailwind.config.ts` (gold: `#C9A84C`, dark: `#0a0a0a`)
- Update hero text in `components/store/HeroSection.tsx`

### Adding Products
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in details, upload images, configure variants
4. Set to Active to show in store

### Managing Orders
1. Go to `/admin/orders`
2. Click any order to view full details
3. Update status as orders progress
4. Use WhatsApp button to contact customers directly
