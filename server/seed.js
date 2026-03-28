const db = require("./db");
const bcrypt = require("bcrypt");

// Sample provider data
const providers = [
  {
    email: "provider1@test.com",
    password: "123456",
    username: "electrician_achu",
    full_name: "Achu Kumar",
    phone: "9876543210",
    district: "Alappuzha",
    region: "Mavelikara",
    address: "Achu House, Mavelikara",
    description: "Expert electrician",
    profession: "Electrician",
  },
  {
    email: "provider2@test.com",
    password: "123456",
    username: "plumber_rahul",
    full_name: "Rahul Das",
    phone: "9876543211",
    district: "Ernakulam",
    region: "Kochi",
    address: "Rahul Villa, Kochi",
    description: "Professional plumber",
    profession: "Plumber",
  },
  {
    email: "provider3@test.com",
    password: "123456",
    username: "carpenter_ajay",
    full_name: "Ajay Menon",
    phone: "9876543212",
    district: "Kottayam",
    region: "Changanassery",
    address: "Ajay Bhavan",
    description: "Furniture specialist",
    profession: "Carpenter",
  },
  {
    email: "provider4@test.com",
    password: "123456",
    username: "painter_vishnu",
    full_name: "Vishnu Raj",
    phone: "9876543213",
    district: "Pathanamthitta",
    region: "Adoor",
    address: "Vishnu Nivas",
    description: "House painter",
    profession: "Painter",
  },
  {
    email: "provider5@test.com",
    password: "123456",
    username: "ac_tech_sanju",
    full_name: "Sanju Varghese",
    phone: "9876543214",
    district: "Kollam",
    region: "Karunagappally",
    address: "Sanju Villa",
    description: "AC repair technician",
    profession: "AC Technician",
  },
];

async function seedProviders() {
  for (const p of providers) {
    try {
      const hashedPassword = await bcrypt.hash(p.password, 10);

      // 1. Insert user
      db.run(
        `INSERT INTO users (email, password, role) VALUES (?, ?, 'provider')`,
        [p.email, hashedPassword],
        function (err) {
          if (err) {
            console.error("User insert error:", err.message);
            return;
          }

          const userId = this.lastID;

          // 2. Insert provider
          db.run(
            `INSERT INTO providers 
            (user_id, username, full_name, phone, district, region, address, description, is_verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
              userId,
              p.username,
              p.full_name,
              p.phone,
              p.district,
              p.region,
              p.address,
              p.description,
            ],
            function (err) {
              if (err) {
                console.error("Provider insert error:", err.message);
                return;
              }

              const providerId = this.lastID;

              // 3. Insert profession
              db.run(
                `INSERT INTO provider_professions (provider_id, profession) VALUES (?, ?)`,
                [providerId, p.profession],
                (err) => {
                  if (err) {
                    console.error("Profession insert error:", err.message);
                  } else {
                    console.log(`✅ Provider added: ${p.full_name}`);
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

seedProviders();