const roles = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  STAFF: 'staff'
};

const rolePermissions = {
  admin: ['*'], // Admin has access to all routes
  doctor: ['/patients', '/appointments'],
  nurse: ['/patients', '/wards'],
  staff: ['/patients']
};

const jwtSecret = 'your_jwt_secret_key'; 

module.exports = { roles, rolePermissions, jwtSecret };
