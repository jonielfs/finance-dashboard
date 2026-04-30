const prisma = require("../prisma");

// ➕ Criar ou atualizar meta (única por usuário)
exports.setGoal = async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ error: "Valor é obrigatório" });
    }

    // 🔍 Busca meta existente (agora única por userId)
    const existing = await prisma.goal.findUnique({
      where: {
        userId: req.userId,
      },
    });

    // 🔄 Atualiza se já existir
    if (existing) {
      const updated = await prisma.goal.update({
        where: { userId: req.userId },
        data: {
          value: Number(value), // 👈 importante (Decimal)
        },
      });

      return res.json({
        ...updated,
        value: Number(updated.value),
      });
    }

    // ➕ Cria se não existir
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId,
        value: Number(value),
      },
    });

    res.status(201).json({
      ...goal,
      value: Number(goal.value),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar meta" });
  }
};

// 📥 Buscar meta (única)
exports.getGoal = async (req, res) => {
  try {
    const goal = await prisma.goal.findUnique({
      where: {
        userId: req.userId,
      },
    });

    if (!goal) {
      return res.json(null);
    }

    res.json({
      ...goal,
      value: Number(goal.value),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar meta" });
  }
};