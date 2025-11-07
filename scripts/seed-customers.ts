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

  console.log('🌱 Seeding customers...');

  try {
    // Generate 100 customers
    const customers = Array.from({ length: 100 }, (_, i) => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      image_url: `/customers/default-avatar.png`, // Using a default image
    }));

    console.log(`Generated ${customers.length} customers`);

    // Insert customers in batches
    const batchSize = 10;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES ${sql(batch.map(c => [c.id, c.name, c.email, c.image_url]))}
        ON CONFLICT (id) DO NOTHING
      `;

      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(customers.length / batchSize)}`);
    }

    console.log('✅ Seeding completed successfully!');

    // Verify the count
    const result = await sql`SELECT COUNT(*) FROM customers`;
    console.log(`Total customers in database: ${result[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
