const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding scraped cafes...')

  // Get or create an admin user
  let user = await prisma.user.findFirst({
    where: { role: 'admin' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'password123',
        name: 'Administrator',
        role: 'admin'
      }
    })
  }

  const scrapedCafes = [
    {"nama": "Brain Coffee Surabaya", "menu_harga": "Salted Popcorn Caramel Latte Rp25.000 | Ichigo Lavender Latte Rp25.000 | Americano Rp18.000 | Flat White Rp22.000 | Asian Beef Spices Rp35.000 | Summer Beef Balinese Sambal Matah Rp38.000 | Beef Caesar Salad Rp32.000 | Pastry & Cake Rp15.000-25.000", "fasilitas": "WiFi, Colokan Listrik, Indoor, Outdoor, Parkir Motor, Toilet, Manual Brew Bar", "alamat": "Jl. Wonokromo Tangkis No.52, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243", "kecamatan": "Wonokromo", "kelurahan": "Wonokromo", "foto": "brain_coffee_surabaya.jpg", "longitude": 112.7319984, "latitude": -7.3029544},
    {"nama": "VERTE Café", "menu_harga": "Iced Cappuccino Rp28.000 | Chocolate Cake Flourless Rp35.000 | Gyoza Rp30.000 | BBQ Cauliflower Rp32.000 | Pad Kra Pao Rp38.000 | Korean Salad Rp33.000 | Truffle Carbonara Rp45.000 | Roojak Smoothie Rp28.000 | Mushroom Soup Rp30.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Toilet Bersih, Colokan Listrik, Menu Vegetarian/Vegan", "alamat": "Jl. Jambi No.47, Darmo, Kec. Wonokromo, Surabaya, Jawa Timur 60241", "kecamatan": "Wonokromo", "kelurahan": "Darmo", "foto": "verte_cafe.jpg", "longitude": 112.7321814, "latitude": -7.2908503},
    {"nama": "LITTLE CAVE Hidden Coffee Bar", "menu_harga": "Iced Japanese Coffee Rp22.000 | Iced Latte Rp20.000 | Split Shot Rp23.000 | Little Berry Blossom Rp25.000 | Homemade Syrup Drinks Rp18.000-22.000 | Snacks Rp10.000-18.000", "fasilitas": "WiFi, Indoor, Cozy Atmosphere, Toilet, Homemade Syrup, Specialty Coffee", "alamat": "Jl. Kutai No.23B, Darmo, Kec. Wonokromo, Surabaya, Jawa Timur 60241", "kecamatan": "Wonokromo", "kelurahan": "Darmo", "foto": "little_cave_coffee.jpg", "longitude": 112.7350497, "latitude": -7.290993},
    {"nama": "Roshe Coffee", "menu_harga": "Iced Latte Rp20.000 | Chocolate Hazelnut Rp25.000 | Americano Rp18.000 | Espresso Rp15.000 | Non-Coffee Drinks Rp18.000-25.000", "fasilitas": "WiFi, Indoor, Outdoor, Dekat Stasiun Wonokromo, Parkir Motor, Toilet", "alamat": "Jl. Jagir Wonokromo No.39, Jagir, Kec. Wonokromo, Surabaya, Jawa Timur 60244", "kecamatan": "Wonokromo", "kelurahan": "Jagir", "foto": "roshe_coffee.jpg", "longitude": 112.7382266, "latitude": -7.3004108},
    {"nama": "Omah Rakjat", "menu_harga": "Choco Coffee Rp20.000 | Kopi Susu Gula Aren Rp22.000 | Manual Brew Rp25.000-35.000 | Non-Coffee Rp18.000-25.000 | Snack & Light Meals Rp15.000-30.000", "fasilitas": "WiFi, Indoor, Outdoor, Koleksi Buku, Colokan Listrik, Toilet, Suasana Vintage", "alamat": "Jl. Gayung Kebonsari VIII No.38, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60235", "kecamatan": "Gayungan", "kelurahan": "Ketintang", "foto": "omah_rakjat.jpg", "longitude": 112.7238420, "latitude": -7.326637},
    {"nama": "Teman Setia", "menu_harga": "Teh Tarik Rp15.000 | Clay Pot Chicken Rice Rp35.000 | Chicken Porridge Rp25.000 | Kopi Susu Rp18.000 | Milo Butter Rp20.000 | Nasi Campur Rp28.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Parkir Luas, Open 24 Jam, QR Payment, Toilet", "alamat": "Jl. Gayung Kebonsari No.35, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60235", "kecamatan": "Gayungan", "kelurahan": "Ketintang", "foto": "teman_setia.jpg", "longitude": 112.7211016, "latitude": -7.3286232},
    {"nama": "The Rocketman Coffee Gayungan", "menu_harga": "Toblerone Coffee Rp22.000 | Kopi Susu Rp18.000 | Americano Rp16.000 | Non-Coffee Rp18.000-25.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Co-working Space, Lokasi Strategis, Toilet, Colokan Listrik", "alamat": "Jl. Ketintang Baru Sel. I No.3 Blok A3, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60231", "kecamatan": "Gayungan", "kelurahan": "Ketintang", "foto": "rocketman_coffee_gayungan.jpg", "longitude": 112.7267410, "latitude": -7.3243466},
    {"nama": "EKNOR COFFEE & EATERY", "menu_harga": "Burger Rp30.000-40.000 | Kopi Susu Rp20.000 | Non-Coffee Rp18.000-25.000 | Makanan Unik Rp25.000-45.000 | Snacks Rp15.000-25.000", "fasilitas": "WiFi, Indoor, Outdoor, AC, Toilet, Parkir, Suasana Homey, No Tax", "alamat": "Jl. Gayungsari Tim. No.09, Menanggal, Kec. Gayungan, Surabaya, Jawa Timur 60234", "kecamatan": "Gayungan", "kelurahan": "Menanggal", "foto": "eknor_coffee.jpg", "longitude": 112.7227448, "latitude": -7.338503},
    {"nama": "LIGHTHOUSE", "menu_harga": "Specialty Coffee Rp25.000-35.000 | Mango Squash Rp22.000 | Non-Coffee Rp20.000-30.000 | Snacks Rp15.000-25.000", "fasilitas": "WiFi, Rooftop, Indoor, Outdoor, View Kota, Toilet, Live Music", "alamat": "Ruko Grand Ketintang, Jl. Ketintang Baru I 16 H, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60231", "kecamatan": "Gayungan", "kelurahan": "Ketintang", "foto": "lighthouse_cafe.jpg", "longitude": 112.7314216, "latitude": -7.3183726},
    {"nama": "BARA CAFE", "menu_harga": "Bara Latte Rp25.000 | Mochalatte Rp25.000 | Carbonara Pasta Rp38.000 | Nasi Sambal Bawang Rp28.000 | Crispy Chicken Rp32.000 | Smoke Beef Teriyaki Rp35.000", "fasilitas": "WiFi, Indoor, Outdoor (View Masjid Al-Akbar), Musholla, Toilet Bersih, Parkir Luas, Lantai 2", "alamat": "Jl. Masjid Al-Akbar Utara No.1, Pagesangan, Kec. Jambangan, Surabaya, Jawa Timur 60232", "kecamatan": "Jambangan", "kelurahan": "Pagesangan", "foto": "bara_cafe.jpg", "longitude": 112.7162828, "latitude": -7.3350740},
    {"nama": "Baradjawa Coffee - Gayungsari", "menu_harga": "Cappuccino Fresh Beans Rp22.000 | V60 Rp28.000-40.000 | Kopi Susu Rp20.000 | Rumaja Rp22.000 | Caramel Latte Rp25.000 | Manual Brew Nusantara Rp28.000-45.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Outdoor, Arsitektur Jawa Modern, Colokan Listrik, Toilet, Specialty Beans Nusantara", "alamat": "Jl. Gayungsari Bar. II No.12, Pagesangan, Kec. Jambangan, Surabaya, Jawa Timur 60233", "kecamatan": "Jambangan", "kelurahan": "Pagesangan", "foto": "baradjawa_coffee.jpg", "longitude": 112.7181276, "latitude": -7.3314452},
    {"nama": "RUMATADA DISTRICT", "menu_harga": "Tada Kopi Rp22.000 | Caramel Latte Rp25.000 | Mawar Segar (Rose Soda) Rp20.000 | Non-Coffee Rp18.000-28.000 | Snacks Rp10.000-22.000", "fasilitas": "WiFi, Indoor, Colokan Listrik, Event Space, WFC-Friendly, Toilet, Komunitas Kreatif", "alamat": "Jl. Taman Jambangan Indah II No.1, Jambangan, Kec. Jambangan, Surabaya, Jawa Timur 60232", "kecamatan": "Jambangan", "kelurahan": "Jambangan", "foto": "rumatada_district.jpg", "longitude": 112.7157552, "latitude": -7.3184835},
    {"nama": "Bring In Coffee & Eatery", "menu_harga": "Kopi Susu Rp22.000 | Americano Rp18.000 | Snacks Rp15.000-25.000 | Main Meals Rp28.000-45.000 | Non-Coffee Rp18.000-28.000", "fasilitas": "WiFi, Indoor, Outdoor, Lantai 2, Live Music (Sabtu malam), Colokan Listrik, Toilet, Parkir", "alamat": "Jl. Sidosermo Indah No.5, Sidosermo, Kec. Wonocolo, Surabaya, Jawa Timur 60239", "kecamatan": "Wonocolo", "kelurahan": "Sidosermo", "foto": "bring_in_coffee.jpg", "longitude": 112.7579449, "latitude": -7.308955},
    {"nama": "ATMA COFFEE", "menu_harga": "Espresso Rp6.000 | Kopi Susu Rp15.000-20.000 | Cheesecake Rp20.000 | Cookies Rp10.000 | Non-Coffee Rp12.000-18.000", "fasilitas": "WiFi, Indoor, Rooftop Sky View, Toilet, High Ceiling, Vape & Smoke Friendly", "alamat": "Jl. Siwalankerto Sel. No.4, Siwalankerto, Kec. Wonocolo, Surabaya, Jawa Timur 60234", "kecamatan": "Wonocolo", "kelurahan": "Siwalankerto", "foto": "atma_coffee.jpg", "longitude": 112.7371997, "latitude": -7.3400942},
    {"nama": "Jiakopi ATAS", "menu_harga": "Kopi Tarik Rp21.000 | Teh Tarik Rp18.000 | Milo Butter Rp22.000 | Nasi Campur Rp28.000 | Indomie Goreng Rp15.000 | Aneka Minuman Asia Rp18.000-28.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Toilet, Parkir, Dekorasi Chinese-Asian, Open 24 Jam (Weekend)", "alamat": "Jl. Raya Jemursari No.151, Jemur Wonosari, Kec. Wonocolo, Surabaya, Jawa Timur 60299", "kecamatan": "Wonocolo", "kelurahan": "Jemur Wonosari", "foto": "jiakopi_atas.jpg", "longitude": 112.7472763, "latitude": -7.3198665},
    {"nama": "Fore Coffee - Raya Jemursari", "menu_harga": "Kopi Susu Rp22.000 | Americano Rp18.000 | Matcha Latte Rp25.000 | Pistachio Series Rp28.000 | Snacks & Pastry Rp15.000-28.000", "fasilitas": "WiFi, AC, Indoor, Spacious, WFC-Friendly, Colokan Listrik, Toilet", "alamat": "Jl. Raya Jemursari, Jemur Wonosari, Kec. Wonocolo, Surabaya, Jawa Timur 60237", "kecamatan": "Wonocolo", "kelurahan": "Jemur Wonosari", "foto": "fore_coffee_jemursari.jpg", "longitude": 112.7441072, "latitude": -7.3223575},
    {"nama": "Ada Apa Dengan Kopi (AADK Wiyung)", "menu_harga": "Caramel Latte Rp22.000 | Mango Drink Rp20.000 | Mentai Chicken Rp35.000 | Kopi Susu Rp18.000 | Snacks & Pastry Rp12.000-28.000 | Non-Coffee Rp18.000-25.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Lantai 2, Colokan Listrik di Setiap Meja, Toilet, Photo Box, Parkir", "alamat": "Jl. Raya Menganti Karangan No.85, Babatan, Kec. Wiyung, Surabaya, Jawa Timur 60227", "kecamatan": "Wiyung", "kelurahan": "Babatan", "foto": "aadk_wiyung.jpg", "longitude": 112.6814387, "latitude": -7.3107785},
    {"nama": "RING Coffee & Eatery", "menu_harga": "Cold Coffee Rp22.000-32.000 | Kopi Susu Rp20.000 | Main Meals Rp28.000-50.000 | Snacks Rp15.000-28.000 | Non-Coffee Rp18.000-28.000", "fasilitas": "WiFi, AC (Cold), Indoor, Outdoor, Parkir Gratis, Live Music, Instagrammable, Toilet", "alamat": "Jl. Raya Wiyung No.122, Wiyung, Kec. Wiyung, Surabaya, Jawa Timur 60228", "kecamatan": "Wiyung", "kelurahan": "Wiyung", "foto": "ring_coffee_eatery.jpg", "longitude": 112.6978270, "latitude": -7.3135327},
    {"nama": "TOMORO COFFEE - Wiyung", "menu_harga": "Peach Oolong Milk Tea Rp25.000 | Sea Salt Cloud Chocolate Rp27.000 | Kopi Susu Rp20.000 | Matcha Series Rp22.000-28.000 | Non-Coffee Rp18.000-28.000", "fasilitas": "WiFi, AC, Indoor, Parkir, Toilet, Colokan Listrik, Lokasi Strategis Pinggir Jalan", "alamat": "Jl. Raya Wiyung No.411, Wiyung, Kec. Wiyung, Surabaya, Jawa Timur 60228", "kecamatan": "Wiyung", "kelurahan": "Wiyung", "foto": "tomoro_coffee_wiyung.jpg", "longitude": 112.6902696, "latitude": -7.3129813},
    {"nama": "coffee e", "menu_harga": "Cappuccino 100% Arabica Rp22.000 | Matcha Blossom Rp25.000 | Pistachio Latte Rp28.000 | Cold Brew Rp25.000 | Butter Croissant Rp18.000 | Chocogato Rp20.000 | Milo Cream Rp20.000", "fasilitas": "WiFi, Indoor, Outdoor, Lantai 2 (Sofa), VIP Room (Karaoke), Parkir Mobil & Motor Gratis, Toilet", "alamat": "Jl. Raya Babatan Pratama Gang 4 Blok C No.6, Babatan, Kec. Wiyung, Surabaya, Jawa Timur 60227", "kecamatan": "Wiyung", "kelurahan": "Babatan", "foto": "coffee_e_babatan.jpg", "longitude": 112.6868203, "latitude": -7.3139979},
    {"nama": "Bogota Kopi", "menu_harga": "Kopi Klepon Rp20.000 | Kopi Susu Rp18.000 | Americano Rp15.000 | Non-Coffee Rp15.000-22.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Outdoor, Toilet, Parkir, Suasana Santai, Harga Terjangkau", "alamat": "Jl. Babatan No.05, Babatan, Kec. Wiyung, Surabaya, Jawa Timur 60227", "kecamatan": "Wiyung", "kelurahan": "Babatan", "foto": "bogota_kopi.jpg", "longitude": 112.6755179, "latitude": -7.3091556},
    {"nama": "La Scala Coffee Wiyung", "menu_harga": "Matcha Latte Rp28.000 | Kopi Susu Rp22.000 | Specialty Coffee Rp25.000-40.000 | Nasi Timbel Rp35.000 | Sayur Asem Rp20.000 | Non-Coffee Rp20.000-30.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Parkir Luas, Toilet, Satu Gedung dgn Goela Aren Restaurant", "alamat": "Jl. Raya Wiyung, Babatan, Kec. Wiyung, Surabaya, Jawa Timur 60227", "kecamatan": "Wiyung", "kelurahan": "Babatan", "foto": "la_scala_coffee.jpg", "longitude": 112.6774798, "latitude": -7.3101033},
    {"nama": "D'Coffee Cup Wiyung", "menu_harga": "Kopi Susu Rp18.000 | Americano Rp15.000 | Full Meals Rp20.000-40.000 | Non-Coffee Rp15.000-25.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Outdoor, Open 24 Jam, Toilet, Parkir, Harga Terjangkau", "alamat": "Jl. Lidah Wetan, Kec. Lakarsantri, Surabaya, Jawa Timur 60213", "kecamatan": "Lakarsantri", "kelurahan": "Lidah Wetan", "foto": "dcoffee_cup_wiyung.jpg", "longitude": 112.6733516, "latitude": -7.308505},
    {"nama": "Han's Coffee Surabaya", "menu_harga": "Kopi Susu Rp20.000 | Americano Rp18.000 | Specialty Coffee Rp22.000-35.000 | Snacks Rp12.000-25.000 | Non-Coffee Rp18.000-25.000", "fasilitas": "WiFi, Indoor, Co-working Space, Toilet, Parkir Motor, Suasana Homey", "alamat": "Jl. Griya Kebraon Sel. V No.1, Kebraon, Kec. Karangpilang, Surabaya, Jawa Timur 60222", "kecamatan": "Karangpilang", "kelurahan": "Kebraon", "foto": "hans_coffee.jpg", "longitude": 112.6999979, "latitude": -7.3313963},
    {"nama": "Uala Kopi", "menu_harga": "Kopi Susu Rp18.000 | Americano Rp15.000 | Snacks Rp10.000-20.000 | Non-Coffee Rp15.000-22.000 | Minuman Segar Rp18.000-25.000", "fasilitas": "WiFi, Indoor, Outdoor, Banyak Tanaman, Konsep Rustic, Parkir Motor, Toilet, Suasana Alam", "alamat": "Jl. Raya Mastrip Gg. Kutilang No.10, Karang Pilang, Kec. Karangpilang, Surabaya, Jawa Timur 60221", "kecamatan": "Karangpilang", "kelurahan": "Karang Pilang", "foto": "uala_kopi.jpg", "longitude": 112.6953377, "latitude": -7.3425813},
    {"nama": "Glossus Coffee", "menu_harga": "Salted Caramel Coffee Rp22.000 | Kopi Susu Rp18.000 | Specialty Coffee Rp22.000-35.000 | Makanan Rp25.000-40.000 | Snacks Rp12.000-22.000", "fasilitas": "WiFi, Indoor, Lantai 2, Toilet (2 unit), Parkir Motor, Bersih, Colokan Listrik", "alamat": "Jl. Kebraon II No.128, Kebraon, Kec. Karangpilang, Surabaya, Jawa Timur 60222", "kecamatan": "Karangpilang", "kelurahan": "Kebraon", "foto": "glossus_coffee.jpg", "longitude": 112.6993355, "latitude": -7.3351601},
    {"nama": "Coffee Mastery Cafe (CoMa Cafe)", "menu_harga": "Iced Caramel Latte Rp22.000 | Iced Caramel Macchiato Rp25.000 | Cappuccino Rp20.000 | Pisang Coklat Keju Rp18.000 | Snack Platter Rp30.000 | Non-Coffee Rp18.000-25.000", "fasilitas": "WiFi, AC, Indoor, Sofa Nyaman, Toilet, Parkir, Harga Terjangkau, Cocok untuk WFC", "alamat": "Jl. Gn. Sari Indah No.K-9, Kedurus, Kec. Karangpilang, Surabaya, Jawa Timur 60223", "kecamatan": "Karangpilang", "kelurahan": "Kedurus", "foto": "coma_cafe.jpg", "longitude": 112.7047716, "latitude": -7.3175798},
    {"nama": "Tepi Ranu Coffee", "menu_harga": "Kopi Susu Rp18.000 | Americano Rp15.000 | Specialty Coffee Rp20.000-35.000 | Non-Coffee Rp15.000-25.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Outdoor, Toilet, Parkir, Suasana Cozy, Harga Terjangkau", "alamat": "Jl. Ksatria No.37, Karang Pilang, Kec. Karangpilang, Surabaya, Jawa Timur 60221", "kecamatan": "Karangpilang", "kelurahan": "Karang Pilang", "foto": "tepi_ranu_coffee.jpg", "longitude": 112.6950234, "latitude": -7.3395244},
    {"nama": "Rustic Market Forest Tree", "menu_harga": "Zero Osmanthus Rp28.000 | Signature Drink Rp25.000-35.000 | Main Meals Rp35.000-75.000 | Kopi Susu Rp22.000 | Non-Coffee Rp20.000-35.000 | Min. Spend Weekend Rp100.000/orang", "fasilitas": "WiFi, Indoor, Outdoor (Alam & Pepohonan), Live Music, Live Goose, Banyak Spot Foto, Parkir Luas, Toilet, Musholla", "alamat": "Jl. Golf 1 Surabaya No.159A, Gn. Sari, Kec. Dukuhpakis, Surabaya, Jawa Timur 60224", "kecamatan": "Dukuh Pakis", "kelurahan": "Gunung Sari", "foto": "rustic_market_forest_tree.jpg", "longitude": 112.7132605, "latitude": -7.3052095},
    {"nama": "Common Grounds - Graha Famili", "menu_harga": "Nasi Goreng Cabe Ijo Rp42.000 | Hainanese Chicken Rice Rp38.000 | OG Cheeseburger Rp45.000 | Fish & Chips Rp48.000 | Ceremonial Matcha Latte Rp35.000 | Gibraltar Coffee Rp30.000 | Shakshuka Rp55.000", "fasilitas": "WiFi, AC, Indoor, Outdoor (View Golf), Parkir Luas, Toilet, Colokan Listrik, Buka Pagi", "alamat": "Jl. Raya Golf Graha Famili Bundaran Blok I, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur 60226", "kecamatan": "Dukuh Pakis", "kelurahan": "Pradahkalikendal", "foto": "common_grounds_graha_famili.jpg", "longitude": 112.6856682, "latitude": -7.2914316},
    {"nama": "Expat. Roasters Graha Famili", "menu_harga": "V60 & Filter Coffee Rp28.000-45.000 | Matcha Tiramisu Rp38.000 | Cheesecake Rp35.000 | Croissant Rp22.000 | Spaghetti Rp48.000 | Kopi Susu Rp25.000 | Watermelon Cake Rp35.000", "fasilitas": "WiFi, AC, Indoor, Lantai 2, Drive-Through, Elevator, Parkir Luas, Toilet, Buka Pagi", "alamat": "Jl. Raya Graha Famili Tim. No.15 PS 15, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur 60225", "kecamatan": "Dukuh Pakis", "kelurahan": "Pradahkalikendal", "foto": "expat_roasters_graha_famili.jpg", "longitude": 112.6974452, "latitude": -7.2995694},
    {"nama": "Redback Specialty Coffee - Graha Famili", "menu_harga": "Specialty Coffee Rp30.000-55.000 | Croissant Rp22.000 | Carbonara Beef Pasta Rp48.000 | Salad Rp38.000 | Teriyaki Beef Hamburg Rp45.000 | Mixed Berries Smoothie Rp32.000 | Pastry Rp18.000-30.000", "fasilitas": "WiFi, AC, Indoor, Outdoor (View Lapangan Golf), Roastery In-House, Bakery, Drive-Through, Parkir Luas, Toilet", "alamat": "Jl. Raya Golf Graha Famili No.2 Blok K, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur 60227", "kecamatan": "Dukuh Pakis", "kelurahan": "Pradahkalikendal", "foto": "redback_graha_famili.jpg", "longitude": 112.6854477, "latitude": -7.2934399},
    {"nama": "RÖMFIÉ COFFEE HOUSE", "menu_harga": "Kopi Susu Rp20.000 | Lemon Tea Rp18.000 | Batagor Rp20.000 | Specialty Coffee Rp22.000-32.000 | Non-Coffee Rp18.000-28.000 | Snacks Rp12.000-25.000", "fasilitas": "WiFi, Indoor, Outdoor, Toilet, Bersih, Parkir Motor, Suasana Tenang, Cocok Kerja Solo", "alamat": "Jl. Darmo Permai Selatan V No.30, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur 60226", "kecamatan": "Dukuh Pakis", "kelurahan": "Pradahkalikendal", "foto": "romfie_coffee_house.jpg", "longitude": 112.6915382, "latitude": -7.2819338},
    {"nama": "Redback Specialty Coffee - Darmo Permai", "menu_harga": "V60 & Specialty Rp28.000-45.000 | Croissant Rp22.000 | Pastry Rp18.000-28.000 | Kopi Susu Rp25.000 | Mixed Berries Smoothie Rp32.000 | OJ Fresh Rp25.000", "fasilitas": "WiFi, AC, Indoor (Grab & Go), Toilet, Parkir Terbatas, Buka Pagi, Drive-Through Area", "alamat": "Jl. Raya Darmo Permai Selatan No.3, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur 60226", "kecamatan": "Dukuh Pakis", "kelurahan": "Pradahkalikendal", "foto": "redback_darmo_permai.jpg", "longitude": 112.6838754, "latitude": -7.2805550},
    {"nama": "Basecamp Coffee & Eatery", "menu_harga": "Burger Terbaik Rp30.000-45.000 | Kopi Susu Rp20.000 | Americano Rp15.000 | Main Meals Rp25.000-45.000 | Non-Coffee Rp18.000-25.000", "fasilitas": "WiFi, Indoor, Outdoor, Toilet, Parkir Motor, Suasana Cozy, Service Excellent", "alamat": "Jl. Pakis Tirtosari I No.10, Pakis, Kec. Sawahan, Surabaya, Jawa Timur 60256", "kecamatan": "Sawahan", "kelurahan": "Pakis", "foto": "basecamp_coffee.jpg", "longitude": 112.72536, "latitude": -7.2893642},
    {"nama": "Caturra Espresso", "menu_harga": "Iced Mango Lemonade Rp22.000 | Canned Coffee Rp18.000 | Kopi Susu Rp20.000 | Espresso Rp15.000 | Croissant Ice Cream Rp28.000 | Snacks Rp12.000-25.000", "fasilitas": "WiFi, AC, Indoor, Lantai Tinggi & Jendela Besar, Colokan Listrik, Toilet, Parkir, Dekat Stasiun", "alamat": "Jl. Anjasmoro No.32, Sawahan, Kec. Sawahan, Surabaya, Jawa Timur 60251", "kecamatan": "Sawahan", "kelurahan": "Sawahan", "foto": "caturra_espresso.jpg", "longitude": 112.7295048, "latitude": -7.2582493},
    {"nama": "Cafe Rooftop Mibimibi", "menu_harga": "Kopi Susu Rp18.000 | Strawberry Milkshake Rp22.000 | Steak Rp40.000-55.000 | Non-Coffee Rp15.000-25.000 | Snacks Rp12.000-22.000", "fasilitas": "Rooftop (Lantai 4), View Kota Surabaya, Indoor, Outdoor, Toilet, Parkir Motor, Harga Budget", "alamat": "Jl. Petemon III No.136 Lantai 4, Petemon, Kec. Sawahan, Surabaya, Jawa Timur 60252", "kecamatan": "Sawahan", "kelurahan": "Petemon", "foto": "cafe_rooftop_mibimibi.jpg", "longitude": 112.7173132, "latitude": -7.2638032},
    {"nama": "KAE KOPI SURABAYA", "menu_harga": "Kopi Susu Rp18.000 | Americano Rp15.000 | Specialty Coffee Rp20.000-30.000 | Non-Coffee Rp15.000-22.000 | Snacks Rp10.000-20.000", "fasilitas": "WiFi, Indoor, Outdoor, Indoor Smoking Area, Toilet, Parkir Motor, Suasana Nyaman", "alamat": "Jl. Dukuh Kupang Utara I No.18, Putat Jaya, Kec. Sawahan, Surabaya, Jawa Timur 60255", "kecamatan": "Sawahan", "kelurahan": "Putat Jaya", "foto": "kae_kopi_surabaya.jpg", "longitude": 112.7111635, "latitude": -7.2757603},
    {"nama": "Kopikalyan Darmo", "menu_harga": "Matcha Latte Rp28.000 | Kopi Susu Rp22.000 | Americano Rp18.000 | Specialty Coffee Rp25.000-40.000 | Makanan & Snacks Rp20.000-50.000 | Non-Coffee Rp20.000-30.000", "fasilitas": "WiFi, AC, Indoor, Outdoor, Colokan Listrik, Toilet Bersih, Parkir, Buka Pagi (Weekend)", "alamat": "Jl. Dr. Soetomo No.53, DR. Soetomo, Kec. Tegalsari, Surabaya, Jawa Timur 60264", "kecamatan": "Tegalsari", "kelurahan": "Dr. Soetomo", "foto": "kopikalyan_darmo.jpg", "longitude": 112.7373954, "latitude": -7.2830231},
  ]

  function parseMenu(menuStr) {
    if (!menuStr) return "[]";
    const items = menuStr.split(' | ').map(item => {
      // Mencari pemisah antara nama dan harga (Rp...)
      const parts = item.split(/Rp/i);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        // Ambil angka pertama saja jika ada rentang (misal 15.000-25.000 jadi 15000)
        let price = parts[1].split('-')[0].replace(/[^0-9]/g, '').trim();
        return { name, price };
      }
      return { name: item.trim(), price: "0" };
    });
    return JSON.stringify(items);
  }

  for (let i = 0; i < scrapedCafes.length; i++) {
    const cafe = scrapedCafes[i]
    const reqNumber = `SCRP-${(i + 1).toString().padStart(3, '0')}`

    const exists = await prisma.submission.findUnique({
      where: { reqNumber }
    })
    
    if (!exists) {
      await prisma.submission.create({
        data: {
          reqNumber,
          cafeName: cafe.nama,
          capacity: 20, // Default capacity
          address: cafe.alamat,
          latitude: cafe.latitude.toString(),
          longitude: cafe.longitude.toString(),
          facilities: cafe.fasilitas,
          kecamatan: cafe.kecamatan,
          kelurahan: cafe.kelurahan,
          menuDescription: parseMenu(cafe.menu_harga),
          description: `Cafe di ${cafe.kecamatan}, Surabaya.`,
          status: 'Disetujui',
          ownerId: user.id,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' }
            ]
          }
        }
      })
      console.log(`Seeded: ${cafe.nama}`)
    } else {
      await prisma.submission.update({
        where: { reqNumber },
        data: {
          menuDescription: parseMenu(cafe.menu_harga)
        }
      })
      console.log(`Updated: ${cafe.nama} (Menu updated to JSON)`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
