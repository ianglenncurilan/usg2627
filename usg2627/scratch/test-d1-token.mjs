import fs from 'fs';
import path from 'path';

async function test() {
  const appData = process.env.APPDATA || (process.platform === 'win32' ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : '');
  const tomlPath = path.join(appData, 'xdg.config', '.wrangler', 'config', 'default.toml');
  
  if (!fs.existsSync(tomlPath)) {
    console.error("default.toml not found at", tomlPath);
    return;
  }

  const content = fs.readFileSync(tomlPath, 'utf8');
  const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
  const token = match ? match[1] : null;

  console.log("Token found:", token ? "YES (" + token.slice(0, 10) + "...)" : "NO");

  if (!token) return;

  const start = Date.now();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || "6e14a390d64dea7f42f81aac174a6b09";
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID || "9d1668fc-5ab9-4384-a5f3-ffe1eabe3fca";
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql: "SELECT count(*) as total FROM documents" })
  });
  const json = await res.json();
  const duration = Date.now() - start;

  console.log(`\n⚡ Direct D1 REST API Response Time: ${duration} ms`);
  console.log("Response:", JSON.stringify(json, null, 2));
}

test();
