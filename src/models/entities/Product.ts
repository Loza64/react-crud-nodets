import BaseEntity from '@/sdk/model/entities/BaseEntity'
import Category from './Category'
import Photo from './Photo'

export default interface Product extends BaseEntity {
  description?: string | null
  price: number | string
  in_stock: boolean
  category: Category
  photos: Photo[]
}
