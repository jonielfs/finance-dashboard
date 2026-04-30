const prisma = require("../prisma");
const { groupInstallmentsByMonth } = require("../services/dashboardService");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));

    // 📄 Faturas do mês atual
    const invoices = await prisma.invoice.findMany({
      where: {
        card: { userId },
        referenceDate: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
    });

    const totalMonth = invoices.reduce(
      (sum, i) => sum + Number(i.totalAmount),
      0
    );

    // 📦 Parcelas
    const installments = await prisma.installment.findMany({
      where: {
        purchase: {
          card: { userId },
        },
      },
    });

    const installmentsByMonth = groupInstallmentsByMonth(installments);

    const totalOpen = installments
      .filter((i) => !i.paid)
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // 📊 Média mensal (últimos 12 meses)
    const lastYear = new Date();
    lastYear.setMonth(lastYear.getMonth() - 12);

    const lastInvoices = await prisma.invoice.findMany({
      where: {
        card: { userId },
        referenceDate: { gte: lastYear },
      },
    });

    const avgMonthly =
      lastInvoices.length > 0
        ? lastInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0) /
          lastInvoices.length
        : 0;

    // 📆 Média diária
    const today = now.getDate();
    const avgDaily = today > 0 ? totalMonth / today : 0;

    // 🎯 Meta (única)
    const goal = await prisma.goal.findUnique({
      where: { userId },
    });

    const goalValue = goal ? Number(goal.value) : null;

    const comparison =
      goalValue !== null ? totalMonth - goalValue : null;

    res.json({
      totalMonth,
      avgDaily,
      avgMonthly,
      totalOpen,
      goal: goalValue,
      comparison,
      installmentsByMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no dashboard" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    // 📅 montar meses (6 passados, atual, 6 futuros)
    const months = [];

    for (let i = 6; i > 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );
      const key = `${d.getUTCFullYear()}-${String(
        d.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      months.push(key);
    }

    const current = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const currentMonthKey = `${current.getUTCFullYear()}-${String(
      current.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    months.push(currentMonthKey);

    for (let i = 1; i <= 6; i++) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1)
      );
      const key = `${d.getUTCFullYear()}-${String(
        d.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      months.push(key);
    }

    // 📄 invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        card: { userId },
      },
    });

    const invoiceMap = {};
    const invoiceStatusMap = {};

    invoices.forEach((inv) => {
      const date = new Date(inv.referenceDate);
      const key = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`;

      invoiceMap[key] =
        (invoiceMap[key] || 0) + Number(inv.totalAmount);

      invoiceStatusMap[key] = inv.status || "OPEN";
    });

    // 📦 parcelas
    const installments = await prisma.installment.findMany({
      where: {
        purchase: {
          card: { userId },
        },
      },
    });

    const installmentsByMonth = groupInstallmentsByMonth(installments);

    // 📊 totais reais
    const totals = months.map((m) => Number(invoiceMap[m] || 0));

    const validTotals = totals.filter((v) => v > 0);

    const avg =
      validTotals.length > 0
        ? validTotals.reduce((sum, v) => sum + v, 0) /
          validTotals.length
        : 0;

    const avgLine = months.map(() => avg);

    const commitments = months.map(
      (m) => Number(installmentsByMonth[m] || 0)
    );

    // 🎯 meta única
    const goal = await prisma.goal.findUnique({
      where: { userId },
    });

    const goalValue = goal ? Number(goal.value) : 0;

    const goalLine = months.map(() => goalValue);

    res.json({
      months,
      totals,
      commitments,
      goals: goalLine,
      avg: avgLine,
      currentMonthKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no histórico" });
  }
};