const prisma = require("../prisma");
const { generateInstallments } = require("../services/installmentService");

function parseStartMonth(startMonthStr) {
  if (!startMonthStr) return new Date(); // fallback (segurança)

  const [year, month] = startMonthStr.split("-");
  return new Date(Number(year), Number(month) - 1, 1);
}

exports.createPurchase = async (req, res) => {
  try {
    const { description, totalAmount, installments, startMonth, cardId } = req.body;

    if (!description || !totalAmount || !installments || !cardId) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }

    const card = await prisma.creditCard.findFirst({
      where: {
        id: Number(cardId),
        userId: req.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }

    const parsedStartMonth = parseStartMonth(startMonth);

    const installmentsData = generateInstallments(
      Number(totalAmount),
      Number(installments),
      parsedStartMonth
    );

    const purchase = await prisma.purchase.create({
      data: {
        description,
        totalAmount: Number(totalAmount),
        installments: Number(installments),
        startMonth: parsedStartMonth,
        cardId: Number(cardId),
        installmentsList: {
          create: installmentsData,
        },
      },
      include: {
        installmentsList: true,
      },
    });

    res.status(201).json({
      ...purchase,
      totalAmount: Number(purchase.totalAmount),
      installmentsList: purchase.installmentsList.map(i => ({
        ...i,
        amount: Number(i.amount),
      })),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar compra" });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        card: {
          userId: req.userId,
        },
      },
      include: {
        installmentsList: true,
      },
      orderBy: {
        startMonth: "desc", // 👈 importante (mais recente primeiro)
      },
    });

    res.json(
      purchases.map((p) => ({
        ...p,
        totalAmount: Number(p.totalAmount),
        installmentsList: p.installmentsList.map((i) => ({
          ...i,
          amount: Number(i.amount),
        })),
      }))
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar compras" });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await prisma.purchase.findFirst({
      where: {
        id: Number(id),
        card: {
          userId: req.userId,
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({ error: "Compra não encontrada" });
    }

    await prisma.purchase.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar compra" });
  }
};