const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/devpulse';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(mongoUri);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}
