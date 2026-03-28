const db = require("./db");

const emailsToDelete = [
  "provider2@test.com",
  "provider3@test.com",
  "provider4@test.com",
  "provider5@test.com",
];

function deleteProviders() {
  emailsToDelete.forEach((email) => {
    db.run(
      `DELETE FROM users WHERE email = ?`,
      [email],
      function (err) {
        if (err) {
          console.error(`❌ Error deleting ${email}:`, err.message);
        } else if (this.changes === 0) {
          console.log(`⚠️ No user found with email: ${email}`);
        } else {
          console.log(`✅ Deleted provider with email: ${email}`);
        }
      }
    );
  });
}

deleteProviders();