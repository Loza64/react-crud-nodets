import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { productService, categoryService } from '@/api'
import Product from '@/models/entities/Product'
import Category from '@/models/entities/Category'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { SelectApi } from '@/components/ui/SelectApi'
import { Table, type TableColumn } from '@/components/ui/Table'
import errorResponse from '@/utils/errorResponse'
import { ProductForm } from './ProductForm'

const PAGE_SIZE = 10

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(
    Number(price)
  )

export default function ProductsList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      deleted,
      ...(categoryFilter ? { category: categoryFilter.id } : {}),
    }),
    [page, search, deleted, categoryFilter]
  )

  const productsQuery = useFindAll<Product>({
    service: productService,
    queryKey: 'products',
    queryParams,
  })
  const products = productsQuery.data?.data ?? []
  const pagination = productsQuery.data?.pagination
    ? { ...productsQuery.data.pagination, itemsLabel: 'productos' }
    : null

  const crud = useCrud<Product>({
    service: productService,
    queryKey: 'products',
  })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id!)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const remove = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = async () => {
    if (!productToDelete) {
      return
    }
    try {
      await crud.delete({ id: productToDelete.id! })
      setProductToDelete(null)
    } catch (err) {
      errorResponse({ error: err })
    }
  }

  const restore = (product: Product) => {
    crud.restore({ id: product.id! })
  }

  const columns: TableColumn<Product>[] = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Categoría',
      key: 'category',
      render: (_v, record) => record.category?.name ?? '—',
    },
    {
      title: 'Precio',
      key: 'price',
      render: (_v, record) => formatPrice(record.price),
    },
    {
      title: 'Stock',
      key: 'in_stock',
      render: (_v, record) =>
        record.in_stock ? (
          <Badge variant="success">Disponible</Badge>
        ) : (
          <Badge variant="danger">Agotado</Badge>
        ),
    },
    {
      title: 'Fotos',
      key: 'photos',
      render: (_v, record) => `${record.photos?.length ?? 0}`,
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminado</Badge>
        ) : (
          <Badge variant="success">Activo</Badge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: '90px',
      render: (_v, record) => (
        <div className="row-actions">
          {record.deletedAt ? (
            <Button
              variant="icon-success"
              tooltip="Restaurar"
              onClick={() => restore(record)}
            >
              <RotateCw size={15} />
            </Button>
          ) : (
            <>
              <Button
                variant="icon"
                tooltip="Editar"
                onClick={() => openEdit(record)}
              >
                <Pencil size={15} />
              </Button>
              <Button
                variant="icon-danger"
                tooltip="Eliminar"
                onClick={() => remove(record)}
              >
                <Trash2 size={15} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} />
            Nuevo producto
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar productos..."
          value={search}
          onValueChange={onSearch}
        />

        <div className="w-full max-w-[220px]">
          <SelectApi<Category>
            service={categoryService}
            querySearch={(search) => ({ search })}
            queryParams={{ pageSize: 50 }}
            renderOption={(item) => item.name ?? ''}
            value={categoryFilter}
            onChange={(value) =>
              setCategoryFilter(Array.isArray(value) ? null : value)
            }
            placeholder="Filtrar por categoría"
            notFoundText="No se encontraron categorías"
          />
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={deleted}
            onChange={(e) => setDeleted(e.target.checked)}
          />
          Mostrar eliminados
        </label>
      </Toolbar>

      <Table
        columns={columns}
        data={products}
        loading={productsQuery.isLoading}
        emptyText="No se encontraron productos."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        widthPx={640}
        onClose={closeModal}
      >
        <ProductForm
          productId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!productToDelete}
        tone="danger"
        title="Eliminar producto"
        description={
          <>
            ¿Seguro que quieres eliminar el producto{' '}
            <strong>{productToDelete?.name}</strong>?
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crud.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </>
  )
}
