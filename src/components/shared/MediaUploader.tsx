import { toast } from "sonner";
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetError,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

interface MediaUploaderProps {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<React.SetStateAction<ImageProps>>;
  image: ImageProps;
  publicId: string;
  type: string;
}

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  publicId,
  type,
}: MediaUploaderProps) => {
  const onUploadSuccessHandler = (result: CloudinaryUploadWidgetResults) => {
    if (!result.info || typeof result.info !== "object") return;

    const { public_id, width, height, secure_url } = result.info as {
      public_id: string;
      width: number;
      height: number;
      secure_url: string;
    };

    setImage((prevState: ImageProps) => ({
      ...prevState,
      publicId: public_id,
      width,
      height,
      secureUrl: secure_url,
    }));

    onValueChange(public_id);

    toast.success("Image uploaded successfully", {
      className: "success-toast",
      description: "1 credit was deducted from your account",
    });
  };

  const onUploadErrorHandler = (result: CloudinaryUploadWidgetError) => {
    toast.error("Something went wrong while uploading", {
      className: "error-toast",
      description: "Please ty again",
    });
  };

  return (
    <CldUploadWidget
      uploadPreset="morphiq"
      options={{
        multiple: false,
        resourceType: "image",
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">Original</h3>
          {publicId ? (
            <div className="cursor-ppointer overflow-hidden rounded-[10px]">
              <CldImage
                width={getImageSize(type, image, "width")}
                height={getImageSize(type, image, "height")}
                src={publicId}
                alt="image"
                sizes={"(max-width: 768px) 100vw, 50vw"}
                placeholder={dataUrl as PlaceholderValue}
                className="media-uploader_cldImage"
              />
            </div>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                <Image
                  src={"/assets/icons/add.svg"}
                  alt="Add Image"
                  width={24}
                  height={24}
                />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;
