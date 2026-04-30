// server/seed.js
// ─────────────────────────────────────────────────────────────
// Run with: node seed.js
// Creates 50 users + 60 providers with real Kerala data
// Credentials saved to: seed_credentials.txt
// ─────────────────────────────────────────────────────────────

const sqlite3 = require("sqlite3").verbose();
const bcrypt  = require("bcryptjs");
const fs      = require("fs");
const path    = require("path");

const DB_PATH   = path.join(__dirname, "app.db");
const CRED_FILE = path.join(__dirname, "seed_credentials.txt");
const SALT_ROUNDS = 10;

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error("DB open error:", err.message); process.exit(1); }
  console.log("✅ Connected to app.db");
});

// ─────────────────────────────────────────────────────────────
// Kerala Data
// ─────────────────────────────────────────────────────────────

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur",
  "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
  "Kannur", "Kasaragod",
];

const KERALA_REGIONS = {
  "Thiruvananthapuram": ["Kazhakkoottam", "Pattom", "Vanchiyoor", "Kowdiar", "Nemom"],
  "Kollam":             ["Kadavoor", "Paravur", "Kottarakkara", "Punalur", "Chavara"],
  "Pathanamthitta":     ["Adoor", "Thiruvalla", "Ranni", "Konni", "Pandalam"],
  "Alappuzha":          ["Cherthala", "Ambalapuzha", "Kuttanad", "Mavelikkara", "Kayamkulam"],
  "Kottayam":           ["Changanacherry", "Pala", "Ettumanoor", "Vaikom", "Kanjirappally"],
  "Idukki":             ["Thodupuzha", "Munnar", "Kattappana", "Devikulam", "Adimali"],
  "Ernakulam":          ["Aluva", "Angamaly", "Perumbavoor", "Muvattupuzha", "Kothamangalam"],
  "Thrissur":           ["Chalakudy", "Kodungallur", "Kunnamkulam", "Guruvayur", "Irinjalakuda"],
  "Palakkad":           ["Ottapalam", "Shoranur", "Mannarkkad", "Chittur", "Alathur"],
  "Malappuram":         ["Tirur", "Manjeri", "Perinthalmanna", "Kondotty", "Ponnani"],
  "Kozhikode":          ["Vadakara", "Feroke", "Ramanattukara", "Koyilandy", "Quilandy"],
  "Wayanad":            ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Vythiri", "Panamaram"],
  "Kannur":             ["Thalassery", "Iritty", "Payyanur", "Kuthuparamba", "Anthoor"],
  "Kasaragod":          ["Kanhangad", "Nileshwar", "Bekal", "Cheruvathur", "Manjeshwar"],
};

const MALE_FIRST_NAMES = [
  "Arjun", "Vishnu", "Arun", "Rahul", "Sreeraj", "Ajith", "Bibin", "Dileep",
  "Eldho", "Faizal", "Gokul", "Harikrishna", "Ishan", "Jithin", "Kiran",
  "Lijo", "Manoj", "Nidhin", "Omprakash", "Praveen", "Rajesh", "Sajan",
  "Thomas", "Unni", "Vineeth", "Winson", "Xavier", "Yogesh", "Zaid",
  "Abhilash", "Biju", "Cibin", "Dhanesh", "Ebin", "Firoz", "Gibil",
  "Hareesh", "Jibin", "Kannan", "Lal", "Midhun", "Nithin", "Pradeep",
  "Rajeev", "Sajeev", "Tijo", "Uday", "Vipin", "Anoop", "Boban",
  "Christy", "Dinto", "Emil", "Faisal", "George", "Hashim", "Ijas",
];

const FEMALE_FIRST_NAMES = [
  "Anju", "Bindhu", "Chithra", "Deepa", "Elsa", "Femina", "Geethu",
  "Hema", "Indira", "Jisha", "Kavya", "Lekha", "Meera", "Nisha",
  "Parvathi", "Rekha", "Sindhu", "Tara", "Uma", "Vidya",
  "Amitha", "Bindu", "Chandana", "Divya", "Eshitha",
];

