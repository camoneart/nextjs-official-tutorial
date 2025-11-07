// 条件なしで最新5件を返す版
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL!, { ssl: 'require', prepare: false });

export async function GET() {
  const rows = await sql/* sql */`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.date DESC
    LIMIT 5;
  `;
  return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } });
}
