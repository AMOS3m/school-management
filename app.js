require("dotenv").config();

const express = require("express");

const cors = require("cors");

const authRoutes = require("./auth.routes");

const studentRoutes = require("./student.routes");

const teacherRoutes = require("./teacher.routes");
const parentRoutes = require("./parent.routes");

const timetableRoutes = require("./timetable.routes");

const userRoutes = require("./user.routes");

const attendanceRoutes = require("./attendance.routes");

const reportCardRoutes = require("./reportCard.routes");

const academicAdminRoutes = require("./academicAdmin.routes");

const classTeacherRoutes = require("./classTeacher.routes");

const assessmentRoutes = require("./assessment.routes");

const teacherTeachingAssignmentRoutes = require("./teacherTeachingAssignment.routes");

const headInstitutionRoutes = require("./headInstitution.routes");

const admissionAdminRoutes = require("./admissionsAdmin.routes");

const examinationTimetableRoutes = require("./examinationTimetable.routes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
});

app.use("/api", authRoutes);

app.use("/api", studentRoutes);

app.use("/api", teacherRoutes);

app.use("/api", parentRoutes);

app.use("/api", timetableRoutes);

app.use("/api", userRoutes);

app.use("/api", attendanceRoutes);

app.use("/api", academicAdminRoutes);

app.use("/api", classTeacherRoutes);

app.use("/api", assessmentRoutes);

app.use("/api", reportCardRoutes);

app.use("/api", teacherTeachingAssignmentRoutes);

app.use("/api", headInstitutionRoutes);

app.use("/api", admissionAdminRoutes);

app.use("/api", examinationTimetableRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
