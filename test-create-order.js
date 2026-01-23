/**
 * Test script to create a test order in the database
 */

const db = require('./database');
const bcrypt = require('bcryptjs');

async function testCreateOrder() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Testing Order Creation                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // Get a user to create order for
        const users = await db.query('SELECT id, name FROM users WHERE role = $1', ['customer']);
        
        if (users.rows.length === 0) {
            console.log('No customer users found. Creating a test user...');
            
            // Create test user
            const hashedPassword = await bcrypt.hash('test123', 10);
            const newUser = await db.query(`
                INSERT INTO users (name, email, password, phone, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, ['عميل تجريبي', 'test@kb-medic.com', hashedPassword, '+213555555555', 'customer']);
            
            console.log('Test user created with ID:', newUser.rows[0].id);
            var userId = newUser.rows[0].id;
        } else {
            var userId = users.rows[0].id;
            console.log('Using existing user:', users.rows[0].name, '(ID:', userId + ')');
        }

        // Get a product
        const products = await db.query('SELECT id, name, price FROM products LIMIT 1');
        
        if (products.rows.length === 0) {
            console.log('No products found. Please run migrate.js first.');
            return;
        }
        
        const product = products.rows[0];
        console.log('Using product:', product.name, '(Price:', product.price, 'دج)');

        // Create order
        console.log('\n1. Creating order...');
        const orderResult = await db.query(`
            INSERT INTO orders (user_id, total, status, customer_name, customer_phone, customer_address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, created_at
        `, [userId, product.price + 300, 'pending', 'عميل تجريبي', '+213555555555', 'عنوان تجريبي']);
        
        const orderId = orderResult.rows[0].id;
        console.log('   ✓ Order created with ID:', orderId);
        console.log('   Created at:', orderResult.rows[0].created_at);

        // Create order item
        console.log('\n2. Creating order item...');
        await db.query(`
            INSERT INTO order_items (order_id, product_id, quantity, price, product_name)
            VALUES ($1, $2, $3, $4, $5)
        `, [orderId, product.id, 1, product.price, product.name]);
        console.log('   ✓ Order item created');

        // Verify order
        console.log('\n3. Verifying order in database...');
        const verifyResult = await db.query(`
            SELECT o.*, 
                (SELECT json_agg(json_build_object('id', oi.id, 'product', oi.product_name, 'qty', oi.quantity, 'price', oi.price))
                 FROM order_items oi WHERE oi.order_id = o.id) as items
            FROM orders o WHERE o.id = $1
        `, [orderId]);
        
        if (verifyResult.rows.length > 0) {
            const order = verifyResult.rows[0];
            console.log('   ✓ Order found in database');
            console.log('   Order ID:', order.id);
            console.log('   Total:', order.total, 'دج');
            console.log('   Status:', order.status);
            console.log('   Items:', JSON.stringify(order.items, null, 2));
        }

        // List all orders
        console.log('\n4. All orders in database:');
        const allOrders = await db.query(`
            SELECT o.id, o.total, o.status, o.customer_name, o.created_at
            FROM orders o
            ORDER BY o.created_at DESC
        `);
        
        allOrders.rows.forEach(order => {
            console.log(`   #${order.id} - ${order.customer_name} - ${order.total} دج - ${order.status}`);
        });

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║     Order creation test completed successfully!           ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

testCreateOrder();
