'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { productService, getImageUrl } from '@/lib/api';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await productService.getProductByIdOrSlug(productId);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Loading product information...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <p>Product not found.</p>
        <Link href="/marketplace" className="text-indigo-400 font-semibold text-xs mt-4 inline-block">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const profit = product.basePrice - (product.costPrice || 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/marketplace" className="hover:text-white transition">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-300 font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-white font-semibold line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-96 relative shadow-xl">
            {product.images && product.images[selectedImg]?.url ? (
              <img
                src={getImageUrl(product.images[selectedImg].url)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No Image Available</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImg === idx ? 'border-indigo-500' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                {product.brand || 'Brand Direct'}
              </span>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku || 'N/A'}</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3 leading-snug">{product.name}</h1>

            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-3xl font-extrabold text-indigo-400">₹{product.basePrice}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-slate-500 line-through">₹{product.compareAtPrice}</span>
              )}
              {product.costPrice > 0 && (
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-semibold">
                  Retailer Margin: +₹{profit}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {product.description}
            </p>

            {/* Inventory Status Card */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Stock Availability</span>
                <span className={`text-base font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} Units Ready` : 'Out of Stock'}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Shipping SLA</span>
                <span className="text-base font-bold text-white">
                  {product.freeShipping ? 'Free Express (24h Dispatch)' : 'Standard Shipping'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => alert('Product synced to your dropship store!')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Push to Shopify / WooCommerce Store
            </button>
            <Link
              href="/inventory"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition text-center block"
            >
              Manage Supplier Inventory
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
