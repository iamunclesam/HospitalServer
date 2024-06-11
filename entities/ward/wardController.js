//create ward, get ward by id, get all wards in a department, get all wards, update ward by id, delete ward
const Ward = require('./wardModel')
const Department = require('../department/departmentModel');
const Nurse = require('../nurse/nurseModel');


// Create a new ward
const createWard = async (req, res) => {
  try {
    const {
      name,
      departmentId, // Assuming this is now an array
      capacity,
      currentOccupant,
      patients,
      staff,
      location,
      numberOfBeds
    } = req.body;

    if (!name || !departmentId || !capacity || !currentOccupant || !location || !numberOfBeds) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate each department ID
    const departments = await Department.find({ '_id': { $in: departmentId } });
    if (departments.length !== departmentId.length) {
      return res.status(404).json({ message: 'One or more departments not found' });
    }

    const ward = new Ward({
      name,
      department: departmentId,
      capacity,
      currentOccupant,
      patients,
      staff,
      location,
      numberOfBeds
    });

    const newWard = await ward.save();

    // Update each department with the new ward ID
    await Department.updateMany(
      { '_id': { $in: departmentId } },
      { $push: { wards: newWard._id } }
    );

    res.status(201).json(newWard);
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

//getting ward by Id
const getWardById = async (req, res) => {
    try {
      const ward = await Ward.findById(req.params.id).populate('department', 'name');
      if (!ward) {
        return res.status(404).json({ message: 'Ward not found' });
      }
      res.json(ward);
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// getting ward in a department
const getWardsByDepartment = async (req, res) => {
    try {
      const department = await Department.findById(req.params.departmentId).populate('wards');
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.json(department.wards);
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
};

//getting all wards
const getAllWards = async (req, res) => {
    try {
      const wards = await Ward.find().populate('department', 'name');
      res.json(wards);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

//updating a ward
const updateWard = async (req, res) => {
    try {
      const { name, departmentId, capacity, currentOccupancy, patients, staff, location, numberOfBeds } = req.body;
  
      const ward = await Ward.findById(req.params.id);
      if (!ward) {
        return res.status(404).json({ message: 'Ward not found' });
      }
  
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
  
      ward.name = name || ward.name;
      ward.department = departmentId || ward.department;
      ward.capacity = capacity || ward.capacity;
      ward.currentOccupancy = currentOccupancy || ward.currentOccupancy;
      ward.patients = patients || ward.patients;
      ward.staff = staff || ward.staff;
      ward.location = location || ward.location;
      ward.numberOfBeds = numberOfBeds || ward.numberOfBeds;
  
      const updatedWard = await ward.save();
      res.json(updatedWard);
    } catch (err) {
      res.status(400).json({ message: 'Internal Server Error' });
    }
};

//deleting a ward
const deleteWard = async (req, res) => {
    try {
      const ward = await Ward.findById(req.params.id);
      if (!ward) {
        return res.status(404).json({ message: 'Ward not found' });
      }
  
      const department = await Department.findById(ward.department);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
  
      department.wards.pull(ward._id);
      await department.save();
  
      await ward.remove();
      res.json({ message: 'Ward removed successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

//assign nurse to ward
const assignNurseToWard = async (req, res) => {
  try {
    const {nurseId, wardId} = req.params;
    
    const nurse = await Nurse.findById(nurseId);
    const ward = await Ward.findById(wardId)

    if(nurse && ward) {
      res.status(404).json({message: "Id not identified"})
    }

    let assignNurse = ward.assignedNurses;

    const nurseRecord = assignNurse.find((record) => record.nurseId.equals(nurse._id))

    if(!nurseRecord) {
      assignNurse.push({
        nurseName: nurse.name,
        nurseId: nurse._id
      })
    }
     await ward.save();
     res.status(200)
     .json({message: "Nurse assigned to ward successfully"})
    
    } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

module.exports = {
    createWard,
    getWardById,
    getWardsByDepartment,
    getAllWards,
    updateWard,
    deleteWard,

    assignNurseToWard
}