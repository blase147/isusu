// import { PrismaClient } from "@prisma/client";
// import { auth } from "@/auth";
// import { Router } from "express";

// const prisma = new PrismaClient();
// const router = Router();

// /**
//  * @route   POST /api/wallet/send
//  * @desc    Transfer funds to another user
//  * @access  Private
//  */
// router.post("/send", auth, async (req, res) => {
//   try {
//     const { email, amount } = req.body;
//     const senderId = req.user.id; // Extracted from auth middleware

//     if (!email || !amount || amount <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid input" });
//     }

//     // Find sender and recipient
//     const sender = await prisma.user.findUnique({
//       where: { id: senderId },
//       include: { wallet: true },
//     });

//     const recipient = await prisma.user.findUnique({
//       where: { email },
//       include: { wallet: true },
//     });

//     if (!sender || !recipient) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (!sender.wallet || sender.wallet.balance < amount) {
//       return res.status(400).json({ success: false, message: "Insufficient balance" });
//     }

//     // Perform the transaction
//     await prisma.$transaction([
//       prisma.wallet.update({
//         where: { userId: sender.id },
//         data: { balance: { decrement: amount } },
//       }),
//       prisma.wallet.update({
//         where: { userId: recipient.id },
//         data: { balance: { increment: amount } },
//       }),
//       prisma.transaction.create({
//         data: {
//           senderId: sender.id,
//           recipientId: recipient.id,
//           amount,
//           type: "TRANSFER",
//           status: "SUCCESS",
//         },
//       }),
//     ]);

//     return res.status(200).json({ success: true, message: "Money sent successfully" });
//   } catch (error) {
//     console.error("Transaction Error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;
