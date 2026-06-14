const mongoose = require('mongoose');
const { connectMongo } = require('./src/config/mongo');
const Category = require('./src/modules/categories/category.model');
const Product = require('./src/modules/products/product.model');
const User = require('./src/modules/auth/auth.model');

async function seedDatabase() {
  try {
    await connectMongo();

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

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

const products = await Product.insertMany([
  {
    externalId: 'intel-i5-12400f',
    title: 'Procesador Intel Core i5-12400F',
    description: 'Procesador de 6 núcleos para gaming y trabajo diario.',
    provider: 'amazon', price: 154.99, originalPrice: 199.99, discount: 23, rating: 4.6,
    available: true, url: 'https://www.amazon.com.mx/dp/B09NPJTDH9', category: 'procesadores',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Intel_Core_i5_logo.svg/320px-Intel_Core_i5_logo.svg.png',
    specs: { cores: 6, threads: 12, baseClock: '2.5GHz', boostClock: '4.4GHz' },
  },
  {
    externalId: 'ryzen-7-7700x',
    title: 'Procesador AMD Ryzen 7 7700X',
    description: 'Procesador de 8 núcleos para gaming y creación de contenido.',
    provider: 'cyberpuerta', price: 259.99, originalPrice: 329.99, discount: 21, rating: 4.7,
    available: true, url: 'https://www.cyberpuerta.mx', category: 'procesadores',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Ryzen_logo.svg/320px-AMD_Ryzen_logo.svg.png',
    specs: { cores: 8, threads: 16, baseClock: '4.5GHz', boostClock: '5.4GHz' },
  },
  {
    externalId: 'asus-tuf-b650',
    title: 'Tarjeta Madre ASUS TUF GAMING B650',
    description: 'Tarjeta madre AM5 preparada para gaming y overclocking.',
    provider: 'mercadolibre', price: 229.0, rating: 4.5,
    available: true, url: 'https://www.mercadolibre.com.mx', category: 'tarjetas-madre',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/ASUS_Logo.svg/320px-ASUS_Logo.svg.png',
    specs: { socket: 'AM5', chipset: 'B650', ramSupport: 'DDR5', formFactor: 'ATX' },
  },
  {
    externalId: 'corsair-vengeance-16gb',
    title: 'Memoria RAM Corsair Vengeance 16GB DDR4',
    description: 'Memoria RAM rápida para gaming y trabajo profesional.',
    provider: 'cyberpuerta', price: 47.99, originalPrice: 69.99, discount: 31, rating: 4.7,
    available: true, url: 'https://www.cyberpuerta.mx', category: 'memoria-ram',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Corsair_logo.svg/320px-Corsair_logo.svg.png',
    specs: { capacity: '16GB', type: 'DDR4', speed: '3200MHz', latency: 'CL16' },
  },
  {
    externalId: 'rtx-4060-gaming',
    title: 'Tarjeta de Video RTX 4060 Gaming',
    description: 'Potente tarjeta gráfica para juegos y edición.',
    provider: 'ddtech', price: 299.90, originalPrice: 349.90, discount: 14, rating: 4.6,
    available: true, url: 'https://www.ddtech.mx', category: 'tarjetas-video',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/320px-NVIDIA_logo.svg.png',
    specs: { chipset: 'NVIDIA RTX 4060', memory: '8GB', type: 'GDDR6' },
  },
  {
    externalId: 'rtx-4070',
    title: 'Tarjeta de Video RTX 4070',
    description: 'GPU de última generación para gaming en 1440p.',
    provider: 'amazon', price: 599.99, rating: 4.6,
    available: true, url: 'https://www.amazon.com.mx', category: 'tarjetas-video',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NVIDIA_logo.svg/320px-NVIDIA_logo.svg.png',
    specs: { memory: '12GB', type: 'GDDR6X' },
  },
  {
    externalId: 'ssd-samsung-1tb',
    title: 'SSD Samsung 980 PRO 1TB NVMe',
    description: 'Almacenamiento ultrarrápido para sistemas y juegos.',
    provider: 'amazon', price: 84.99, originalPrice: 119.95, discount: 29, rating: 4.8,
    available: true, url: 'https://www.amazon.com.mx', category: 'almacenamiento',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png',
    specs: { capacity: '1TB', interface: 'NVMe PCIe 4.0', readSpeed: '7000MB/s' },
  },
  {
    externalId: 'hyperx-alloy',
    title: 'Teclado Mecánico HyperX Alloy FPS',
    description: 'Teclado mecánico compacto con switches rojos.',
    provider: 'cyberpuerta', price: 64.90, originalPrice: 99.90, discount: 35, rating: 4.5,
    available: true, url: 'https://www.cyberpuerta.mx', category: 'teclados',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/HyperX_logo.svg/320px-HyperX_logo.svg.png',
    specs: { layout: 'TKL', switch: 'Red', rgb: true },
  },
  {
    externalId: 'logitech-g502',
    title: 'Mouse Logitech G502 HERO',
    description: 'Mouse gamer con sensor HERO 25K y pesas ajustables.',
    provider: 'amazon', price: 44.99, originalPrice: 69.00, discount: 35, rating: 4.7,
    available: true, url: 'https://www.amazon.com.mx', category: 'mouse',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Logitech_logo.svg/320px-Logitech_logo.svg.png',
    specs: { dpi: '25600', botones: 11, rgb: true },
  },
  {
    externalId: 'samsung-odyssey-g5',
    title: 'Monitor Samsung Odyssey G5 27"',
    description: 'Monitor curvo 144Hz para gaming fluido.',
    provider: 'mercadolibre', price: 249.99, originalPrice: 329.99, discount: 24, rating: 4.6,
    available: true, url: 'https://www.mercadolibre.com.mx', category: 'monitores',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png',
    specs: { refreshRate: '144Hz', resolution: '2560x1440', curve: '1000R' },
  },
  {
    externalId: 'razer-blackshark-v2',
    title: 'Headset Razer BlackShark V2',
    description: 'Audífonos para gaming con sonido THX y micrófono profesional.',
    provider: 'ddtech', price: 64.99, originalPrice: 99.99, discount: 35, rating: 4.6,
    available: true, url: 'https://www.ddtech.mx', category: 'audífonos',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Razer_logo.svg/320px-Razer_logo.svg.png',
    specs: { surround: true, mic: true, weight: '262g' },
  },
  {
    externalId: 'corsair-rm750x',
    title: 'Fuente Corsair RM750x 750W',
    description: 'Fuente modular con certificación 80 Plus Gold.',
    provider: 'amazon', price: 129.99, rating: 4.8,
    available: true, url: 'https://www.amazon.com.mx', category: 'fuentes-poder',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Corsair_logo.svg/320px-Corsair_logo.svg.png',
    specs: { wattage: '750W', modular: true, efficiency: '80+ Gold' },
  },
  {
    externalId: 'nzxt-h510',
    title: 'Gabinete NZXT H510',
    description: 'Gabinete ATX con diseño minimalista y buen flujo de aire.',
    provider: 'mercadolibre', price: 99.5, rating: 4.4,
    available: true, url: 'https://www.mercadolibre.com.mx', category: 'gabinetes',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/NZXT_logo.svg/320px-NZXT_logo.svg.png',
    specs: { formFactor: 'ATX', usb: 'USB-C', color: 'negro' },
  },
  {
    externalId: 'logitech-c920',
    title: 'Webcam Logitech C920',
    description: 'Webcam Full HD para streaming y videoconferencias.',
    provider: 'ddtech', price: 79.99, rating: 4.4,
    available: true, url: 'https://www.ddtech.mx', category: 'accesorios',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Logitech_logo.svg/320px-Logitech_logo.svg.png',
    specs: { resolution: '1080p', mic: true, autofocus: true },
  },
  {
    externalId: 'steelseries-arctis-7',
    title: 'Auriculares SteelSeries Arctis 7',
    description: 'Audífonos inalámbricos con sonido surround.',
    provider: 'ddtech', price: 149.99, rating: 4.5,
    available: true, url: 'https://www.ddtech.mx', category: 'audífonos',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/SteelSeries_Logo.svg/320px-SteelSeries_Logo.svg.png',
    specs: { wireless: true, battery: '24h', mic: true },
  },
]);
    console.log('✅ Productos creados:', products.length);

    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✅ Admin creado: admin@example.com / admin123');
    console.log('🎉 Base de datos poblada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();