import Category from '@/models/entities/Category'
import Service from '@/sdk/core/Service'
import { UpdateParams } from '@/sdk/model/core/ParamsService'
import { BaseResponse } from '@/sdk/model/response/BaseResponse'

export default class CategoryService extends Service<Category> {
  constructor() {
    super({ endpoint: '/categories' })
  }

  // El backend expone PATCH /api/categories/:id (no PUT) para actualizar.
  async update(
    params: UpdateParams<Category>
  ): Promise<BaseResponse<Category>> {
    const res = await this.axios.patch(
      `${this.endpoint}/${params.id}`,
      params.payload,
      { ...params.config }
    )
    return res.data
  }
}
