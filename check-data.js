/**
 * Quick data checker - Run this to see all data
 */

const db = require('./database');

async function checkAll() {
  try {
    console.log('\n👥 USERS:\n');
    const users = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
    console.table(users.rows);

    console.log('\n📁 CATEGORIES:\n');
    const cats = await db.query('SELECT id, name, icon FROM categories ORDER BY id');
    console.table(cats.rows);

    console.log('\n📦 PRODUCTS:\n');
    const prods = await db.query('SELECT id, name, price, category_id FROM products ORDER BY id');
    console.table(prods.rows);

    console.log('\n🛒 ORDERS:\n');
    const orders = await db.query('SELECT id, user_id, total, status, created_at FROM orders ORDER BY id');
    console.table(orders.rows);

    console.log('\n⚙️ SETTINGS:\n');
    const settings = await db.query('SELECT * FROM settings');
    console.table(settings.rows);

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkAll();
