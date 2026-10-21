
const parentService = require("./parent.service");

/*
|--------------------------------------------------------------------------
| GET PARENT PROFILE
|--------------------------------------------------------------------------
| Gets the currently authenticated parent's profile.
|
| GET /parents/me
|--------------------------------------------------------------------------
*/
async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const parent = await parentService.getParentByUserId(userId);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    next(error);
  }
}

async function getParents(req, res) {
  try {
    const parents = await parentService.getParents();

    res.json({
      count: parents.length,
      parents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve parents",
    });
  }
}

async function getParentById(req, res) {
  try {
    const parent = await parentService.getParentById(
      req.params.id
    );

    if (!parent) {
      return res.status(404).json({
        message: "Parent not found",
      });
    }

    res.json(parent);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve parent",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET MY CHILDREN
|--------------------------------------------------------------------------
| Returns all children linked to the authenticated parent.
|
| GET /parents/me/children
|--------------------------------------------------------------------------
*/
async function getMyChildren(req, res, next) {
  try {
    const userId = req.user.id;

    const children =
      await parentService.getChildrenByParentUserId(userId);

    return res.status(200).json({
      success: true,
      data: children,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD DETAILS
|--------------------------------------------------------------------------
| Returns detailed information about one child belonging to the
| authenticated parent.
|
| GET /parents/me/children/:studentId
|--------------------------------------------------------------------------
*/
async function getMyChildren(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const child =
      await parentService.getChildByIdForParent({
        studentId,
        userId,
      });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or not linked to this parent",
      });
    }

    return res.status(200).json({
      success: true,
      data: child,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD ASSESSMENTS
|--------------------------------------------------------------------------
| Parent views their child's assessment results.
|
| GET /parents/me/children/:studentId/assessments
|--------------------------------------------------------------------------
*/
async function getChildAssessments(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const assessments =
      await parentService.getChildAssessments({
        studentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD REPORT CARDS
|--------------------------------------------------------------------------
| Returns published report cards for the child.
|
| GET /parents/me/children/:studentId/report-cards
|--------------------------------------------------------------------------
*/
async function getChildReportCards(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const reportCards =
      await parentService.getChildReportCards({
        studentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: reportCards,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET INDIVIDUAL REPORT CARD
|--------------------------------------------------------------------------
| Returns one published report card belonging to the parent's child.
|
| GET /parents/me/children/:studentId/report-cards/:reportCardId
|--------------------------------------------------------------------------
*/
async function getChildReportCards(req, res, next) {
  try {
    const {
      studentId,
      reportCardId,
    } = req.params;

    const userId = req.user.id;

    if (!studentId || !reportCardId) {
      return res.status(400).json({
        success: false,
        message:
          "studentId and reportCardId are required",
      });
    }

    const reportCard =
      await parentService.getChildReportCardById({
        studentId,
        reportCardId,
        userId,
      });

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message:
          "Report card not found or not available",
      });
    }

    return res.status(200).json({
      success: true,
      data: reportCard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD ATTENDANCE
|--------------------------------------------------------------------------
| Parent views their child's attendance records.
|
| GET /parents/me/children/:studentId/attendance
|--------------------------------------------------------------------------
*/
async function getChildAttendance(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const attendance =
      await parentService.getChildAttendance({
        studentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD FEES
|--------------------------------------------------------------------------
| Parent views the child's fee account, charges, payments,
| adjustments and outstanding balance.
|
| GET /parents/me/children/:studentId/fees
|--------------------------------------------------------------------------
*/
async function getChildFees(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const fees =
      await parentService.getChildFees({
        studentId,
        userId,
      });

    if (!fees) {
      return res.status(404).json({
        success: false,
        message:
          "Fee account not found or child is not linked to this parent",
      });
    }

    return res.status(200).json({
      success: true,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET PARENT DASHBOARD
|--------------------------------------------------------------------------
| Returns a summary suitable for the parent portal dashboard.
|
| GET /parents/me/dashboard
|--------------------------------------------------------------------------
*/
async function getParentDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    const dashboard =
      await parentService.getParentDashboard(userId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Parent dashboard could not be found",
      });
    }

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET CHILD ATTENDANCE SUMMARY
|--------------------------------------------------------------------------
| Optional summary endpoint for the dashboard.
|
| GET /parents/me/children/:studentId/attendance/summary
|--------------------------------------------------------------------------
*/
async function getChildAttendanceSummary(req, res, next) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const summary =
      await parentService.getChildAttendanceSummary({
        studentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| SEARCH PARENTS
|--------------------------------------------------------------------------
| GET /api/parents/search?search=John
|--------------------------------------------------------------------------
*/

async function searchParents(req, res, next) {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const parents =
      await parentService.searchParents(search);

    return res.status(200).json({
      success: true,
      count: parents.length,
      data: parents,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/
module.exports = {
  getMyProfile,
  getParents,
  getParentById,
  getMyChildren,
  getChildAssessments,
  getChildReportCards,
  getChildAttendance,
  getChildAttendanceSummary,
  getChildFees,
  getParentDashboard,
  searchParents,
};

