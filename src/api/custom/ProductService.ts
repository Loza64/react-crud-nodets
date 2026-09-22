import Product from '@/models/entities/Product'
import Service from '@/sdk/core/Service'
import { UpdateParams } from '@/sdk/model/core/ParamsService'
import { BaseResponse } from '@/sdk/model/response/BaseResponse'

export default class ProductService extends Service<Product> {
  constructor() {
    super({ endpoint: '/products' })
  }

  // El backend expone PATCH /api/products/:id (no PUT) para actualizar.
  async update(params: UpdateParams<Product>): Promise<BaseResponse<Product>> {
    const res = await this.axios.patch(
      `${this.endpoint}/${params.id}`,
      params.payload,
      { ...params.config }
    )
    return res.data
  }
}
