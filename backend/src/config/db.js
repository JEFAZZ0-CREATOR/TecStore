// LEGACY MOCK DATA: este archivo ya no se usa en producción.
// Todos los datos ahora deben guardarse en MongoDB mediante los modelos de Mongoose.
module.exports = {
  users: [],
  products: [
    {
      id: 'sample-001',
      title: 'Procesador Intel Core i5 12400F',
      description: 'Procesador de 6 núcleos para gaming y trabajo diario.',
      provider: 'amazon',
      image: 'https://via.placeholder.com/400x300.png?text=Intel+i5',
      price: 179.99,
      rating: 4.6,
      available: true,
      url: 'https://amazon.example.com/product/intel-i5-12400f',
      category: 'procesador',
      specs: { cores: 6, threads: 12, baseClock: '2.5GHz' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-002',
      title: 'Placa madre ASUS TUF GAMING',
      description: 'Tarjeta madre AM5 preparada para gaming y overclocking.',
      provider: 'mercadolibre',
      image: 'https://via.placeholder.com/400x300.png?text=ASUS+TUF',
      price: 229.0,
      rating: 4.5,
      available: true,
      url: 'https://mercadolibre.example.com/product/asus-tuf-gaming',
      category: 'placa madre',
      specs: { socket: 'AM5', chipset: 'B650', ramSupport: 'DDR5' },
      createdAt: new Date().toISOString(),
    },
  ],
  categories: [
    { id: 'category-001', name: 'Procesadores', slug: 'procesadores', createdAt: new Date().toISOString() },
    { id: 'category-002', name: 'Tarjetas madre', slug: 'tarjetas-madre', createdAt: new Date().toISOString() },
    { id: 'category-003', name: 'Memoria RAM', slug: 'memoria-ram', createdAt: new Date().toISOString() },
  ],
  reviews: [],
  favorites: [],
  priceHistory: [],
};
