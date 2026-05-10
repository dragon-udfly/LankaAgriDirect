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
