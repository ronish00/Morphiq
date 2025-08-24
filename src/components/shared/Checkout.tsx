"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

import { toast } from "sonner";
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast.success("Order placed!", {
        description: "You will receive an email confirmation",
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast.error("Order canceled!", {
        description: "Continue to shop around and checkout when you're ready",
        className: "error-toast",
      });
    }
  }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    await checkoutCredits(transaction);
  };

  return (
    <section>
      <Button
        type="submit"
        role="link"
        className="w-full rounded-full bg-btnGradient bg-cover"
        onClick={onCheckout}
      >
        Buy Credit
      </Button>
    </section>
  );
};

export default Checkout;
