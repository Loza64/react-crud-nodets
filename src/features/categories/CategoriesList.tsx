import { useMemo, useState } from 'react'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { categoryService } from '@/api'
import Category from '@/models/entities/Category'
import { Toolbar } from '@/components/ui/Toolbar'
import { SearchBox } from '@/components/ui/SearchBox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Table, type TableColumn } from '@/components/ui/Table'
import errorResponse from '@/utils/errorResponse'
import { CategoryForm } from './CategoryForm'

const PAGE_SIZE = 10

export default function CategoriesList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleted, setDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search ? { search } : {}),
      deleted,
    }),
    [page, search, deleted]
  )

  const categoriesQuery = useFindAll<Category>({
    service: categoryService,
    queryKey: 'categories',
    queryParams,
  })
  const categories = categoriesQuery.data?.data ?? []
  const pagination = categoriesQuery.data?.pagination
    ? { ...categoriesQuery.data.pagination, itemsLabel: 'categorías' }
    : null

  const crud = useCrud<Category>({
    service: categoryService,
    queryKey: 'categories',
  })

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingId(category.id!)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const remove = (category: Category) => {
    setCategoryToDelete(category)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) {
      return
    }
    try {
      await crud.delete({ id: categoryToDelete.id! })
      setCategoryToDelete(null)
    } catch (err) {
      errorResponse({ error: err })
    }
  }

  const restore = (category: Category) => {
    crud.restore({ id: category.id! })
  }

  const columns: TableColumn<Category>[] = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (value) => (value ? String(value) : '—'),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_v, record) =>
        record.deletedAt ? (
          <Badge variant="neutral">Eliminada</Badge>
        ) : (
          <Badge variant="success">Activa</Badge>
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
            Nueva categoría
          </Button>
        }
      >
        <SearchBox
          placeholder="Buscar categorías..."
          value={search}
          onValueChange={onSearch}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={deleted}
            onChange={(e) => setDeleted(e.target.checked)}
          />
          Mostrar eliminadas
        </label>
      </Toolbar>

      <Table
        columns={columns}
        data={categories}
        loading={categoriesQuery.isLoading}
        emptyText="No se encontraron categorías."
        pagination={pagination}
        onPageChange={setPage}
      />

      <Modal
        open={modalOpen}
        title={editingId ? 'Editar categoría' : 'Nueva categoría'}
        onClose={closeModal}
      >
        <CategoryForm
          categoryId={editingId}
          onSaved={closeModal}
          onCancelled={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!categoryToDelete}
        tone="danger"
        title="Eliminar categoría"
        description={
          <>
            ¿Seguro que quieres eliminar la categoría{' '}
            <strong>{categoryToDelete?.name}</strong>? Si tiene productos
            activos no se podrá eliminar.
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={crud.isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </>
  )
}
