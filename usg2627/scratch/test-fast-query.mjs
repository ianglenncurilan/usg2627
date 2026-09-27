import { executeD1QueryServer } from "../lib/d1-server.ts";

async function run() {
  const start = Date.now();
  const results = await executeD1QueryServer("SELECT id, name, role FROM members LIMIT 5");
  const duration = Date.now() - start;

  console.log(`\n⚡ Query Completed in: ${duration} ms!`);
  console.log("Returned Rows:", results.length);
  console.dir(results, { depth: null });
}

run();
