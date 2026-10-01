const teacherService = require("./teacher.service");




/*
|--------------------------------------------------------------------------
| GET MY TEACHER DASHBOARD
|--------------------------------------------------------------------------
|
| Returns the dashboard information for the currently
| authenticated teacher.
|
| The teacher is identified using req.user.id.
|
| GET /teachers/me/dashboard
|
|--------------------------------------------------------------------------
*/

async function getMyDashboard(req, res, next) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authenticated user
    |--------------------------------------------------------------------------
    */

    const userId = req.user.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Get dashboard
    |--------------------------------------------------------------------------
    */

    const dashboard =
      await teacherService.getMyDashboard(userId);


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      data: dashboard,
    });

  } catch (error) {
    next(error);
  }
}


async function getTeachers(req, res) {
  try {
    const teachers = await teacherService.getTeachers();

    res.json({
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve teachers",
    });
  }
}

async function getTeacherById(req, res) {
  try {
    const teacher = await teacherService.getTeacherById(
      req.params.id
    );

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    res.json(teacher);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve teacher",
    });
  }
}

async function createTeacher(req, res) {
  try {
    const teacher = await teacherService.createTeacher(
      req.body
    );

    res.status(201).json({
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);


    if (error.code === "PASSWORD_REQUIRED") {
      return res.status(400).json({
        message: "Teacher password is required",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A teacher with this email, phone, or employee number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create teacher",
    });
  }
}

async function updateTeacher(req, res) {
  try {
    const teacher = await teacherService.updateTeacher(
      req.params.id,
      req.body
    );

    res.json({
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email, phone, or employee number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update teacher",
    });
  }
}

async function assignLearningArea(req, res) {
  try {
    const { teacherId } = req.params;
    const { learningAreaId } = req.body;

    if (!learningAreaId) {
      return res.status(400).json({
        message: "learningAreaId is required",
      });
    }

    const assignment = await teacherService.assignLearningArea(
      teacherId,
      learningAreaId
    );

    res.status(201).json({
      message: "Learning area assigned to teacher successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to assign learning area",
    });
  }
}


async function assignStream(req, res) {
  try {
    const { teacherId } = req.params;
    const { streamId } = req.body;

    if (!streamId) {
      return res.status(400).json({
        message: "streamId is required",
      });
    }

    const assignment = await teacherService.assignStream(
      teacherId,
      streamId
    );

    res.status(201).json({
      message: "Stream assigned to teacher successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to assign stream",
    });

  }

}

async function createTeachingAssignment(req, res) {
  try {
    const { teacherId } = req.params;

    const {
      learningAreaId,
      streamId,
    } = req.body;

    if (!learningAreaId || !streamId) {
      return res.status(400).json({
        message: "learningAreaId and streamId are required",
      });
    }

    const assignment =
      await teacherService.createTeachingAssignment(
        teacherId,
        learningAreaId,
        streamId
      );

    res.status(201).json({
      message: "Teaching assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to create teaching assignment",
    });
  }
}

/*
|--------------------------------------------------------------------------
| SEARCH TEACHERS
|--------------------------------------------------------------------------
| GET /api/teachers/search?search=John
|--------------------------------------------------------------------------
*/

async function searchTeachers(req, res, next) {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const teachers =
      await teacherService.searchTeachers(search);

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
}



/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
| GET /api/teachers/me
|--------------------------------------------------------------------------
*/

async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.sub;

    const profile = await teacherService.getMyProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE MY PROFILE
|--------------------------------------------------------------------------
| PATCH /api/teachers/me
|--------------------------------------------------------------------------
*/

async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user.sub;

    const updatedProfile =
      await teacherService.updateMyProfile(
        userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
}






module.exports = {
  getMyProfile,
  updateMyProfile,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  assignLearningArea,
  assignStream,
  createTeachingAssignment,
  getMyDashboard,
  searchTeachers,
};