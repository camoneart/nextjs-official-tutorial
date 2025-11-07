const { faker } = require('@faker-js/faker');

// Generate 100 customers
const customers = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  image_url: '/customers/default-avatar.png',
}));

// Output as JavaScript array literal
console.log('const customers = [');
customers.forEach((customer, index) => {
  const isLast = index === customers.length - 1;
  console.log('  {');
  console.log(`    id: '${customer.id}',`);
  console.log(`    name: '${customer.name.replace(/'/g, "\\'")}',`);
  console.log(`    email: '${customer.email}',`);
  console.log(`    image_url: '${customer.image_url}',`);
  console.log(`  }${isLast ? '' : ','}`);
});
console.log('];');
