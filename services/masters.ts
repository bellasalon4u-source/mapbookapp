import { masters } from '@/lib/data';

export function getAllMasters() {
  return masters;
}

export function getMasterById(id: string) {
  return masters.find((master) => master.id === id);
}
