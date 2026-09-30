require("dotenv").config();

const express = require("express");

const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");

const studentRoutes = require("./modules/students/student.routes");

const teacherRoutes = require("./modules/teachers/teacher.routes");
const parentRoutes = require("./modules/parents/parent.routes");

const timetableRoutes = require("./modules/timetables/timetable.routes");

const userRoutes = require("./modules/users/user.routes");

const attendanceRoutes = require("./modules/attendance/attendance.routes");

const reportCardRoutes = require("./modules/reportCards/reportCard.routes");

const academicAdminRoutes = require("./modules/academicAdmin/academicAdmin.routes");

const classTeacherRoutes = require("./modules/classTeachers/classTeacher.routes");

const assessmentRoutes = require("./modules/assessments/assessment.routes");

const teacherTeachingAssignmentRoutes = require("./modules/teacherTeachingAssignment/teacherTeachingAssignment.routes");

const headInstitutionRoutes = require("./modules/headInstitution/headInstitution.routes");

const admissionAdminRoutes = require("./modules/admissions/admissionsAdmin.routes");

const examinationTimetableRoutes = require("./modules/examinationTimetable/examinationTimetable.routes");

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

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/teachers", teacherRoutes);

app.use("/api/parents", parentRoutes);

app.use("/api/timetables", timetableRoutes);

app.use("/api/users", userRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/academic-admin", academicAdminRoutes);

app.use("/api/class-teacher", classTeacherRoutes);

app.use("/api/assessments", assessmentRoutes);

app.use("/api/report-cards", reportCardRoutes);

app.use("/api/teacher-teaching-assignments", teacherTeachingAssignmentRoutes);

app.use("/api/head-institution", headInstitutionRoutes);

app.use("/api/admissions-admin", admissionAdminRoutes);

app.use("/api/examination-timetable", examinationTimetableRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});