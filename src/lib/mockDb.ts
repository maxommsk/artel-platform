export function createMockDb() {
  console.log('Using mock database');
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => ({ results: [] }),
        run: async () => ({ success: true, lastRowId: 1 })
      })
    })
  };
}
