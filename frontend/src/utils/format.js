export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

export const formatMonth = (dateStr) => {
  if (!dateStr) return "";

  // pega só a parte da data (sem timezone)
  const [year, month] = dateStr.split("T")[0].split("-");

  return `${month}/${year}`;
};