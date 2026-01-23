/**
 * Database Migration Script
 * Creates all necessary tables for the Pharmacy Store
 */

const db = require('./database');

async function migrate() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Database Migration - Pharmacy Store                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Categories table created');

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        old_price DECIMAL(10, 2),
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        image TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Products table created');

    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Orders table created');

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        product_name VARCHAR(255)
      )
    `);
    console.log('✓ Order items table created');

    // Create settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        store_name VARCHAR(255) DEFAULT 'صيدلية الشفاء',
        phone VARCHAR(50),
        delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Settings table created');

    // Seed default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@pharmacy.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('✓ Admin user seeded');

    // Seed default settings
    await db.query(`
      INSERT INTO settings (store_name, delivery_fee)
      VALUES ('صيدلية الشفاء', 15.00)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Default settings seeded');

    // Seed default categories
    const categories = [
      { name: 'أدوية الألم', icon: '💊' },
      { name: 'الفيتامينات', icon: '🍊' },
      { name: 'العناية بالبشرة', icon: '🧴' },
      { name: 'أجهزة طبية', icon: '🩺' },
      { name: 'مستلزمات الأطفال', icon: '👶' },
      { name: 'العناية الشخصية', icon: '🧼' }
    ];

    for (const cat of categories) {
      await db.query(`
        INSERT INTO categories (name, icon)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [cat.name, cat.icon]);
    }
    console.log('✓ Default categories seeded');

    // Seed sample products
    const products = [
      { name: 'باراسيتامول 500mg', price: 250, old_price: 320, category: 1, description: 'مسكن للألم وخافض للحرارة', image: '/images/products/paracetamol.png' },
      { name: 'أوميغا 3', price: 1200, old_price: 1500, category: 2, description: 'مكمل غذائي لصحة القلب والدماغ', image: '/images/products/omega3.png' },
      { name: 'كريم ترطيب', price: 850, old_price: 1000, category: 3, description: 'كريم ترطيب عميق للبشرة الجافة', image: '/images/products/cream.png' },
      { name: 'جهاز قياس ضغط', price: 2500, old_price: 3000, category: 4, description: 'جهاز قياس ضغط الدم الرقمي', image: '/images/products/bp-monitor.png' },
      { name: 'فيتامين سي', price: 750, old_price: 900, category: 2, description: 'فيتامين سي 1000mg لتعزيز المناعة', image: '/images/products/vit-c.png' },
      { name: 'إيبوبروفين', price: 350, old_price: 450, category: 1, description: 'مضاد للالتهابات والمسكن', image: '/images/products/ibuprofen.png' },
      { name: 'حليب أطفال', price: 1800, old_price: 2100, category: 5, description: 'حليب للأطفال من عمر سنة', image: '/images/products/baby-milk.png' },
      { name: 'معجون أسنان', price: 450, old_price: 550, category: 6, description: 'معجون أسنان بالفلورايد', image: '/images/products/toothpaste.png' }
    ];

    for (const prod of products) {
      await db.query(`
        INSERT INTO products (name, price, old_price, category_id, description, image)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [prod.name, prod.price, prod.old_price, prod.category, prod.description, prod.image]);
    }
    console.log('✓ Sample products seeded');

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     Migration completed successfully!                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nAdmin Login Credentials:');
    console.log('  Email: admin@pharmacy.com');
    console.log('  Password: admin123');
    console.log('');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrate };
