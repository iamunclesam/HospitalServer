//create ward, get ward by id, get all wards in a department, get all wards, update ward by id, delete ward
const Ward = require('./wardModel')
const Department = require('../department/departmentModel')

// Create a new ward
const createWard = async (req, res) => {
    try {
      const { name, departmentId, capacity, currentOccupancy, patients, staff, location, numberOfBeds } = req.body;
  
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
  
      const ward = new Ward({
        name,
        department: departmentId,
        capacity,
        currentOccupancy,
        patients,
        staff,
        location,
        numberOfBeds
      });
  
      const newWard = await ward.save();
      department.wards.push(newWard._id);
      await department.save();
  
      res.status(201).json(newWard);
    } catch (err) {
      res.status(400).json({ message: 'Internal Server Error' });
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

module.exports = {
    createWard,
    getWardById,
    getWardsByDepartment,
    getAllWards,
    updateWard,
    deleteWard
}