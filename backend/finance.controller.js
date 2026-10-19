
const financeService = require("./finance.service");


async function getStudentFeeAccount(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const account =
      await financeService.getStudentFeeAccount(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
}


async function getStudentFeeStatement(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const statement =
      await financeService.getStudentFeeStatement(
        studentId
      );

    return res.status(200).json({
      success: true,
      data: statement,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE FEE ACCOUNT
|--------------------------------------------------------------------------
|
| POST /finance/students/:studentId/account
|
|--------------------------------------------------------------------------
*/

async function createFeeAccount(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const account =
      await financeService.createFeeAccount(
        studentId
      );

    return res.status(201).json({
      success: true,
      message: "Fee account created successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE FEE CHARGE
|--------------------------------------------------------------------------
|
| POST /finance/charges
|
| Body:
|
| {
|   "studentId": "...",
|   "academicYearId": "...",
|   "termId": "...",
|   "description": "Tuition Fees",
|   "amount": 25000,
|   "dueDate": "2026-09-30"
| }
|
|--------------------------------------------------------------------------
*/

async function createFeeCharge(req, res, next) {
  try {
    const {
      studentId,
      academicYearId,
      termId,
      description,
      amount,
      dueDate,
    } = req.body;

    if (
      !studentId ||
      !academicYearId ||
      !termId ||
      !description ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, academicYearId, termId, description and amount are required",
      });
    }

    const charge =
      await financeService.createFeeCharge({
        studentId,
        academicYearId,
        termId,
        description,
        amount,
        dueDate,
      });

    return res.status(201).json({
      success: true,
      message: "Fee charge created successfully",
      data: charge,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE FEE CHARGE
|--------------------------------------------------------------------------
|
| PATCH /finance/charges/:chargeId
|
|--------------------------------------------------------------------------
*/

async function updateFeeCharge(req, res, next) {
  try {
    const { chargeId } = req.params;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        message: "chargeId is required",
      });
    }

    const charge =
      await financeService.updateFeeCharge(
        chargeId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Fee charge updated successfully",
      data: charge,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| WAIVE FEE CHARGE
|--------------------------------------------------------------------------
|
| PATCH /finance/charges/:chargeId/waive
|
|--------------------------------------------------------------------------
*/

async function waiveFeeCharge(req, res, next) {
  try {
    const { chargeId } = req.params;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        message: "chargeId is required",
      });
    }

    const charge =
      await financeService.waiveFeeCharge(
        chargeId
      );

    return res.status(200).json({
      success: true,
      message: "Fee charge waived successfully",
      data: charge,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| RECORD PAYMENT
|--------------------------------------------------------------------------
|
| POST /finance/payments
|
| Body:
|
| {
|   "studentId": "...",
|   "amount": 10000,
|   "paymentMethod": "MPESA",
|   "paymentReference": "QWE123",
|   "paymentDate": "...",
|   "description": "Term 1 payment"
| }
|
|--------------------------------------------------------------------------
*/

async function recordPayment(req, res, next) {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      paymentReference,
      paymentDate,
      description,
    } = req.body;

    if (
      !studentId ||
      amount === undefined ||
      amount === null ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, amount and paymentMethod are required",
      });
    }

    const payment =
      await financeService.recordPayment({
        studentId,
        amount,
        paymentMethod,
        paymentReference,
        paymentDate,
        description,
      });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| REVERSE PAYMENT
|--------------------------------------------------------------------------
|
| PATCH /finance/payments/:paymentId/reverse
|
|--------------------------------------------------------------------------
*/

async function reversePayment(req, res, next) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    const payment =
      await financeService.reversePayment(
        paymentId
      );

    return res.status(200).json({
      success: true,
      message: "Payment reversed successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| CREATE FEE ADJUSTMENT
|--------------------------------------------------------------------------
|
| POST /finance/adjustments
|
| Body:
|
| {
|   "studentId": "...",
|   "type": "CREDIT",
|   "amount": 5000,
|   "reason": "Scholarship"
| }
|
|--------------------------------------------------------------------------
*/

async function createFeeAdjustment(
  req,
  res,
  next
) {
  try {
    const {
      studentId,
      type,
      amount,
      reason,
    } = req.body;

    if (
      !studentId ||
      !type ||
      amount === undefined ||
      amount === null ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, type, amount and reason are required",
      });
    }

    const adjustment =
      await financeService.createFeeAdjustment({
        studentId,
        type,
        amount,
        reason,
      });

    return res.status(201).json({
      success: true,
      message:
        "Fee adjustment created successfully",
      data: adjustment,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET PAYMENTS
|--------------------------------------------------------------------------
|
| GET /finance/payments
|
| Optional query parameters:
|
| ?studentId=...
| ?status=COMPLETED
| ?paymentMethod=MPESA
|
|--------------------------------------------------------------------------
*/

async function getPayments(req, res, next) {
  try {
    const {
      studentId,
      status,
      paymentMethod,
    } = req.query;

    const payments =
      await financeService.getPayments({
        studentId:
          studentId || undefined,

        status:
          status || undefined,

        paymentMethod:
          paymentMethod || undefined,
      });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET OUTSTANDING BALANCES
|--------------------------------------------------------------------------
|
| GET /finance/outstanding
|
| Returns students who currently have
| outstanding fee balances.
|
|--------------------------------------------------------------------------
*/

async function getOutstandingBalances(
  req,
  res,
  next
) {
  try {
    const balances =
      await financeService.getOutstandingBalances();

    return res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| GET FINANCE DASHBOARD
|--------------------------------------------------------------------------
|
| GET /finance/dashboard
|
| Optional:
|
| ?academicYearId=...
| ?termId=...
|
|--------------------------------------------------------------------------
*/

async function getFinanceDashboard(
  req,
  res,
  next
) {
  try {
    const {
      academicYearId,
      termId,
    } = req.query;

    const dashboard =
      await financeService.getFinanceDashboard({
        academicYearId:
          academicYearId || undefined,

        termId:
          termId || undefined,
      });

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
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {

  getStudentFeeAccount,

  getStudentFeeStatement,

  createFeeAccount,

  createFeeCharge,

  updateFeeCharge,

  waiveFeeCharge,

  recordPayment,

  reversePayment,

  createFeeAdjustment,

  getPayments,

  getOutstandingBalances,

  getFinanceDashboard,

};

