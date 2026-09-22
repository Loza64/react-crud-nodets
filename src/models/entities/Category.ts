import BaseEntity from '@/sdk/model/entities/BaseEntity'

export default interface Category extends BaseEntity {
  name: string
  description?: string | null
}
