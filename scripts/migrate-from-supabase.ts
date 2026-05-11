import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import WebSocket from "ws";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DATABASE_URL) {
  console.error(
    "Missing env vars. Set SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket as any },
});
const prisma = new PrismaClient();

const TABLES_IN_ORDER = [
  "members",
  "menu_items",
  "events",
  "event_members",
  "event_preset_items",
  "member_consumptions",
  "consumption_items",
  "consumption_shared_items",
] as const;

type TableName = (typeof TABLES_IN_ORDER)[number];

async function migrateTable(table: TableName) {
  console.log(`⏳ Migrating ${table}...`);

  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`❌ Error fetching ${table} from Supabase:`, error.message);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`   ${table}: 0 rows (empty)`);
    return;
  }

  // Column renames: Supabase snake_case → actual DB column name (where they differ from @map)
  const COL_RENAMES: Record<string, Record<string, string>> = {
    events: { total_amount: "totalAmount" },
    member_consumptions: { total_amount: "total_amount" },
  };

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

  let count = 0;
  for (const row of data) {
    const renames = COL_RENAMES[table] || {};
    const columns = Object.keys(row).map((c) => renames[c] || c);
    const values = Object.values(row);
    const placeholders = values
      .map((v, i) => {
        if (typeof v === "string" && UUID_RE.test(v)) return `$${i + 1}::uuid`;
        if (typeof v === "string" && TIMESTAMP_RE.test(v)) return `$${i + 1}::timestamptz`;
        return `$${i + 1}`;
      })
      .join(", ");
    const colList = columns.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

    try {
      await prisma.$executeRawUnsafe(sql, ...values);
      count++;
    } catch (e: any) {
      console.error(`   ❌ Failed to insert row in ${table}:`, e.message);
    }
  }
  console.log(`✅ ${table}: ${count}/${data.length} rows migrated`);
}

async function main() {
  console.log("🍺 Tácek: Supabase → PostgreSQL Migration");
  console.log("==========================================\n");

  try {
    for (const table of TABLES_IN_ORDER) {
      await migrateTable(table);
    }
    console.log("\n🎉 Migration complete!");
  } catch (err: any) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
