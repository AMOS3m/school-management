require("dotenv").config();

const { PrismaClient, EducationLevelCode } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const roles = [
  {
    code: "HEAD_OF_INSTITUTION",
    name: "Head of Institution",
    description: "Full school administration access",
  },
  {
    code: "ACADEMIC_ADMIN",
    name: "Academic Administrator",
    description: "Manages academic operations",
  },
  {
    code: "ADMISSIONS_ADMIN",
    name: "Admissions Administrator",
    description: "Manages student admissions and registration",
  },


  {
  code: "FINANCE_ADMIN",
  name: "Finance Administrator",
  description: "Manages student fees, payments and financial records",
    },

  {
    code: "TEACHER",
    name: "Teacher",
    description: "Manages teaching, assessments and attendance",
  },
  {
    code: "PARENT",
    name: "Parent",
    description: "Views information relating to their children",
  },
];

const permissions = [
  {
    code: "STUDENT_VIEW",
    name: "View Students",
  },
  {
    code: "STUDENT_CREATE",
    name: "Create Students",
  },
  {
    code: "STUDENT_UPDATE",
    name: "Update Students",
  },


  {
  code: "STUDENT_ENROLLMENTS_VIEW",
  name: "View Student Enrollments",
},


 {
  code: "STUDENT_ENROLLMENTS_CREATE",
  name: "Create Student Enrollments",
},

 {
  code: "STUDENT_ENROLLMENTS_UPDATE",
  name: "Update Student Enrollments",
},




  {
  code: "FEE_BALANCE_VIEW",
  name: "View Fee Balance",
},

{
  code: "FEE_VIEW",
  name: "View Fees",
},

{
  code: "FEE_MANAGE",
  name: "Manage Fees",
},

{
  code: "FEE_CHARGE_VIEW",
  name: "View Fee Charges",
},

{
  code: "FEE_CHARGE_CREATE",
  name: "Create Fee Charges",
},

{
  code: "FEE_CHARGE_UPDATE",
  name: "Update Fee Charges",
},

{
  code: "FEE_CHARGE_WAIVE",
  name: "Waive Fee Charges",
},

{
  code: "FEE_PAYMENT_VIEW",
  name: "View Payments",
},

{
  code: "FEE_PAYMENT_CREATE",
  name: "Record Payments",
},

{
  code: "PAYMENTS_REVERSE",
  name: "Reverse Payments",
},

{
  code: "FEE_ADJUSTMENT_VIEW",
  name: "View Fee Adjustments",
},

{
  code: "FEE_ADJUSTMENT_CREATE",
  name: "Create Fee Adjustments",
},

{
  code: "FINANCIAL_REPORT_VIEW",
  name: "View Financial Reports",
},

  {
    code: "TEACHER_VIEW",
    name: "View Teachers",
  },
  {
    code: "TEACHER_CREATE",
    name: "Create Teachers",
  },


  {
    code: "TEACHER_UPDATE",
    name: "Update Teachers",
  },

  {
    code: "MY_PROFILE_VIEW",
    name: "View My Profile",
  },

  {
    code: "MY_PROFILE_UPDATE",
    name: "Update My Profile",
  },



  {
    code: "CLASS_TEACHER_VIEW",
    name: "View Class Teachers",
  },


  {
    code: "CLASS_TEACHER_ASSIGN",
    name: "Assign Class Teachers",
  },

{
    code: "CLASS_TEACHER_UPDATE",
    name: "Update Class Teachers",
  },


{
    code: "CLASS_TEACHER_REMOVE",
    name: "Remove Class Teachers",
  },
{
    code: "LEARNING_AREA_VIEW",
    name: "View Learning Areas",
  },
{
    code: "LEARNING_AREA_CREATE",
    name: "Create Learning Areas",
  },

{
    code: "TEACHER_ASSIGNMENT_VIEW",
    name: "View Teacher Assignments",
  },


  {
    code: "TEACHER_ASSIGNMENT_CREATE",
    name: "Create Teacher Assignments",
  },


  {
    code: "TEACHER_ASSIGNMENT_UPDATE",
    name: "Update Teacher Assignments",
  },


  {
    code: "PARENT_VIEW",
    name: "View Parents",
  },
  {
    code: "PARENT_CREATE",
    name: "Create Parents",
  },
  {
    code: "PARENT_UPDATE",
    name: "Update Parents",
  },

  {
  code: "ACADEMIC_DASHBOARD_VIEW",
  name: "View Academic Dashboard",
 },

 {
  code: "ACADEMIC_OVERVIEW_VIEW",
  name: "View Academic Overview",
},

  {
    code: "ASSESSMENT_VIEW",
    name: "View Assessments",
  },
  {
    code: "ASSESSMENT_CREATE",
    name: "Create Assessments",
  },
  {
    code: "ASSESSMENT_UPDATE",
    name: "Update Assessments",
  },

  {
    code: "ASSESSMENT_MARK",
    name: "MARK Assessments",
  },

  {
    code: "ASSESSMENT_PUBLISH",
    name: "Publish Assessments",
  },
   
  {
    code: "ASSESSMENT_REPORT_CARD_CONTROL",
    name: "Control Report Card Assessments",
  },


  {
    code: "ATTENDANCE_VIEW",
    name: "View Attendance",
  },
  {
    code: "ATTENDANCE_CREATE",
    name: "Record Attendance",
  },
  {
    code: "ATTENDANCE_UPDATE",
    name: "Update Attendance",
  },

  {
    code: "TIMETABLE_VIEW",
    name: "View Timetable",
  },
  {
    code: "TIMETABLE_CREATE",
    name: "Create Timetable",
  },
  {
    code: "TIMETABLE_UPDATE",
    name: "Update Timetable",
  },

  {
    code: "REPORT_CARD_VIEW",
    name: "View Report Cards",
  },
  {
    code: "REPORT_CARD_GENERATE",
    name: "Generate Report Cards",
  },
  {
    code: "REPORT_CARD_PUBLISH",
    name: "Publish Report Cards",
  },

  {
    code: "ANNOUNCEMENT_VIEW",
    name: "View Announcements",
  },
  {
    code: "ANNOUNCEMENT_CREATE",
    name: "Create Announcements",
  },
  {
    code: "ANNOUNCEMENT_UPDATE",
    name: "Update Announcements",
  },

  {
    code: "EVENT_VIEW",
    name: "View Events",
  },
  {
    code: "EVENT_CREATE",
    name: "Create Events",
  },
  {
    code: "EVENT_UPDATE",
    name: "Update Events",
  },

  {
    code: "FEE_BALANCE_VIEW",
    name: "View Fee Balance",
  },

  {
    code: "USER_VIEW",
    name: "View Users",
  },
  {
    code: "USER_CREATE",
    name: "Create Users",
  },
  {
    code: "USER_UPDATE",
    name: "Update Users",
  },

  {
    code: "SCHOOL_SETTINGS_VIEW",
    name: "View School Settings",
  },
  {
    code: "SCHOOL_SETTINGS_UPDATE",
    name: "Update School Settings",
  },

 
 {
    code: "ACADEMIC_YEAR_VIEW",
    name: "View Academic Year",
  },

{
    code: "ACADEMIC_YEAR_CREATE",
    name: "Create Academic Year",
  },

{
    code: "ACADEMIC_YEAR_UPDATE",
    name: "Update Academic Year",
  },

  {
    code: "TERM_VIEW",
    name: "View Terms",
  },

  
{
    code: "TERM_CREATE",
    name: "Create Terms",
  },

  {
    code: "TERM_UPDATE",
    name: "Update Terms",
  },

  { code: "EDUCATION_LEVEL_VIEW", 
    name: "View Education Levels", 
  },

  { code: "EDUCATION_LEVEL_CREATE", 
    name: "Create Education Levels" ,
  },

{
    code: "GRADE_VIEW",
    name: "View Grades",
  },


  {
    code: "GRADE_CREATE",
    name: "Create Grades",
  },

 {
    code: "GRADE_UPDATE",
    name: "Update Grades",
  },


  {
  code: "ADMISSIONS_VIEW",
  name: "View Admissions",
  },


  {
    code: "STREAM_VIEW",
    name: "View Streams",
  },

{
    code: "STREAM_CREATE",
    name: "Create Streams",
  },


  {
    code: "STREAM_UPDATE",
    name: "Update Streams",
  },




];

