import { config } from 'dotenv';
import { faker } from '@faker-js/faker';
import postgres from 'postgres';

// Load environment variables from .env file with override
config({ override: true });

const POSTGRES_URL = process.env.POSTGRES_URL!;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL is not defined in .env file');
  process.exit(1);
}

console.log('✅ Environment variables loaded');

async function main() {
  const sql = postgres(POSTGRES_URL, { ssl: 'require' });

  console.log('🌱 Seeding invoices for all customers...');

  try {
    // Fetch all customer IDs from the database
    const customers = await sql`SELECT id FROM customers ORDER BY name ASC`;
    console.log(`Found ${customers.length} customers in database`);

    if (customers.length === 0) {
      console.error('❌ No customers found. Please run seed:customers first.');
      process.exit(1);
    }

    // Generate 2-5 invoices per customer
    const invoices = [];
    for (const customer of customers) {
      const numInvoices = faker.number.int({ min: 2, max: 5 });

      for (let i = 0; i < numInvoices; i++) {
        invoices.push({
          id: faker.string.uuid(),
          customer_id: customer.id,
          amount: faker.number.int({ min: 500, max: 50000 }), // Amount in cents
          status: faker.helpers.arrayElement(['paid', 'pending']),
          date: faker.date.between({
            from: '2022-01-01',
            to: '2023-12-31'
          }).toISOString().split('T')[0], // Format: YYYY-MM-DD
        });
      }
    }

    console.log(`Generated ${invoices.length} invoices for ${customers.length} customers`);

    // Clear existing invoices
    console.log('Clearing existing invoices...');
    await sql`DELETE FROM invoices`;

    // Insert invoices in batches
    const batchSize = 50;
    for (let i = 0; i < invoices.length; i += batchSize) {
      const batch = invoices.slice(i, i + batchSize);

      await sql`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES ${sql(batch.map(inv => [inv.id, inv.customer_id, inv.amount, inv.status, inv.date]))}
      `;

      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(invoices.length / batchSize)}`);
    }

    console.log('✅ Seeding completed successfully!');

    // Verify the count
    const result = await sql`SELECT COUNT(*) FROM invoices`;
    console.log(`Total invoices in database: ${result[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding invoices:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
