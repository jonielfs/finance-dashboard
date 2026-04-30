exports.generateInstallments = (total, n, startDate) => {
  const installments = [];

  const start = startDate ? new Date(startDate) : new Date();

  const baseYear = start.getUTCFullYear();
  const baseMonth = start.getUTCMonth();

  const totalValue = Number(total);
  const installmentValue = Number((totalValue / n).toFixed(2));

  let accumulated = 0;

  for (let i = 1; i <= n; i++) {
    const dueDate = new Date(Date.UTC(
      baseYear,
      baseMonth + i,
      1
    ));

    let amount = installmentValue;

    // 🧠 última parcela ajusta diferença
    if (i === n) {
      amount = Number((totalValue - accumulated).toFixed(2));
    }

    accumulated += amount;

    installments.push({
      number: i,
      amount,
      dueDate,
    });
  }

  return installments;
};