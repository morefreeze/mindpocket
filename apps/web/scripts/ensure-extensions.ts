import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
await sql("CREATE EXTENSION IF NOT EXISTS vector")
console.log("[ensure-extensions] pgvector extension ready")
