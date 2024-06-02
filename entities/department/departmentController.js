//new department, get all departments, update departments, delete department
const Department = require("./departmentModel");

const newDepartment = async (req, res) => {
  try {
    const department = await new Department(req.body);
    const savedDepartment = await department.save();

    res.status(201).json({ savedDepartment });
  } catch (err) {
    res.status(500).error({ message: "Internal Server Error" });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("staff", "name role")
      .populate("doctors", "name specialty")
      .populate("nurses", "name");

    res.status(201).json(departments);
  } catch (err) {
    res.status(500).error({ message: "Internal Server Error" });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.find(req.params.id)
      .populate("staff", "name role")
      .populate("doctors", "name specialization")
      .populate("nurses", "name");
    if (!department) {
      res.status(404).json({ message: "Could not locate department." });
    }
    res.status(201).json(department);
  } catch (err) {
    res.status(500).error({ message: "Internal Server Error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, description, head, staffs, doctors, nurses } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).error({ message: "Could not locate department." });
    }
    department.name = name || department.name;
    department.description = description || department.description;
    department.head = head || department.head;
    department.staff = staff || department.staff;
    department.doctors = doctors || department.doctors;
    department.nurses = nurses || department.nurses;
    const updatedDpt = await Department.save();
    res.status(201).json({ updatedDpt });
  } catch (err) {
    res.status(500).error({ message: "Internal Server Error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      res.status(404).error({ message: "Could not find department" });
    }
    res.status(201).json({ message: "Department deleted successfully." });
  } catch (err) {
    res.status(500).error({ message: "Internal Server Error" });
  }
};

module.exports = {
  newDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
