// authUtils.js
function validateUser(req, res) {
    if (!req.payload) {
      return res.status(400).json({ error: "Payload missing from request" });
    }
  
    const { aud: userId, role } = req.payload;
  
    if (!userId || !role) {
      return res.status(400).json({ error: "Invalid payload structure" });
    }
  
    console.log(`User ID: ${userId}, Role: ${role}`);
  
    let doctorId;
  
    if (role === "admin") {
      doctorId = req.query.doctorId;
  
      if (!doctorId) {
        return res.status(400).json({ message: "Doctor ID must be provided by admin" });
      }
    } else if (role === "doctor") {
      doctorId = userId;
    }
    
    else {
      return res.status(403).json({ message: "Access forbidden: invalid role" });
    }
  
    return { userId, role, doctorId };
  }
  
  module.exports = {
    validateUser,
  };
  