const mongoose = require('mongoose');
const { connectMongo } = require('./src/config/mongo');
const Category = require('./src/modules/categories/category.model');
const Product = require('./src/modules/products/product.model');
const User = require('./src/modules/auth/auth.model');

async function seedDatabase() {
  try {
    await connectMongo();

    // Limpiar datos existentes
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Crear categorías
    const categories = await Category.insertMany([
      { name: 'Procesadores', slug: 'procesadores' },
      { name: 'Tarjetas Madre', slug: 'tarjetas-madre' },
      { name: 'Memoria RAM', slug: 'memoria-ram' },
      { name: 'Tarjetas de Video', slug: 'tarjetas-video' },
      { name: 'Almacenamiento', slug: 'almacenamiento' },
      { name: 'Fuentes de Poder', slug: 'fuentes-poder' },
      { name: 'Gabinetes', slug: 'gabinetes' },
      { name: 'Refrigeración', slug: 'refrigeracion' },
    ]);

    console.log('✅ Categorías creadas:', categories.length);

    // Crear productos de ejemplo
    const products = await Product.insertMany([
      {
        externalId: 'intel-i5-12400f',
        title: 'Procesador Intel Core i5-12400F',
        description: 'Procesador de 6 núcleos para gaming y trabajo diario.',
        provider: 'amazon',
        image: 'https://via.placeholder.com/400x300.png?text=Intel+i5',
        price: 179.99,
        rating: 4.6,
        stock: 50,
        available: true,
        url: 'https://amazon.example.com/product/intel-i5-12400f',
        category: 'procesadores',
        specs: { cores: 6, threads: 12, baseClock: '2.5GHz', boostClock: '4.4GHz' },
      },
      {
        externalId: 'asus-tuf-b650',
        title: 'Tarjeta Madre ASUS TUF GAMING B650',
        description: 'Tarjeta madre AM5 preparada para gaming y overclocking.',
        provider: 'mercadolibre',
        image: 'https://via.placeholder.com/400x300.png?text=ASUS+TUF',
        price: 229.0,
        rating: 4.5,
        stock: 30,
        available: true,
        url: 'https://mercadolibre.example.com/product/asus-tuf-b650',
        category: 'tarjetas-madre',
        specs: { socket: 'AM5', chipset: 'B650', ramSupport: 'DDR5', formFactor: 'ATX' },
      },
      {
        externalId: 'corsair-vengeance-16gb',
        title: 'Memoria RAM Corsair Vengeance 16GB DDR4',
        description: 'Memoria RAM rápida para gaming y trabajo profesional.',
        provider: 'cyberpuerta',
        image: 'https://via.placeholder.com/400x300.png?text=Corsair+RAM',
        price: 69.99,
        rating: 4.7,
        stock: 100,
        available: true,
        url: 'https://cyberpuerta.example.com/product/corsair-vengeance-16gb',
        category: 'memoria-ram',
        specs: { capacity: '16GB', type: 'DDR4', speed: '3200MHz', latency: 'CL16' },
      },
      {
        externalId: 'rtx-4060-gaming',
        title: 'Tarjeta de Video RTX 4060 Gaming',
        description: 'Potente tarjeta gráfica para juegos y edición.',
        provider: 'ddtech',
        image: 'https://via.placeholder.com/400x300.png?text=RTX+4060',
        price: 349.9,
        rating: 4.6,
        stock: 20,
        available: true,
        url: 'https://ddtech.example.com/product/rtx-4060-gaming',
        category: 'tarjetas-video',
        specs: { chipset: 'NVIDIA RTX 4060', memory: '8GB', type: 'GDDR6', interface: 'PCIe 4.0' },
      },
      {
        externalId: 'ssd-samsung-1tb',
        title: 'SSD Samsung 980 PRO 1TB NVMe',
        description: 'Almacenamiento ultrarrápido para sistemas y juegos.',
        provider: 'amazon',
        image: 'https://via.placeholder.com/400x300.png?text=Samsung+SSD',
        price: 119.95,
        rating: 4.8,
        stock: 75,
        available: true,
        url: 'https://amazon.example.com/product/samsung-980-pro-1tb',
        category: 'almacenamiento',
        specs: { capacity: '1TB', interface: 'NVMe PCIe 4.0', readSpeed: '7000MB/s', writeSpeed: '5100MB/s' },
      },
    ]);

    console.log('✅ Productos creados:', products.length);

    // Crear usuario admin de ejemplo
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✅ Usuario admin creado:', adminUser.email);

    console.log('🎉 Base de datos poblada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${products.length} productos`);
    console.log(`   - 1 usuario admin`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

seedDatabase();