const LAST_NAMES = [
  "Nair", "Menon", "Pillai", "Varma", "Krishnan", "Rajan", "Kumar",
  "Thomas", "George", "Joseph", "Mathew", "Philip", "Abraham", "Jacob",
  "Ali", "Khan", "Hussain", "Ansari", "Hameed", "Rasheed",
  "Unnithan", "Namboothiri", "Karunakaran", "Subramaniam", "Balakrishnan",
  "Gopalakrishnan", "Ramachandran", "Sivaraman", "Chandran", "Vijayan",
];

const PROFESSIONS = [
  "Plumbing", "Electrical", "Cleaning", "Car Service",
  "Carpenter", "Gardening", "Painting", "AC Repair",
  "Welding", "Tiling", "Mason", "Pest Control",
];

const PROVIDER_DESCRIPTIONS = [
  "Experienced professional with over 5 years in the field. Trusted by hundreds of families across Kerala.",
  "Certified technician providing quality service at affordable rates. Available 7 days a week.",
  "Reliable and punctual. Specializing in residential and commercial work with guaranteed satisfaction.",
  "Licensed professional with modern tools and equipment. Fast response and clean workmanship.",
  "Skilled tradesperson serving local communities for 8+ years. Customer satisfaction is my priority.",
  "Trained expert offering premium service. All work comes with a satisfaction guarantee.",
  "Hardworking and honest professional. I take pride in delivering high quality results every time.",
  "Experienced in both small repairs and large installations. Free consultation available.",
  "Professional with a strong track record and excellent reviews from local customers.",
  "Dedicated service provider committed to timely and quality work at fair prices.",
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple(arr, min = 1, max = 3) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffled.slice(0, count);
}

function randomPhone() {
  const prefixes = ["94", "95", "96", "97", "98", "99", "70", "75", "80", "85"];
  return pick(prefixes) + String(Math.floor(10000000 + Math.random() * 90000000));
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
}

function randomDistrict() {
  return pick(KERALA_DISTRICTS);
}

function randomRegion(district) {
  return pick(KERALA_REGIONS[district]);
}

function makeFullName(gender = "male") {
  const first = gender === "female" ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES);
  return `${first} ${pick(LAST_NAMES)}`;
}

function makeEmail(fullName, index, role) {
  const base = slugify(fullName).replace(".", "");
  return `${base}${index}.${role}@smartservice.test`;
}

function makeUsername(fullName, index) {
  return slugify(fullName).replace(".", "_") + index;
}

function makeAddress(region, district) {
  const houseNos = ["TC 14/", "MRA 5/", "KRA 2/", "PTC 8/", "VRA 3/"];
  const streets  = ["Main Road", "Church Road", "Temple Street", "Market Road", "Station Road", "MG Road"];
  return `${pick(houseNos)}${Math.floor(100 + Math.random() * 900)}, ${pick(streets)}, ${region}, ${district}`;
}

