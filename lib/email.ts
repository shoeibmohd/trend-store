import nodemailer from 'nodemailer'

interface OrderItem {
  productId: string
  title: string
  quantity: number
  price: number
  selectedColor?: string
  selectedSize?: string
  selectedMaterial?: string
}

interface OrderEmailData {
  orderId: string
  customerName: string
  phone: string
  whatsapp?: string | null
  address: string
  city: string
  emirate: string
  items: OrderItem[]
  totalAmount: number
  notes?: string | null
}

function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.ethereal.email'
  const port = parseInt(process.env.EMAIL_PORT || '587')
  const secure = process.env.EMAIL_SECURE === 'true'
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    console.warn('⚠️  Email credentials not configured. Emails will not be sent.')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
  const transporter = createTransporter()
  if (!transporter) return

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trendhub.ae'
  const whatsappLink = order.phone
    ? `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello ${order.customerName}, thank you for your order #${order.orderId} at TrendHub UAE! Your order is being processed and we will update you shortly.`
      )}`
    : null

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; color: #333;">${item.title}</td>
        <td style="padding: 12px; color: #666; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; color: #666; text-align: center;">
          ${[item.selectedColor, item.selectedSize, item.selectedMaterial].filter(Boolean).join(', ') || '-'}
        </td>
        <td style="padding: 12px; color: #C9A84C; text-align: right; font-weight: bold;">AED ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order - TrendHub UAE</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px;">TRENDHUB UAE</h1>
          <p style="color: #888; margin: 8px 0 0; font-size: 14px;">New Order Notification</p>
        </div>

        <!-- Order Info -->
        <div style="padding: 30px; background: #f9f9f9; border-bottom: 1px solid #eee;">
          <h2 style="color: #0a0a0a; margin: 0 0 15px; font-size: 18px;">Order #${order.orderId}</h2>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div>
              <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Status</span>
              <p style="color: #C9A84C; font-weight: bold; margin: 4px 0 0; background: #fff8e7; padding: 4px 12px; border-radius: 20px; display: inline-block; border: 1px solid #C9A84C;">PENDING</p>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div style="padding: 30px; border-bottom: 1px solid #eee;">
          <h3 style="color: #0a0a0a; margin: 0 0 20px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 140px; font-size: 14px;">Name</td>
              <td style="padding: 8px 0; color: #333; font-weight: 600;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Phone</td>
              <td style="padding: 8px 0; color: #333;"><a href="tel:${order.phone}" style="color: #C9A84C; text-decoration: none;">${order.phone}</a></td>
            </tr>
            ${
              order.whatsapp
                ? `<tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">WhatsApp</td>
              <td style="padding: 8px 0; color: #333;">${order.whatsapp}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Address</td>
              <td style="padding: 8px 0; color: #333;">${order.address}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">City</td>
              <td style="padding: 8px 0; color: #333;">${order.city}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Emirate</td>
              <td style="padding: 8px 0; color: #333; font-weight: 600;">${order.emirate}</td>
            </tr>
            ${
              order.notes
                ? `<tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Notes</td>
              <td style="padding: 8px 0; color: #333; font-style: italic;">${order.notes}</td>
            </tr>`
                : ''
            }
          </table>
        </div>

        <!-- Order Items -->
        <div style="padding: 30px; border-bottom: 1px solid #eee;">
          <h3 style="color: #0a0a0a; margin: 0 0 20px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Product</th>
                <th style="padding: 12px; text-align: center; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="padding: 12px; text-align: center; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Variants</th>
                <th style="padding: 12px; text-align: right; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #0a0a0a;">
                <td colspan="3" style="padding: 16px; color: #C9A84C; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</td>
                <td style="padding: 16px; color: #C9A84C; font-weight: bold; font-size: 20px; text-align: right;">AED ${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Actions -->
        <div style="padding: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders"
             style="background: #C9A84C; color: #0a0a0a; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin: 8px;">
            View Order in Admin
          </a>
          ${
            whatsappLink
              ? `<a href="${whatsappLink}"
             style="background: #25D366; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin: 8px;">
            WhatsApp Customer
          </a>`
              : ''
          }
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 20px; text-align: center;">
          <p style="color: #555; margin: 0; font-size: 12px;">TrendHub UAE - Your Premium Trend Store</p>
          <p style="color: #444; margin: 8px 0 0; font-size: 11px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
New Order Received - TrendHub UAE
Order #${order.orderId}

CUSTOMER DETAILS:
Name: ${order.customerName}
Phone: ${order.phone}
${order.whatsapp ? `WhatsApp: ${order.whatsapp}` : ''}
Address: ${order.address}
City: ${order.city}
Emirate: ${order.emirate}
${order.notes ? `Notes: ${order.notes}` : ''}

ORDER ITEMS:
${order.items
  .map(
    (item) =>
      `- ${item.title} x${item.quantity} @ AED ${item.price} each${
        [item.selectedColor, item.selectedSize, item.selectedMaterial].filter(Boolean).join(', ')
          ? ` (${[item.selectedColor, item.selectedSize, item.selectedMaterial].filter(Boolean).join(', ')})`
          : ''
      }`
  )
  .join('\n')}

TOTAL: AED ${order.totalAmount.toFixed(2)}

${whatsappLink ? `WhatsApp Customer: ${whatsappLink}` : ''}
Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/orders
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TrendHub UAE <noreply@trendhub.ae>',
      to: adminEmail,
      subject: `🛍️ New Order #${order.orderId} - AED ${order.totalAmount.toFixed(2)} - ${order.customerName}`,
      html,
      text,
    })
    console.log('📧 Order notification email sent:', info.messageId)
    // For Ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log('📧 Preview URL:', previewUrl)
    }
  } catch (error) {
    console.error('❌ Failed to send email notification:', error)
  }
}
