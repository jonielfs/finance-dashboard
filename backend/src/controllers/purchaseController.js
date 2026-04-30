const prisma = require("../prisma");
const { generateInstallments } = require("../services/installmentService");

exports.createPurchase = async (req, res) => {
  try {
    const { description, totalAmount, installments, purchaseDate, cardId } = req.body;

    if (!description || !totalAmount || !installments || !cardId) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }

    // 🔐 Validar cartão do usuário
    const card = await prisma.creditCard.findFirst({
      where: {
        id: Number(cardId),
        userId: req.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }

    const installmentsData = generateInstallments(
      Number(totalAmount),
      Number(installments),
      purchaseDate
    );

    const purchase = await prisma.purchase.create({
      data: {
        description,
        totalAmount: Number(totalAmount),
        installments: Number(installments),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
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
        purchaseDate: "desc", // 👈 importante (mais recente primeiro)
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