const educationLevels = [
  {
    code: "PRE_PRIMARY",
    name: "Pre-Primary",
    description: "Pre-primary education",
  },
  {
    code: "PRIMARY",
    name: "Primary",
    description: "Primary education",
  },
  {
    code: "JUNIOR_SECONDARY",
    name: "Junior Secondary",
    description: "Junior secondary education",
  },
  {
    code: "SENIOR_SECONDARY",
    name: "Senior Secondary",
    description: "Senior secondary education",
  },
];


async function main() {

  console.log("Seeding education levels...");

  for (const educationLevel of educationLevels) {
    await prisma.educationLevel.upsert({
      where: {
        code: educationLevel.code,
      },

      update: {
        name: educationLevel.name,
        description: educationLevel.description,
      },

      create: educationLevel,
    });
  }

  console.log("Seeding roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  console.log("Seeding permissions...");

  const admissionsRole = await prisma.role.findUnique({
  where: {
    code: "ADMISSIONS_ADMIN",
  },
});

if (!admissionsRole) {
  throw new Error("ADMISSIONS_ADMIN role not found");
}

const userManagementPermissions = await prisma.permission.findMany({
  where: {
    code: {
      in: [
        "USER_VIEW",
        "USER_CREATE",
        "USER_UPDATE",
      ],
    },
  },
});

for (const permission of userManagementPermissions) {
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: admissionsRole.id,
      permissionId: permission.id,
    },
  });
}

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {
        name: permission.name,
      },
      create: permission,
    });
  }

  console.log("Connecting permissions to roles...");

  const rolePermissions = {
    HEAD_OF_INSTITUTION: permissions.map((permission) => permission.code),

    ACADEMIC_ADMIN: [
      
     "ACADEMIC_DASHBOARD_VIEW",

     "ACADEMIC_OVERVIEW_VIEW",

     "STUDENT_VIEW",

    "LEARNING_AREA_VIEW",
    "LEARNING_AREA_CREATE",

     "TEACHER_VIEW",
     "TEACHER_ASSIGNMENT_VIEW",
     "TEACHER_ASSIGNMENT_CREATE",
     "TEACHER_ASSIGNMENT_UPDATE",

     "CLASS_TEACHER_VIEW",
     "CLASS_TEACHER_ASSIGN",
     "CLASS_TEACHER_UPDATE",
     "CLASS_TEACHER_REMOVE",


      "PARENT_VIEW",

      "ASSESSMENT_VIEW",
      "ASSESSMENT_UPDATE",

      "TIMETABLE_VIEW",
      "TIMETABLE_CREATE",
      "TIMETABLE_UPDATE",

      "REPORT_CARD_VIEW",
      "REPORT_CARD_GENERATE",
      
      "ANNOUNCEMENT_VIEW",
      "ANNOUNCEMENT_CREATE",
      "ANNOUNCEMENT_UPDATE",

      "ACADEMIC_YEAR_VIEW",
      "ACADEMIC_YEAR_CREATE",
      "ACADEMIC_YEAR_UPDATE",

      "TERM_VIEW",
      "TERM_CREATE",
      "TERM_UPDATE",

      "EDUCATION_LEVEL_VIEW",
      "EDUCATION_LEVEL_CREATE",
    
      "STREAM_VIEW",
      "STREAM_CREATE",
      "STREAM_UPDATE",
      "GRADE_VIEW",
      "GRADE_CREATE",
      "GRADE_UPDATE",

      "EVENT_VIEW",
      "EVENT_CREATE",
      "EVENT_UPDATE",
    ],

    

    ADMISSIONS_ADMIN: [
      "ACADEMIC_YEAR_VIEW",
      "TERM_VIEW",
      "EDUCATION_LEVEL_VIEW",
      "STREAM_CREATE",
      "STREAM_UPDATE",
      "STREAM_VIEW",
      "GRADE_VIEW", 
      "ADMISSIONS_VIEW",
      "STUDENT_VIEW",
      "STUDENT_CREATE",
      "STUDENT_UPDATE",
      "STUDENT_ENROLLMENTS_VIEW",
      "STUDENT_ENROLLMENTS_CREATE",
      "STUDENT_ENROLLMENTS_UPDATE",

      "PARENT_VIEW",
      "PARENT_CREATE",
      "PARENT_UPDATE",
      "TEACHER_CREATE",
      "TEACHER_UPDATE",
      "TEACHER_VIEW",

      
    ],

    FINANCE_ADMIN: [
  "STUDENT_VIEW",

  "FEES_VIEW",

  "FEES_MANAGE",

  "FEE_BALANCE_VIEW",

  "FEE_CHARGE_VIEW",
  "FEE_CHARGE_CREATE",
  "FEE_CHARGE_UPDATE",
  "FEE_CHARGE_WAIVE",

  "FEE_PAYMENT_VIEW",
  "FEE_PAYMENT_CREATE",
  "PAYMENTS_REVERSE",

  "FEE_ADJUSTMENT_VIEW",
  "FEE_ADJUSTMENT_CREATE",

  
    ],

    TEACHER: [
      "ACADEMIC_YEAR_VIEW",
      "TERM_VIEW",
      "EDUCATION_LEVEL_VIEW",
      "STREAM_CREATE",
      "GRADE_VIEW",
      "STUDENT_VIEW",
      "MY_PROFILE_VIEW",
      "MY_PROFILE_UPDATE",

      "ASSESSMENT_VIEW",
      "ASSESSMENT_CREATE",
      "ASSESSMENT_UPDATE",
      "ASSESSMENT_PUBLISH",
      "ASSESSMENT_REPORT_CARD_CONTROL",
      "ASSESSMENT_MARK",

      "ATTENDANCE_VIEW",
      "ATTENDANCE_CREATE",
      "ATTENDANCE_UPDATE",

      "TIMETABLE_VIEW",

      "REPORT_CARD_VIEW",

      "ANNOUNCEMENT_VIEW",

      "EVENT_VIEW",
    ],

    PARENT: [

      "STUDENT_VIEW",

      "ASSESSMENT_VIEW",

      "ATTENDANCE_VIEW",

      "TIMETABLE_VIEW",

      "REPORT_CARD_VIEW",

      "ANNOUNCEMENT_VIEW",

      "EVENT_VIEW",

      "FEE_BALANCE_VIEW",

      "FEE_VIEW",
    ],
  };

  for (const [roleCode, permissionCodes] of Object.entries(
    rolePermissions
  )) {
    const role = await prisma.role.findUnique({
      where: {
        code: roleCode,
      },
    });

    if (!role) {
      throw new Error(`Role not found: ${roleCode}`);
    }

    for (const permissionCode of permissionCodes) {
      const permission = await prisma.permission.findUnique({
        where: {
          code: permissionCode,
        },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });