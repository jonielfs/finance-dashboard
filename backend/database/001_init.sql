-- =========================
-- USER
-- =========================
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- CREDIT CARD
-- =========================
CREATE TABLE IF NOT EXISTS "CreditCard" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  CONSTRAINT "CreditCard_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================
-- INVOICE
-- =========================
CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" SERIAL PRIMARY KEY,
  "referenceDate" TIMESTAMP NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "cardId" INTEGER NOT NULL,
  CONSTRAINT "Invoice_cardId_fkey"
    FOREIGN KEY ("cardId") REFERENCES "CreditCard"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================
-- PURCHASE
-- =========================
CREATE TABLE IF NOT EXISTS "Purchase" (
  "id" SERIAL PRIMARY KEY,
  "description" TEXT NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "installments" INTEGER NOT NULL,
  "purchaseDate" TIMESTAMP NOT NULL,
  "cardId" INTEGER NOT NULL,
  CONSTRAINT "Purchase_cardId_fkey"
    FOREIGN KEY ("cardId") REFERENCES "CreditCard"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================
-- INSTALLMENT
-- =========================
CREATE TABLE IF NOT EXISTS "Installment" (
  "id" SERIAL PRIMARY KEY,
  "number" INTEGER NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  "paid" BOOLEAN NOT NULL DEFAULT FALSE,
  "purchaseId" INTEGER NOT NULL,
  CONSTRAINT "Installment_purchaseId_fkey"
    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- GOAL
-- =========================
CREATE TABLE IF NOT EXISTS "Goal" (
  "id" SERIAL PRIMARY KEY,
  "value" DECIMAL(10,2) NOT NULL,
  "userId" INTEGER NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Goal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);