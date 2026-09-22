import BaseEntity from '../../sdk/model/entities/BaseEntity'

// Este modelo ya no se usa en la app (se eliminó la autenticación).
// Se conserva únicamente porque sdk/model/response/SessionResponse.ts
// (archivo del SDK, no modificado) todavía lo importa.
export default interface User extends BaseEntity {
  username: string
}
