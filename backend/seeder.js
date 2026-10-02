const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');

dotenv.config();

const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const customLookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, options, callback);
    }
    if (options && options.all) {
      return callback(
        null,
        addresses.map((address) => ({ address, family: 4 }))
      );
    }
    return callback(null, addresses[0], 4);
  });
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      lookup: customLookup,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Seeder] Connected to MongoDB Atlas...');

    // Clear existing collections
    await Claim.deleteMany();
    await Item.deleteMany();
    await User.deleteMany();
    console.log('[Seeder] Cleared previous records.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: 'admin@sliit.lk',
      password: 'admin123', // Will be hashed via pre-save hook
      isAdmin: true,
    });

    const student1 = await User.create({
      name: 'Avishka Sahan',
      email: 'student@sliit.lk',
      password: 'student123',
      isAdmin: false,
    });

    const student2 = await User.create({
      name: 'Kasun Perera',
      email: 'kasun@my.sliit.lk',
      password: 'kasun123',
      isAdmin: false,
    });

    console.log('[Seeder] Users seeded:');
    console.log(' - Admin: admin@sliit.lk / admin123');
    console.log(' - Student: student@sliit.lk / student123');
    console.log(' - Student 2: kasun@my.sliit.lk / kasun123');

    // 2. Create Sample Items
    const item1 = await Item.create({
      title: 'Black Samsung Galaxy S23',
      description: 'Found on table 14 near the silent study area. Black case with a SLIIT sticker on the back.',
      category: 'Electronics',
      location: 'Main Library - 2nd Floor',
      dateReported: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      itemType: 'Found',
      image: '',
      status: 'Active',
      reportedBy: adminUser._id,
    });

    const item2 = await Item.create({
      title: 'Dell 65W Type-C Laptop Charger',
      description: 'Black Dell original USB-C power adapter found plugged in by the corner desk.',
      category: 'Electronics',
      location: 'Computing Building Lab 04',
      dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      itemType: 'Found',
      image: '',
      status: 'Active',
      reportedBy: student1._id,
    });

    const item3 = await Item.create({
      title: 'Brown Leather Men\'s Wallet',
      description: 'Lost my wallet containing student ID card, national identity card, and some cash. Urgent!',
      category: 'Accessories',
      location: 'Student Cafeteria',
      dateReported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      itemType: 'Lost',
      image: '',
      status: 'Active',
      reportedBy: student2._id,
    });

    const item4 = await Item.create({
      title: 'Casio fx-991EX Scientific Calculator',
      description: 'Found black and white scientific calculator with handwritten name "K.P." on back cover.',
      category: 'Electronics',
      location: 'Auditorium Hall B',
      dateReported: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      itemType: 'Found',
      image: '',
      status: 'Active',
      reportedBy: adminUser._id,
    });

    const item5 = await Item.create({
      title: 'SLIIT Student ID Card (IT21004523)',
      description: 'Blue SLIIT ID card found near the main security barrier.',
      category: 'Documents',
      location: 'Main Security Gate',
      dateReported: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      itemType: 'Found',
      image: '',
      status: 'Active',
      reportedBy: adminUser._id,
    });

    console.log('[Seeder] Sample items seeded.');

    // 3. Create Sample Claims
    await Claim.create({
      itemId: item4._id,
      userId: student2._id,
      message: 'This is my calculator! My initials K.P. are written on the back cover with a silver marker.',
      claimDate: new Date(),
      status: 'Pending',
    });

    console.log('[Seeder] Sample claim seeded.');
    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
    process.exit(1);
  }
};

seedData();
