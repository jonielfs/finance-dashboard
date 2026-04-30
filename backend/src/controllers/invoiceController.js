const prisma = require("../prisma");

// Criar fatura
exports.createInvoice = async (req, res) => {
  try {
    const { cardId, referenceDate, totalAmount, status } = req.body;

    if (!cardId || !referenceDate || !totalAmount) {
      return res.status(400).json({ error: "Dados obrigatórios" });
    }

    const baseDate = new Date(referenceDate + "T12:00:00");

    const startOfMonth = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      1
    );

    const endOfMonth = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + 1,
      1
    );

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        cardId: Number(cardId),
        referenceDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    if (existingInvoice) {
      return res.status(400).json({
        error: "Já existe uma fatura para esse cartão neste mês",
      });
    }

    // 🔐 Verifica ownership
    const card = await prisma.creditCard.findFirst({
      where: {
        id: Number(cardId),
        userId: req.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }

    // 🔒 valida status
    const allowedStatus = ["OPEN", "CLOSED", "PAID"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    // 🧠 CORREÇÃO DE TIMEZONE
    const safeDate = new Date(referenceDate + "T12:00:00");

    const invoice = await prisma.invoice.create({
      data: {
        cardId: Number(cardId),
        referenceDate: safeDate,
        totalAmount: Number(totalAmount),
        status: status || "OPEN",
      },
    });

    res.status(201).json({
      ...invoice,
      totalAmount: Number(invoice.totalAmount),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar fatura" });
  }
};

// Listar faturas
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        card: {
          userId: req.userId,
        },
      },
      orderBy: {
        referenceDate: "desc",
      },
    });

    res.json(
      invoices.map((inv) => ({
        ...inv,
        totalAmount: Number(inv.totalAmount),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar faturas" });
  }
};

// Atualizar fatura
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, status } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(id),
        card: { userId: req.userId },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Fatura não encontrada" });
    }

    // 🔒 valida status
    const allowedStatus = ["OPEN", "CLOSED", "PAID"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const updated = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        totalAmount: Number(totalAmount),
        ...(status && { status }),
      },
    });

    res.json({
      ...updated,
      totalAmount: Number(updated.totalAmount),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar fatura" });
  }
};

// Sugestão baseada em parcelas
exports.getSuggestedInvoice = async (req, res) => {
  try {
    const userId = req.userId;
    const { year, month, cardId } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Informe ano e mês" });
    }

    const installments = await prisma.installment.findMany({
      where: {
        purchase: {
          card: {
            userId,
            ...(cardId ? { id: Number(cardId) } : {}),
          },
        },
      },
    });

    const total = installments
      .filter((i) => {
        const d = new Date(i.dueDate);

        return (
          d.getUTCFullYear() == year &&
          d.getUTCMonth() + 1 == month
        );
      })
      .reduce((sum, i) => sum + Number(i.amount), 0); // 👈 FIX DECIMAL

    res.json({ suggestedTotal: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular sugestão" });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 valida ownership
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(id),
        card: {
          userId: req.userId,
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Fatura não encontrada" });
    }

    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Fatura deletada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar fatura" });
  }
};