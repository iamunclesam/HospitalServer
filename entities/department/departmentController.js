//new department, get all departments, update departments, delete department
const Admission = require("../admission/admissionModel");
const Department = require("./departmentModel");

const newDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res
      .status(201)
      .json({ message: "Department created Successfully", data: department });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});

    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params)
    if (!department) {
      res.status(404).json({ message: "Could not locate department." });
    }
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      res.status(404).json({ message: "Could not find department" });
    }
    res.status(201).json({ message: "Department deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const allPatientInDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await Department.findById(departmentId);

    if (!department) {
      res.status(404).json({ message: "Department does not exist" });
    }

    let admittedPatient = await Admission.find({});
    let newRecord = admittedPatient.find((record) =>
      record.departmentId.equals(departmentId)
    );

    if (!newRecord) {
      res.status(404).json({ message: "not found" });
    }

    res.status(200).json({ data: newRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  newDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  allPatientInDepartment,
};
