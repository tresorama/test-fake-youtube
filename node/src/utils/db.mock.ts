import { v4 as uuidv4 } from "uuid";

export const repeat = (times: number) => new Array(times).fill('');
const generateId = () => uuidv4();

type BaseDbRecord = { id: string;[key: string]: unknown; };
export type DbRecord<Extended extends BaseDbRecord> = Extended;

export const createDbTable = <
  SelectItem extends DbRecord<BaseDbRecord>,
  InsertItem = Omit<SelectItem, 'id'>,
  UpdateItem = Partial<Omit<SelectItem, 'id'>>
>(initialRecords: SelectItem[]) => {

  let items: SelectItem[] = [...initialRecords];

  return {
    getAll: () => items,
    getById: (id: SelectItem['id']) => items.find(item => item.id === id),
    create: (item: InsertItem) => {
      const id = generateId();
      // @ts-expect-error ts don't allow unknown properties
      const newItem: SelectItem = {
        id,
        ...item
      };

      const newItems = [...items, newItem];
      items = newItems;

      return newItem;
    },
    update: (id: SelectItem['id'], item: UpdateItem) => {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Item not found');
      }

      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...item };
      items = newItems;

      return newItems[index];
    },
    delete: (id: SelectItem['id']) => {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Item not found');
      }

      const newItems = [...items];
      const deletedItems = newItems.splice(index, 1);
      items = newItems;

      return deletedItems[0];
    }
  };
};


// infer 
export type InferDB<T extends ReturnType<typeof createDbTable<any>>> = {
  Select: ReturnType<T['getAll']>[number],
  Insert: Parameters<T['create']>[0],
  Update: Parameters<T['update']>[1],
};