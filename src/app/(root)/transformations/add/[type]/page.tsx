import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  const { type } = await params;
  const { userId, redirectToSignIn } = await auth();
  const { config, icon, title, subTitle } = transformationTypes[type];

  if (!userId) return redirectToSignIn();

  const user = await getUserById(userId);

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
