import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("Received request to /api/admin/approve-withdrawal");

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { withdrawalId, action } = body;

    if (
      !withdrawalId ||
      !action ||
      (action !== "approve" && action !== "reject")
    ) {
      console.log("Invalid input:", { withdrawalId, action });
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { guideFinance: true } } },
    });

    if (!withdrawal) {
      console.log("Withdrawal not found:", withdrawalId);
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    console.log("Fetched withdrawal:", withdrawal);

    if (withdrawal.status !== "PENDING") {
      console.log("Withdrawal is not pending:", withdrawal.status);
      return NextResponse.json(
        { error: "Withdrawal is not in PENDING state" },
        { status: 400 }
      );
    }

    const guideFinance = Array.isArray(withdrawal.user.guideFinance)
      ? withdrawal.user.guideFinance[0]
      : withdrawal.user.guideFinance;

    if (!guideFinance) {
      console.log("Guide finance not found for user:", withdrawal.user.id);
      return NextResponse.json(
        { error: "Guide finance record not found" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      if (guideFinance.balance < withdrawal.amount) {
        console.log(
          "Insufficient balance:",
          guideFinance.balance,
          "needed:",
          withdrawal.amount
        );
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }

      try {
        const result = await prisma.$transaction([
          prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: "APPROVED" },
          }),
          prisma.guideFinance.update({
            where: { id: guideFinance.id },
            data: { balance: { decrement: withdrawal.amount } },
          }),
          prisma.guideTransaction.create({
            data: {
              guideFinanceId: guideFinance.id,
              amount: -withdrawal.amount,
              type: "DEBIT",
              description: `Withdrawal approved (ID: ${withdrawalId})`,
            },
          }),
        ]);
        console.log("Transaction result:", result);
      } catch (transactionError) {
        console.error("Transaction error:", transactionError);
        return NextResponse.json(
          {
            error: "Failed to process approval",
            details: transactionError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Withdrawal approved and processed",
      });
    } else {
      try {
        const result = await prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "REJECTED" },
        });
        console.log("Rejection result:", result);
      } catch (updateError) {
        console.error("Update error:", updateError);
        return NextResponse.json(
          {
            error: "Failed to process rejection",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Withdrawal rejected" });
    }
  } catch (error) {
    console.error("Unhandled error in withdrawal approval:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