// ─────────────────────────────────────────────────────────────
// Run helper: promisify db.run
// ─────────────────────────────────────────────────────────────
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────
async function seed() {
  const credLines = [];
  credLines.push("=".repeat(70));
  credLines.push("  SMARTSERVICE — SEED CREDENTIALS");
  credLines.push("  Generated: " + new Date().toLocaleString("en-IN"));
  credLines.push("  NOTE: Providers need admin approval before they can be used.");
  credLines.push("=".repeat(70));

  const hashedPassword = await bcrypt.hash("Password@123", SALT_ROUNDS);
  // All seeded accounts use the same password for easy testing

  // ── USERS (50) ──────────────────────────────────────────────
  credLines.push("\n" + "─".repeat(70));
  credLines.push("  USERS (50)  —  password for all: Password@123");
  credLines.push("─".repeat(70));
  credLines.push(
    "  #   | Full Name                    | Email                                  | District"
  );
  credLines.push("─".repeat(70));

  console.log("\n👤 Seeding 50 users...");

  for (let i = 1; i <= 50; i++) {
    const gender   = Math.random() > 0.4 ? "male" : "female";
    const fullName = makeFullName(gender);
    const email    = makeEmail(fullName, i, "user");
    const district = randomDistrict();
    const region   = randomRegion(district);
    const phone    = randomPhone();
    const address  = makeAddress(region, district);

    try {
      // Insert into users table
      const userId = await dbRun(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')",
        [email, hashedPassword]
      );

      // Insert into customers table
      await dbRun(
        `INSERT INTO customers (user_id, full_name, phone, address, landmark, created_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, fullName, phone, address]
      );

      credLines.push(
        `  ${String(i).padEnd(3)} | ${fullName.padEnd(28)} | ${email.padEnd(38)} | ${district}`
      );

      process.stdout.write(`\r  ✓ ${i}/50 users created`);
    } catch (err) {
      console.error(`\n  ✗ User ${i} failed:`, err.message);
    }
  }

  // ── PROVIDERS (60) ──────────────────────────────────────────
  credLines.push("\n\n" + "─".repeat(70));
  credLines.push("  PROVIDERS (60)  —  password for all: Password@123");
  credLines.push("  ⚠  Must be approved by admin before they appear in search.");
  credLines.push("─".repeat(70));
  credLines.push(
    "  #   | Full Name                    | Email                                  | District        | Professions"
  );
  credLines.push("─".repeat(70));

  console.log("\n\n🔧 Seeding 60 providers...");

  for (let i = 1; i <= 60; i++) {
    const fullName   = makeFullName("male");
    const email      = makeEmail(fullName, i, "provider");
    const username   = makeUsername(fullName, i);
    const district   = randomDistrict();
    const region     = randomRegion(district);
    const phone      = randomPhone();
    const address    = makeAddress(region, district);
    const description = pick(PROVIDER_DESCRIPTIONS);
    const professions = pickMultiple(PROFESSIONS, 1, 3);

    try {
      // Insert into users table
      const userId = await dbRun(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'provider')",
        [email, hashedPassword]
      );

      // Insert into providers table
      // is_verified = 0 (needs admin approval), is_active = 1
      const providerId = await dbRun(
        `INSERT INTO providers
           (user_id, username, full_name, phone, district, region, address, description,
            profile_photo, id_proof, license_doc, is_verified, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, username, fullName, phone, district, region, address, description]
      );

      // Insert professions
      for (const profession of professions) {
        await dbRun(
          "INSERT OR IGNORE INTO provider_professions (provider_id, profession) VALUES (?, ?)",
          [providerId, profession]
        );
      }

      credLines.push(
        `  ${String(i).padEnd(3)} | ${fullName.padEnd(28)} | ${email.padEnd(38)} | ${district.padEnd(15)} | ${professions.join(", ")}`
      );

      process.stdout.write(`\r  ✓ ${i}/60 providers created`);
    } catch (err) {
      console.error(`\n  ✗ Provider ${i} failed:`, err.message);
    }
  }

  // ── Write credentials file ───────────────────────────────────
  credLines.push("\n\n" + "=".repeat(70));
  credLines.push("  HOW TO APPROVE PROVIDERS:");
  credLines.push("  1. Login as admin at http://localhost:3000/admin/dashboard");
  credLines.push("  2. Go to Providers section");
  credLines.push("  3. Click each provider and click Approve");
  credLines.push("  OR run: node approve-all-providers.js");
  credLines.push("=".repeat(70));

  fs.writeFileSync(CRED_FILE, credLines.join("\n"), "utf8");

  console.log("\n\n✅ Seeding complete!");
  console.log(`📄 Credentials saved to: seed_credentials.txt`);
  console.log(`🔑 Password for ALL accounts: Password@123`);
  console.log(`⚠  Providers need admin approval. Run: node approve-all-providers.js`);
  console.log("─".repeat(50));

  db.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  db.close();
  process.exit(1);
});