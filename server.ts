import express from "express";
import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter";
import { deductionQueue } from "./app/lib/queues"; // Adjust path based on your setup

const app = express();
const PORT = 3000; // Change this if needed

// Bull Board UI Setup
const { router } = createBullBoard([
  new BullMQAdapter(deductionQueue),
]);

app.use("/admin/queues", router);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 View BullMQ Dashboard at http://localhost:${PORT}/admin/queues`);
});
