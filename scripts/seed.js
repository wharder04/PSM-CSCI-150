import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('Missing MONGO_URI');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Seeding...');

    await User.deleteMany({});
    await User.insertMany([
      { name: 'Alice Example', email: 'alice@example.com' },
      { name: 'Bob Example', email: 'bob@example.com' },
    ]);

    console.log('Seed complete.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
