"use client";

import React from "react";
import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { useUser } from "@/context/UserContext";
import { redirect } from "next/navigation";

const AddTransformationTypePage = ({ params }: SearchParamProps) => {
  const resolvedParams = React.use(params);
  const { type } = resolvedParams;
  const { config, icon, title, subTitle } = transformationTypes[type];
  const user = useUser();

  if (!user) return redirect("/sign-in");

  return (
    <>
      <Header title={title} subTitle={subTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={type}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
