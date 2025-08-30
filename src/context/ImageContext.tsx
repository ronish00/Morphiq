"use client"
import { IImage } from "@/lib/database/models/image.model";
import { createContext, ReactNode, useContext } from "react";

type ImageContextType = {
  images: IImage[];
  totalPages: number;
};

// Props for the provider
interface ImageProviderProps {
  images: IImage[];
  totalPages: number;
  children: ReactNode;
}

const ImageContext = createContext<ImageContextType | null>(null);

export const ImageProvider = ({images, totalPages, children} : ImageProviderProps) => {
    return(
        <ImageContext.Provider value={{images, totalPages}}>
            {children}
        </ImageContext.Provider>
    )
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if(!context){
        throw new Error("useImages must be used within an ImageProvider");
    }
    return context;
};