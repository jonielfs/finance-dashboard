const prisma = require("../prisma");

// Criar cartão
exports.createCard = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const card = await prisma.creditCard.create({
      data: {
        name,
        userId: req.userId,
      },
    });

    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar cartão" });
  }
};

// Listar cartões do usuário
exports.getCards = async (req, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: {
        userId: req.userId,
      },
    });

    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cartões" });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.creditCard.findFirst({
      where: {
        id: Number(id),
        userId: req.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }

    await prisma.creditCard.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Cartão deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar cartão" });
  }
};