// Cloudflare D1 Database Client for Next.js (Replaces Supabase Database)

export interface D1Response<T = any> {
  data: T[] | null;
  error: Error | null;
}

export async function executeD1Query<T = any>(sql: string, params: any[] = []): Promise<D1Response<T>> {
  try {
    if (typeof window === "undefined") {
      const { executeD1QueryServer } = await import("./d1-server");
      const results = await executeD1QueryServer(sql, params);
      return { data: results as T[], error: null };
    }

    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { data: null, error: new Error(json.error || "D1 Query Failed") };
    }
    return { data: json.data as T[], error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function executeD1Batch(queries: { sql: string; params?: any[] }[]): Promise<{ data: any[][] | null; error: Error | null }> {
  try {
    if (typeof window === "undefined") {
      const { executeD1BatchServer } = await import("./d1-server");
      const results = await executeD1BatchServer(queries);
      return { data: results, error: null };
    }

    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: queries }),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { data: null, error: new Error(json.error || "D1 Batch Failed") };
    }
    return { data: json.data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

class D1QueryBuilder {
  private tableName: string;

  constructor(table: string) {
    this.tableName = table;
  }

  async select<T = any>(
    columns: string = "*",
    whereClause: string = "",
    params: any[] = [],
    orderBy: string = ""
  ): Promise<D1Response<T>> {
    let sql = `SELECT ${columns} FROM ${this.tableName}`;
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    return executeD1Query<T>(sql, params);
  }

  async single<T = any>(
    whereClause: string = "",
    params: any[] = []
  ): Promise<{ data: T | null; error: Error | null }> {
    const res = await this.select<T>("*", whereClause, params);
    if (res.error) return { data: null, error: res.error };
    return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: null };
  }

  async insert<T = any>(data: Record<string, any>): Promise<D1Response<T>> {
    const record = { ...data };
    if (!record.id && this.tableName !== "org_charts") {
      record.id = crypto.randomUUID();
    }
    const cols = Object.keys(record);
    const placeholders = cols.map(() => "?").join(", ");
    const vals = Object.values(record).map((v) =>
      typeof v === "object" && v !== null ? JSON.stringify(v) : v
    );

    const sql = `INSERT OR REPLACE INTO ${this.tableName} (${cols.join(", ")}) VALUES (${placeholders})`;
    return executeD1Query<T>(sql, vals);
  }

  async update<T = any>(
    data: Record<string, any>,
    whereClause: string,
    whereParams: any[] = []
  ): Promise<D1Response<T>> {
    const setCols = Object.keys(data).map((col) => `${col} = ?`).join(", ");
    const setVals = Object.values(data).map((v) =>
      typeof v === "object" && v !== null ? JSON.stringify(v) : v
    );

    const sql = `UPDATE ${this.tableName} SET ${setCols} WHERE ${whereClause}`;
    return executeD1Query<T>(sql, [...setVals, ...whereParams]);
  }

  async delete<T = any>(whereClause: string, whereParams: any[] = []): Promise<D1Response<T>> {
    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
    return executeD1Query<T>(sql, whereParams);
  }
}

export function d1(table: string) {
  return new D1QueryBuilder(table);
}
