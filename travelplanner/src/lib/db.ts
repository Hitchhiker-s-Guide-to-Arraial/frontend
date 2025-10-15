// lib/db.ts

// Use a global variable to ensure it's truly shared
declare global {
  var _users: Array<{
    id: string;
    email: string;
    password: string;
    name: string;
  }>;
}

// Initialize if it doesn't exist
if (!global._users) {
  global._users = [
    {
      id: "1",
      email: "user@example.com",
      password: "password",
      name: "John Doe",
    },
  ];
}

export const db = {
  get users() {
    return global._users;
  },
  set users(newUsers) {
    global._users = newUsers;
  },
};

console.log("🔄 DB initialized with users:", db.users);