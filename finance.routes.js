
const express = require("express");

const router = express.Router();

const financeController = require("./finance.controller");

const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/permission.middleware");


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
|
| Every finance endpoint requires an authenticated user.
|
|--------------------------------------------------------------------------
*/

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| STUDENT FEE ACCOUNT
|--------------------------------------------------------------------------
*/

/*
 * GET STUDENT FEE ACCOUNT
 *
 * Head of Institution:
 *   - Can view
 *
 * Finance Admin:
 *   - Can view
 *
 * Parent:
 *   - Should use a separate parent endpoint that only
 *     exposes their own child's information.
 */
router.get(
  "/students/:studentId/account",
  authenticate,
  authorize("fee.view"),
  financeController.getStudentFeeAccount
);


/*
 * GET STUDENT FEE STATEMENT
 */
router.get(
  "/students/:studentId/statement",
  authenticate,
  authorize("fee.view"),
  financeController.getStudentFeeStatement
);


/*
|--------------------------------------------------------------------------
| FEE ACCOUNT
|--------------------------------------------------------------------------
*/

/*
 * CREATE FEE ACCOUNT
 */
router.post(
  "/students/:studentId/account",
  authenticate,
  authorize("fee.manage"),
  financeController.createFeeAccount
);


/*
|--------------------------------------------------------------------------
| FEE CHARGES
|--------------------------------------------------------------------------
*/

/*
 * CREATE FEE CHARGE
 *
 * Normally Finance Admin.
 */
router.post(
  "/charges",
  authenticate,
  authorize("fee.charge.create"),
  financeController.createFeeCharge
);


/*
 * UPDATE FEE CHARGE
 */
router.patch(
  "/charges/:chargeId",
  authenticate,
  authorize("fee.charge.update"),
  financeController.updateFeeCharge
);


/*
 * WAIVE FEE CHARGE
 */
router.patch(
  "/charges/:chargeId/waive",
  authenticate,
  authorize("fee.charge.waive"),
  financeController.waiveFeeCharge
);


/*
|--------------------------------------------------------------------------
| PAYMENTS
|--------------------------------------------------------------------------
*/

/*
 * RECORD PAYMENT
 */
router.post(
  "/payments",
  authenticate,
  authorize("fee.payment.create"),
  financeController.recordPayment
);


/*
 * GET PAYMENTS
 */
router.get(
  "/payments",
  authenticate,
  authorize("fee.payment.view"),
  financeController.getPayments
);


/*
 * REVERSE PAYMENT
 *
 * This should be restricted to authorized finance personnel.
 */
router.patch(
  "/payments/:paymentId/reverse",
  authenticate,
  authorize("payments.reverse"),
  financeController.reversePayment
);


/*
|--------------------------------------------------------------------------
| FEE ADJUSTMENTS
|--------------------------------------------------------------------------
*/

/*
 * CREATE CREDIT / DEBIT ADJUSTMENT
 */
router.post(
  "/adjustments",
  authenticate,
  authorize("fee.adjustment.create"),
  financeController.createFeeAdjustment
);


/*
|--------------------------------------------------------------------------
| FINANCIAL REPORTING
|--------------------------------------------------------------------------
*/

/*
 * GET STUDENTS WITH OUTSTANDING BALANCES
 */
router.get(
  "/outstanding",
  authenticate,
  authorize("fee.balance.view"),
  financeController.getOutstandingBalances
);


/*
 * FINANCE DASHBOARD
 *
 * Head of Institution:
 *   - Can view financial overview
 *
 * Finance Admin:
 *   - Can view financial overview
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("fee.view"),
  financeController.getFinanceDashboard
);


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;
