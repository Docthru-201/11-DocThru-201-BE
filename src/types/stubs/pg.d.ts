declare module 'pg' {
  export class Pool {
    constructor(options?: {
      connectionString?: string;
      [key: string]: unknown;
    });
    end(): Promise<void>;
  }
  const pg: { Pool: typeof Pool };
  export default pg;
}
