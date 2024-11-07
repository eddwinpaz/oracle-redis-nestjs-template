// base.repository.ts
export abstract class BaseRepository<T> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: any): Promise<T | null>;
  abstract save(entity: T): Promise<T>;
  abstract delete(id: any): Promise<void>;
}
