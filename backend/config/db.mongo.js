const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tienda_productos';
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    throw err;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

module.exports = connectMongo;
