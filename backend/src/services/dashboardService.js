exports.groupInstallmentsByMonth = (installments) => {
  const result = {};

  installments.forEach(inst => {
    const date = new Date(inst.dueDate);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");

    const key = `${year}-${month}`;

    if (!result[key]) {
      result[key] = 0;
    }

    result[key] += inst.amount;
  });

  return result;
};