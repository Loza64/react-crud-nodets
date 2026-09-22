import Photo from '@/models/entities/Photo'
import Service from '@/sdk/core/Service'
import ProductService from './custom/ProductService'
import CategoryService from './custom/CategoryService'

//custom
export const productService = new ProductService()
export const categoryService = new CategoryService()

//core
export const photoService = new Service<Photo>({ endpoint: 'photos' })
