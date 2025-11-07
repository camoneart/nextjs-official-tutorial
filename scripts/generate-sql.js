const { faker } = require('@faker-js/faker');

// Generate 100 customers
const customers = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName().replace(/'/g, "''"), // Escape single quotes
  email: faker.internet.email(),
  image_url: '/customers/default-avatar.png',
}));

// Generate SQL INSERT statements
const sqlStatements = customers.map(
  (c) =>
    `('${c.id}', '${c.name}', '${c.email}', '${c.image_url}')`
);

// Output SQL
console.log(`-- Insert 100 customers into the database
INSERT INTO customers (id, name, email, image_url)
VALUES
${sqlStatements.join(',\n')};`);
