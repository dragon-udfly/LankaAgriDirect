// MongoDB initialization script
// Runs once when the container is first created (before the backend starts).
// Password 'admin123' hashed with BCrypt cost=10 — verifiable by Spring's BCryptPasswordEncoder.

db = db.getSiblingDB('lankaagridirect_db');

if (db.admins.countDocuments({ username: 'admin' }) === 0) {
    db.admins.insertOne({
        name: 'System Admin',
        username: 'admin',
        // BCrypt hash of 'admin123' (cost factor 10)
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNMpOeNNK',
        isDeleted: false,
        createdAt: new Date(),
        modifiedAt: new Date()
    });
    print('>>> SEEDER: Default admin document created. Username: admin / Password: admin123');
} else {
    print('>>> SEEDER: Admin document already exists. Skipping.');
}

// Create sample producers for demo purposes
if (db.producers.countDocuments({ verificationStatus: 'verified' }) === 0) {
    const producers = [
        {
            firstName: 'Kamal',
            lastName: 'Perera',
            nic: '950123456789',
            businessPhone: '+94711234567',
            email: 'kamal@farm.com',
            storeTitle: "Kamal's Fresh Farm",
            district: 'Colombo',
            province: 'Western',
            verificationStatus: 'verified',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNMpOeNNK',
            latitude: 6.9271,
            longitude: 80.7744,
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            firstName: 'Nirmala',
            lastName: 'Silva',
            nic: '960234567890',
            businessPhone: '+94722345678',
            email: 'nirmala@herbs.com',
            storeTitle: 'Herbal Garden Sri Lanka',
            district: 'Kandy',
            province: 'Central',
            verificationStatus: 'verified',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNMpOeNNK',
            latitude: 7.2906,
            longitude: 80.6337,
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            firstName: 'Rahul',
            lastName: 'Jayasinghe',
            nic: '970345678901',
            businessPhone: '+94733456789',
            email: 'rahul@fruits.com',
            storeTitle: 'Tropical Fruits Ltd',
            district: 'Galle',
            province: 'Southern',
            verificationStatus: 'verified',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNMpOeNNK',
            latitude: 6.0367,
            longitude: 80.2167,
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        }
    ];
    
    const result = db.producers.insertMany(producers);
    print('>>> SEEDER: ' + result.insertedIds.length + ' sample producers created.');
    
    // Create sample products linked to producers
    const producerIds = result.insertedIds;
    const products = [
        // Kamal's products
        {
            producerId: producerIds[0].toString(),
            name: 'Fresh Tomatoes',
            category: 'Vegetables',
            description: 'Ripe red tomatoes, harvested daily',
            unitPrice: 150,
            unitType: 'kg',
            imageUrls: ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            producerId: producerIds[0].toString(),
            name: 'Carrots',
            category: 'Vegetables',
            description: 'Organic carrots, fresh from the field',
            unitPrice: 120,
            unitType: 'kg',
            imageUrls: ['https://images.unsplash.com/photo-1447931601403-0c6688bcf566?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            producerId: producerIds[0].toString(),
            name: 'Lettuce Bundle',
            category: 'Vegetables',
            description: 'Fresh crispy lettuce bundles',
            unitPrice: 100,
            unitType: 'bundle',
            imageUrls: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        // Nirmala's herbal products
        {
            producerId: producerIds[1].toString(),
            name: 'Curry Leaves Fresh',
            category: 'Herbal Products',
            description: 'Fresh picked curry leaves, perfect for cooking',
            unitPrice: 80,
            unitType: 'bunch',
            imageUrls: ['https://images.unsplash.com/photo-1596040299577-d85e45d03d49?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            producerId: producerIds[1].toString(),
            name: 'Mint Leaves',
            category: 'Herbal Products',
            description: 'Organic mint leaves for beverages and cooking',
            unitPrice: 60,
            unitType: 'pack',
            imageUrls: ['https://images.unsplash.com/photo-1599050775049-2e39a94ba385?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        // Rahul's fruits
        {
            producerId: producerIds[2].toString(),
            name: 'Mangoes Premium',
            category: 'Fruits',
            description: 'Sweet golden mangoes, perfect ripeness',
            unitPrice: 200,
            unitType: 'kg',
            imageUrls: ['https://images.unsplash.com/photo-1585518419759-159340a38d23?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            producerId: producerIds[2].toString(),
            name: 'Bananas Yellow',
            category: 'Fruits',
            description: 'Fresh bananas, yellow and ripe',
            unitPrice: 90,
            unitType: 'kg',
            imageUrls: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        },
        {
            producerId: producerIds[2].toString(),
            name: 'Papaya Orange',
            category: 'Fruits',
            description: 'Sweet and juicy papayas',
            unitPrice: 140,
            unitType: 'kg',
            imageUrls: ['https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=400'],
            isSoldOut: false,
            productStatus: 'active',
            isDeleted: false,
            createdAt: new Date(),
            modifiedAt: new Date()
        }
    ];
    
    const productResult = db.products.insertMany(products);
    print('>>> SEEDER: ' + productResult.insertedIds.length + ' sample products created.');
} else {
    print('>>> SEEDER: Sample data already exists. Skipping.');
}
