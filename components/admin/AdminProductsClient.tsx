'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPrice, PRODUCT_CATEGORIES, type ProductVariants } from '@/lib/utils'

interface Product {
  id: string
  title: string
  price: number
  category: string
  images: string
  variants: string
  stock: number
  isActive: boolean
  createdAt: Date
}

const DEFAULT_VARIANTS: ProductVariants = { colors: [], sizes: [], materials: [] }
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Product>
  onSave: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: '',
    price: initial?.price?.toString() || '',
    category: initial?.category || 'Bags',
    stock: initial?.stock?.toString() || '999',
    isActive: initial?.isActive !== false,
  })
  const [variants, setVariants] = useState<ProductVariants>(
    initial?.variants ? JSON.parse(initial.variants) : DEFAULT_VARIANTS
  )
  const [images, setImages] = useState<string[]>(
    initial?.images ? JSON.parse(initial.images) : []
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Color management
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newMaterial, setNewMaterial] = useState('')

  // Load description for edit
  useEffect(() => {
    if (initial?.id) {
      fetch(`/api/products/${initial.id}?activeOnly=false`)
        .then((r) => r.json())
        .then((p) => {
          if (p.description) setForm((f) => ({ ...f, description: p.description }))
          if (p.images) setImages(JSON.parse(p.images))
          if (p.variants) setVariants(JSON.parse(p.variants))
        })
        .catch(console.error)
    }
  }, [initial?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('files', f))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.paths) {
        setImages((prev) => [...prev, ...data.paths])
      }
    } catch {
      setError('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addVariant = (type: keyof ProductVariants, value: string) => {
    if (!value.trim()) return
    setVariants((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), value.trim()],
    }))
    if (type === 'colors') setNewColor('')
    if (type === 'sizes') setNewSize('')
    if (type === 'materials') setNewMaterial('')
  }

  const removeVariant = (type: keyof ProductVariants, index: number) => {
    setVariants((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((_: string, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      images: JSON.stringify(images),
      variants: JSON.stringify(variants),
    }

    try {
      const url = initial?.id ? `/api/products/${initial.id}` : '/api/products'
      const method = initial?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save product')
      }

      onSave()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-dark-950 text-lg">
          {initial?.id ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="label">Product Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="e.g. Luxury Leather Crossbody Bag"
              className="input-field"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="label">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              rows={4}
              placeholder="Describe your product in detail..."
              className="input-field resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="label">Price (AED) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">AED</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-field pl-14"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="label">Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
              min="0"
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="input-field"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Active toggle */}
          <div>
            <label className="label">Status</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-gold-400' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${form.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {form.isActive ? 'Active (visible to customers)' : 'Inactive (hidden from store)'}
              </span>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="label">Product Images</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                <Image src={img} alt={`Product ${i + 1}`} fill className="object-cover" sizes="80px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gold-400 hover:bg-gold-50 transition-colors">
              {uploading ? (
                <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-400 mt-1">Add</span>
                </>
              )}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-6">
          <h3 className="font-semibold text-dark-950">Product Variants <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>

          {/* Colors */}
          <div>
            <label className="label">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(variants.colors || []).map((color, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-100 text-dark-950 px-3 py-1 rounded-full text-sm">
                  {color}
                  <button type="button" onClick={() => removeVariant('colors', i)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant('colors', newColor))}
                placeholder="e.g. Black, Gold, White..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => addVariant('colors', newColor)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="label">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEFAULT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    if ((variants.sizes || []).includes(size)) {
                      setVariants((p) => ({ ...p, sizes: p.sizes.filter((s) => s !== size) }))
                    } else {
                      setVariants((p) => ({ ...p, sizes: [...(p.sizes || []), size] }))
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    (variants.sizes || []).includes(size)
                      ? 'border-gold-400 bg-gold-50 text-dark-950'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant('sizes', newSize))}
                placeholder="Custom size (e.g. 38, One Size)..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => addVariant('sizes', newSize)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {(variants.sizes || []).filter((s) => !DEFAULT_SIZES.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(variants.sizes || []).filter((s) => !DEFAULT_SIZES.includes(s)).map((size, i) => (
                  <span key={i} className="flex items-center gap-1 bg-gray-100 text-dark-950 px-3 py-1 rounded-full text-sm">
                    {size}
                    <button
                      type="button"
                      onClick={() => setVariants((p) => ({ ...p, sizes: p.sizes.filter((s) => s !== size) }))}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div>
            <label className="label">Materials</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(variants.materials || []).map((mat, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-100 text-dark-950 px-3 py-1 rounded-full text-sm">
                  {mat}
                  <button type="button" onClick={() => removeVariant('materials', i)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant('materials', newMaterial))}
                placeholder="e.g. Cotton, Silk, Leather..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => addVariant('materials', newMaterial)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className={`btn-gold ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : initial?.id ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminProductsClient({ products: initialProducts }: { products: Product[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = () => {
    fetch('/api/products?activeOnly=false')
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
    setShowForm(false)
    setEditProduct(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete product')
    } finally {
      setDeletingId(null)
      setDeleteId(null)
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      }
    } catch {
      alert('Failed to update product')
    }
  }

  if (showForm || editProduct) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-950">{editProduct ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <ProductForm
          initial={editProduct || undefined}
          onSave={refresh}
          onCancel={() => { setShowForm(false); setEditProduct(null) }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-950">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} total products</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-24 text-center">
          <p className="text-gray-400 text-lg mb-4">No products yet</p>
          <button onClick={() => setShowForm(true)} className="btn-gold">Add Your First Product</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const images = JSON.parse(product.images || '[]')
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {images[0] ? (
                              <Image src={images[0]} alt={product.title} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-dark-950 text-sm line-clamp-1">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-dark-950 text-sm">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">{product.stock}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            product.isActive
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {product.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditProduct(product)}
                            className="text-gray-400 hover:text-gold-500 transition-colors p-1.5 rounded hover:bg-gold-50"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {deleteId === product.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={!!deletingId}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                              >
                                {deletingId === product.id ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
