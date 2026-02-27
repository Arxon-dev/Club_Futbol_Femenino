import { useEffect, useState } from 'react';
import { productService, Product } from '../services/productService';
import { authService } from '../services/authService';
import {
  Plus, Edit2, Trash2, Loader2, AlertCircle, ShoppingBag,
  Tag, ExternalLink, Check, X as XIcon
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteModal from '../components/ui/EliteModal';
import { EliteInput, EliteSelect, EliteTextarea } from '../components/ui/EliteInput';

const emptyProduct: Partial<Product> = {
  name: '', description: '', price: 0, imageUrl: '', category: 'Otros',
  sizes: [], available: true, contactWhatsApp: ''
};

const categories = ['Todas', 'Camisetas', 'Accesorios', 'Equipamiento', 'Otros'] as const;

const categoryStyles: Record<string, string> = {
  Camisetas: 'bg-elite-primary/15 text-elite-primary-hover border-elite-primary/20',
  Accesorios: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20',
  Equipamiento: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Otros: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

export default function MerchandisingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [sizesInput, setSizesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await productService.getAllProducts()
        : await productService.getProducts();
      setProducts(data);
    } catch { setError('Error al cargar productos'); }
    finally { setLoading(false); }
  };

  const filteredProducts = activeCategory === 'Todas'
    ? products
    : products.filter(p => p.category === activeCategory);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setSizesInput('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, imageUrl: p.imageUrl || '',
      category: p.category, sizes: p.sizes,
      available: p.available, contactWhatsApp: p.contactWhatsApp || ''
    });
    setSizesInput((p.sizes || []).join(', '));
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const parsedSizes = sizesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const payload = { ...form, sizes: parsedSizes };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try { await productService.deleteProduct(id); await loadProducts(); }
    catch { alert('Error al eliminar'); }
  };

  const openWhatsApp = (phone: string, productName: string) => {
    const message = encodeURIComponent(`Hola! Me interesa el producto: ${productName}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Tienda"
        subtitle="Merchandising oficial del club."
        actions={
          isAdmin ? (
            <EliteButton icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nuevo Producto</EliteButton>
          ) : undefined
        }
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
              ${activeCategory === cat
                ? 'bg-elite-primary/20 text-elite-primary-hover border-elite-primary/30'
                : 'bg-elite-surface text-slate-400 border-white/5 hover:text-white hover:border-white/10'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <EliteCard className="text-center py-16">
          <ShoppingBag className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">
            {activeCategory === 'Todas'
              ? 'No hay productos en la tienda todavía.'
              : `No hay productos en la categoría "${activeCategory}".`}
          </p>
          {isAdmin && activeCategory === 'Todas' && (
            <EliteButton className="mt-4" size="sm" onClick={openCreate}>Añadir Primer Producto</EliteButton>
          )}
        </EliteCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const catCls = categoryStyles[product.category] || categoryStyles.Otros;
            return (
              <EliteCard key={product.id} padding="p-0" className="group hover:border-white/10 transition-all overflow-hidden flex flex-col">
                {/* Image Header */}
                {product.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-elite-surface/90 via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${catCls}`}>
                      {product.category}
                    </span>
                    {!product.available && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-elite-accent/15 text-elite-accent border-elite-accent/20">
                        No disponible
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative h-40 bg-gradient-to-br from-elite-primary/10 to-elite-secondary/10 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-slate-600" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${catCls}`}>
                      {product.category}
                    </span>
                    {!product.available && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-elite-accent/15 text-elite-accent border-elite-accent/20">
                        No disponible
                      </span>
                    )}
                  </div>
                )}

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-white font-semibold font-heading text-lg leading-snug mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <p className="text-xl font-bold text-emerald-400 mb-3">
                    {formatPrice(product.price)}
                  </p>

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {product.sizes.map((size, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/5 text-slate-400 border border-white/5"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    {product.contactWhatsApp ? (
                      <button
                        onClick={() => openWhatsApp(product.contactWhatsApp!, product.name)}
                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Pedir por WhatsApp
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Tag className="w-3 h-3" />
                        {product.available ? 'Disponible' : 'Agotado'}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-slate-500 hover:text-elite-secondary hover:bg-elite-secondary/10 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-500 hover:text-elite-accent hover:bg-elite-accent/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </EliteCard>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      <EliteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'} maxWidth="max-w-lg">
        {error && (
          <div className="mb-4 bg-elite-accent/10 text-elite-accent p-3 rounded-xl flex items-center gap-2 text-sm border border-elite-accent/20">
            <AlertCircle className="w-4 h-4" /> <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <EliteInput
            label="Nombre *" required
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre del producto"
          />
          <EliteTextarea
            label="Descripción"
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción del producto..."
          />
          <div className="grid grid-cols-2 gap-3">
            <EliteInput
              label="Precio (€) *" required
              type="number" step="0.01" min="0"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <EliteSelect
              label="Categoría"
              value={form.category || 'Otros'}
              onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
            >
              <option value="Camisetas">Camisetas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Equipamiento">Equipamiento</option>
              <option value="Otros">Otros</option>
            </EliteSelect>
          </div>
          <EliteInput
            label="URL de Imagen (opcional)"
            type="url"
            value={form.imageUrl || ''}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://...imagen.jpg"
          />
          <EliteInput
            label="Tallas (separadas por coma)"
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            placeholder="S, M, L, XL"
          />
          <div className="grid grid-cols-2 gap-3">
            <EliteInput
              label="WhatsApp de contacto"
              value={form.contactWhatsApp || ''}
              onChange={(e) => setForm({ ...form, contactWhatsApp: e.target.value })}
              placeholder="+34600000000"
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5
                    ${form.available ? 'bg-emerald-500/30' : 'bg-slate-700'}`}
                  onClick={() => setForm({ ...form, available: !form.available })}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                    ${form.available ? 'translate-x-5' : 'translate-x-0'}`}>
                    {form.available
                      ? <Check className="w-3 h-3 text-emerald-500 m-0.5" />
                      : <XIcon className="w-3 h-3 text-slate-500 m-0.5" />
                    }
                  </div>
                </div>
                <span className="text-sm text-slate-400">
                  {form.available ? 'Disponible' : 'No disponible'}
                </span>
              </label>
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</EliteButton>
            <EliteButton type="submit" loading={saving}>{editingProduct ? 'Guardar' : 'Crear Producto'}</EliteButton>
          </div>
        </form>
      </EliteModal>
    </div>
  );
}
