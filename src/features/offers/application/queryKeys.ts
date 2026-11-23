export const offerKeys = {
  all: ['offers'] as const,
  list: () => [...offerKeys.all, 'list'] as const,
  detail: (id: number) => [...offerKeys.all, 'detail', id] as const,
};
