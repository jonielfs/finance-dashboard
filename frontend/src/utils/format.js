export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};