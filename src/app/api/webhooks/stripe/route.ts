/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Webhook signature verification failed", error: err.message },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const transaction = {
        stripeId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        plan: session.metadata?.plan || "",
        credits: Number(session.metadata?.credits) || 0,
        buyerId: session.metadata?.buyerId || "",
        createdAt: new Date(),
      };

      await createTransaction(transaction);
    }

    // ✅ Always return 200 so Stripe knows it was processed
    return new Response("OK", { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Webhook handler error", error: err.message },
      { status: 500 }
    );
  }
}
