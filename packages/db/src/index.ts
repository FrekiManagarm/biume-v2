import { env } from "@biume/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export function createDb() {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

type Db = ReturnType<typeof createDb>;

let _instance: Db | undefined;

export const db = new Proxy({} as Db, {
  get(_, prop, receiver) {
    if (!_instance) _instance = createDb();
    return Reflect.get(_instance, prop, receiver);
  },
});
