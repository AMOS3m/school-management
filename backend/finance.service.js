
const prisma = require("./prisma");



function decimalToNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}


/*
|--------------------------------------------------------------------------
| HELPER: CALCULATE ACCOUNT BALANCE
|--------------------------------------------------------------------------
|
| Balance =
|
| Charges
| + Debit adjustments
| - Credit adjustments
| - Completed payments
|
|--------------------------------------------------------------------------
*/

function calculateBalance({
  charges = [],
  payments = [],
  adjustments = [],
}) {
  let totalCharges = 0;
  let totalPayments = 0;
  let totalDebitAdjustments = 0;
  let totalCreditAdjustments = 0;


  /*
  |--------------------------------------------------------------------------
  | Charges
  |--------------------------------------------------------------------------
  */

  for (const charge of charges) {
    if (charge.status !== "WAIVED") {
      totalCharges += decimalToNumber(charge.amount);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Payments
  |--------------------------------------------------------------------------
  */

  for (const payment of payments) {
    if (payment.status === "COMPLETED") {
      totalPayments += decimalToNumber(payment.amount);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Adjustments
  |--------------------------------------------------------------------------
  */

  for (const adjustment of adjustments) {
    const amount = decimalToNumber(adjustment.amount);

    if (adjustment.type === "DEBIT") {
      totalDebitAdjustments += amount;
    }

    if (adjustment.type === "CREDIT") {
      totalCreditAdjustments += amount;
    }
  }


  const balance =
    totalCharges +
    totalDebitAdjustments -
    totalCreditAdjustments -
    totalPayments;


  return {
    totalCharges,
    totalPayments,
    totalDebitAdjustments,
    totalCreditAdjustments,
    balance,
  };
}


/*
|--------------------------------------------------------------------------
| GET STUDENT FEE ACCOUNT
|--------------------------------------------------------------------------
|
| Returns the complete financial account of one student.
|
|--------------------------------------------------------------------------
*/

async function getStudentFeeAccount(studentId) {
  const account = await prisma.feeAccount.findUnique({
    where: {
      studentId,
    },

    include: {
      student: {
        include: {
          enrollments: {
            include: {
              grade: true,
              stream: true,
              academicYear: true,
              term: true,
            },
          },

          parentLinks: {
            include: {
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },

      charges: {
        include: {
          academicYear: true,
          term: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      payments: {
        orderBy: {
          paymentDate: "desc",
        },
      },

      adjustments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });


  if (!account) {
    throw new Error("Fee account not found");
  }


  const summary = calculateBalance({
    charges: account.charges,
    payments: account.payments,
    adjustments: account.adjustments,
  });


  return {
    ...account,

    charges: account.charges.map((charge) => ({
      ...charge,
      amount: decimalToNumber(charge.amount),
    })),

    payments: account.payments.map((payment) => ({
      ...payment,
      amount: decimalToNumber(payment.amount),
    })),

    adjustments: account.adjustments.map((adjustment) => ({
      ...adjustment,
      amount: decimalToNumber(adjustment.amount),
    })),

    summary,
  };
}


/*
|--------------------------------------------------------------------------
| GET STUDENT FEE STATEMENT
|--------------------------------------------------------------------------
|
| Returns a chronological financial statement.
|
|--------------------------------------------------------------------------
*/

async function getStudentFeeStatement(studentId) {
  const account = await prisma.feeAccount.findUnique({
    where: {
      studentId,
    },

    include: {
      student: true,

      charges: {
        include: {
          academicYear: true,
          term: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      payments: {
        orderBy: {
          paymentDate: "asc",
        },
      },

      adjustments: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });


  if (!account) {
    throw new Error("Fee account not found");
  }


  const transactions = [];


  /*
  |--------------------------------------------------------------------------
  | Charges
  |--------------------------------------------------------------------------
  */

  for (const charge of account.charges) {
    transactions.push({
      id: charge.id,
      type: "CHARGE",
      date: charge.createdAt,
      description: charge.description,
      amount: decimalToNumber(charge.amount),
      reference: null,
      status: charge.status,
    });
  }


  /*
  |--------------------------------------------------------------------------
  | Payments
  |--------------------------------------------------------------------------
  */

  for (const payment of account.payments) {
    transactions.push({
      id: payment.id,
      type: "PAYMENT",
      date: payment.paymentDate,
      description:
        payment.description || "Fee payment",
      amount: decimalToNumber(payment.amount),
      reference: payment.paymentReference,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
    });
  }


  /*
  |--------------------------------------------------------------------------
  | Adjustments
  |--------------------------------------------------------------------------
  */

  for (const adjustment of account.adjustments) {
    transactions.push({
      id: adjustment.id,
      type: adjustment.type === "DEBIT"
        ? "DEBIT_ADJUSTMENT"
        : "CREDIT_ADJUSTMENT",

      date: adjustment.createdAt,

      description: adjustment.reason,

      amount: decimalToNumber(adjustment.amount),

      reference: null,

      status: adjustment.type,
    });
  }


  /*
  |--------------------------------------------------------------------------
  | Sort transactions
  |--------------------------------------------------------------------------
  */

  transactions.sort(
    (a, b) =>
      new Date(a.date) - new Date(b.date)
  );


  /*
  |--------------------------------------------------------------------------
  | Running balance
  |--------------------------------------------------------------------------
  */

  let runningBalance = 0;


  const statement = transactions.map(
    (transaction) => {

      if (transaction.type === "CHARGE") {
        if (transaction.status !== "WAIVED") {
          runningBalance += transaction.amount;
        }
      }

      else if (
        transaction.type === "PAYMENT"
      ) {
        if (transaction.status === "COMPLETED") {
          runningBalance -= transaction.amount;
        }
      }

      else if (
        transaction.type === "DEBIT_ADJUSTMENT"
      ) {
        runningBalance += transaction.amount;
      }

      else if (
        transaction.type === "CREDIT_ADJUSTMENT"
      ) {
        runningBalance -= transaction.amount;
      }


      return {
        ...transaction,
        balance: runningBalance,
      };
    }
  );


  return {
    student: account.student,

    statement,

    closingBalance: runningBalance,
  };
}


/*
|--------------------------------------------------------------------------
| CREATE FEE ACCOUNT
|--------------------------------------------------------------------------
|
| Normally created when a student enters the financial system.
|
|--------------------------------------------------------------------------
*/

async function createFeeAccount(studentId) {
  const existingAccount =
    await prisma.feeAccount.findUnique({
      where: {
        studentId,
      },
    });


  if (existingAccount) {
    return existingAccount;
  }


  return prisma.feeAccount.create({
    data: {
      studentId,
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE FEE CHARGE
|--------------------------------------------------------------------------
*/

async function createFeeCharge({
  studentId,
  academicYearId,
  termId,
  description,
  amount,
  dueDate,
}) {
  let feeAccount =
    await prisma.feeAccount.findUnique({
      where: {
        studentId,
      },
    });


  /*
  |--------------------------------------------------------------------------
  | Create account automatically if it doesn't exist
  |--------------------------------------------------------------------------
  */

  if (!feeAccount) {
    feeAccount = await createFeeAccount(
      studentId
    );
  }


  if (!description) {
    throw new Error(
      "Fee charge description is required"
    );
  }


  if (
    amount === undefined ||
    amount === null ||
    Number(amount) <= 0
  ) {
    throw new Error(
      "Fee charge amount must be greater than zero"
    );
  }


  return prisma.feeCharge.create({
    data: {
      feeAccountId: feeAccount.id,

      academicYearId,

      termId,

      description,

      amount,

      dueDate: dueDate
        ? new Date(dueDate)
        : null,
    },

    include: {
      academicYear: true,
      term: true,
      feeAccount: {
        include: {
          student: true,
        },
      },
    },
  });
}


/*
|--------------------------------------------------------------------------
| UPDATE FEE CHARGE
|--------------------------------------------------------------------------
*/

async function updateFeeCharge(
  chargeId,
  data
) {
  const charge =
    await prisma.feeCharge.findUnique({
      where: {
        id: chargeId,
      },
    });


  if (!charge) {
    throw new Error(
      "Fee charge not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Do not modify a waived charge through normal update.
  |--------------------------------------------------------------------------
  */

  if (charge.status === "WAIVED") {
    throw new Error(
      "Waived fee charges cannot be updated"
    );
  }


  return prisma.feeCharge.update({
    where: {
      id: chargeId,
    },

    data: {
      description:
        data.description !== undefined
          ? data.description
          : undefined,

      amount:
        data.amount !== undefined
          ? data.amount
          : undefined,

      dueDate:
        data.dueDate !== undefined
          ? (
              data.dueDate
                ? new Date(data.dueDate)
                : null
            )
          : undefined,
    },

    include: {
      academicYear: true,
      term: true,
    },
  });
}


/*
|--------------------------------------------------------------------------
| WAIVE FEE CHARGE
|--------------------------------------------------------------------------
*/

async function waiveFeeCharge(
  chargeId
) {
  const charge =
    await prisma.feeCharge.findUnique({
      where: {
        id: chargeId,
      },
    });


  if (!charge) {
    throw new Error(
      "Fee charge not found"
    );
  }


  return prisma.feeCharge.update({
    where: {
      id: chargeId,
    },

    data: {
      status: "WAIVED",
    },
  });
}


/*
|--------------------------------------------------------------------------
| RECORD PAYMENT
|--------------------------------------------------------------------------
*/

async function recordPayment({
  studentId,
  amount,
  paymentMethod,
  paymentReference,
  paymentDate,
  description,
}) {
  if (
    amount === undefined ||
    amount === null ||
    Number(amount) <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero"
    );
  }


  if (!paymentMethod) {
    throw new Error(
      "Payment method is required"
    );
  }


  let feeAccount =
    await prisma.feeAccount.findUnique({
      where: {
        studentId,
      },
    });


  if (!feeAccount) {
    feeAccount = await createFeeAccount(
      studentId
    );
  }


  return prisma.feePayment.create({
    data: {
      feeAccountId: feeAccount.id,

      amount,

      paymentMethod,

      paymentReference:
        paymentReference || null,

      paymentDate: paymentDate
        ? new Date(paymentDate)
        : new Date(),

      description:
        description || null,

      status: "COMPLETED",
    },
  });
}


/*
|--------------------------------------------------------------------------
| REVERSE PAYMENT
|--------------------------------------------------------------------------
*/

async function reversePayment(
  paymentId
) {
  const payment =
    await prisma.feePayment.findUnique({
      where: {
        id: paymentId,
      },
    });


  if (!payment) {
    throw new Error(
      "Payment not found"
    );
  }


  if (payment.status === "REVERSED") {
    throw new Error(
      "Payment has already been reversed"
    );
  }


  return prisma.feePayment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "REVERSED",
    },
  });
}


/*
|--------------------------------------------------------------------------
| CREATE FEE ADJUSTMENT
|--------------------------------------------------------------------------
*/

async function createFeeAdjustment({
  studentId,
  type,
  amount,
  reason,
}) {
  if (!type) {
    throw new Error(
      "Adjustment type is required"
    );
  }


  if (
    type !== "CREDIT" &&
    type !== "DEBIT"
  ) {
    throw new Error(
      "Adjustment type must be CREDIT or DEBIT"
    );
  }


  if (
    amount === undefined ||
    amount === null ||
    Number(amount) <= 0
  ) {
    throw new Error(
      "Adjustment amount must be greater than zero"
    );
  }


  if (!reason) {
    throw new Error(
      "Adjustment reason is required"
    );
  }


  let feeAccount =
    await prisma.feeAccount.findUnique({
      where: {
        studentId,
      },
    });


  if (!feeAccount) {
    feeAccount = await createFeeAccount(
      studentId
    );
  }


  return prisma.feeAdjustment.create({
    data: {
      feeAccountId: feeAccount.id,

      type,

      amount,

      reason,
    },
  });
}


/*
|--------------------------------------------------------------------------
| GET PAYMENTS
|--------------------------------------------------------------------------
|
| Optional filters:
|
| studentId
| status
| paymentMethod
|
|--------------------------------------------------------------------------
*/

async function getPayments({
  studentId,
  status,
  paymentMethod,
}) {
  const where = {};


  if (studentId) {
    where.feeAccount = {
      studentId,
    };
  }


  if (status) {
    where.status = status;
  }


  if (paymentMethod) {
    where.paymentMethod =
      paymentMethod;
  }


  const payments =
    await prisma.feePayment.findMany({
      where,

      include: {
        feeAccount: {
          include: {
            student: true,
          },
        },
      },

      orderBy: {
        paymentDate: "desc",
      },
    });


  return payments.map((payment) => ({
    ...payment,
    amount: decimalToNumber(
      payment.amount
    ),
  }));
}


/*
|--------------------------------------------------------------------------
| GET OUTSTANDING BALANCES
|--------------------------------------------------------------------------
|
| Returns students who currently owe fees.
|
|--------------------------------------------------------------------------
*/

async function getOutstandingBalances() {
  const accounts =
    await prisma.feeAccount.findMany({
      include: {
        student: true,

        charges: true,

        payments: true,

        adjustments: true,
      },
    });


  const results = [];


  for (const account of accounts) {
    const summary =
      calculateBalance({
        charges: account.charges,
        payments: account.payments,
        adjustments:
          account.adjustments,
      });


    if (summary.balance > 0) {
      results.push({
        student: account.student,

        ...summary,
      });
    }
  }


  results.sort(
    (a, b) =>
      b.balance - a.balance
  );


  return results;
}


/*
|--------------------------------------------------------------------------
| GET FINANCE DASHBOARD
|--------------------------------------------------------------------------
|
| Used by the Head of Institution / Finance Admin.
|
|--------------------------------------------------------------------------
*/

async function getFinanceDashboard({
  academicYearId,
  termId,
}) {
  const chargeWhere = {};

  const paymentWhere = {};


  if (academicYearId) {
    chargeWhere.academicYearId =
      academicYearId;
  }


  if (termId) {
    chargeWhere.termId =
      termId;
  }


  /*
  |--------------------------------------------------------------------------
  | Charges
  |--------------------------------------------------------------------------
  */

  const charges =
    await prisma.feeCharge.findMany({
      where: chargeWhere,
    });


  let totalCharged = 0;


  for (const charge of charges) {
    if (charge.status !== "WAIVED") {
      totalCharged +=
        decimalToNumber(
          charge.amount
        );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Payments
  |--------------------------------------------------------------------------
  |
  | Payments don't have academicYearId/termId
  | in the current schema.
  |
  | Therefore we cannot safely filter them by
  | academic year/term directly here.
  |
  |--------------------------------------------------------------------------
  */

  const payments =
    await prisma.feePayment.findMany({
      where: paymentWhere,
    });


  let totalCollected = 0;


  for (const payment of payments) {
    if (payment.status === "COMPLETED") {
      totalCollected +=
        decimalToNumber(
          payment.amount
        );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Adjustments
  |--------------------------------------------------------------------------
  */

  const adjustments =
    await prisma.feeAdjustment.findMany();


  let totalCredits = 0;
  let totalDebits = 0;


  for (const adjustment of adjustments) {
    const amount =
      decimalToNumber(
        adjustment.amount
      );


    if (adjustment.type === "CREDIT") {
      totalCredits += amount;
    }


    if (adjustment.type === "DEBIT") {
      totalDebits += amount;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Outstanding
  |--------------------------------------------------------------------------
  */

  const outstanding =
    totalCharged +
    totalDebits -
    totalCredits -
    totalCollected;


  /*
  |--------------------------------------------------------------------------
  | Student account statistics
  |--------------------------------------------------------------------------
  */

  const accounts =
    await prisma.feeAccount.findMany({
      include: {
        charges: true,
        payments: true,
        adjustments: true,
      },
    });


  let studentsWithBalance = 0;
  let studentsCleared = 0;


  for (const account of accounts) {
    const summary =
      calculateBalance({
        charges: account.charges,
        payments: account.payments,
        adjustments:
          account.adjustments,
      });


    if (summary.balance > 0) {
      studentsWithBalance++;
    } else {
      studentsCleared++;
    }
  }


  return {
    totalCharged,

    totalCollected,

    totalCredits,

    totalDebits,

    outstanding,

    studentsWithBalance,

    studentsCleared,

    totalStudentAccounts:
      accounts.length,
  };
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
