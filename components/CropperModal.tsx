"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropUtils";
import { Button } from "./ui/button";

type CropperModalProps = {
  image: string;
  show: boolean;
  onClose: () => void;
  onCrop: (croppedBlob: Blob, preview: string) => void;
};

const CropperModal: React.FC<CropperModalProps> = ({ image, show, onClose, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (show) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [show]);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      const { blob, preview } = await getCroppedImg(image, croppedAreaPixels);
      onCrop(blob, preview);
      onClose();
    } catch (e) {
      console.error("Cropping failed:", e);
    }
  };

  return (
    <dialog ref={dialogRef} className="w-[90vw] max-w-2xl rounded-md p-0 overflow-hidden shadow-lg">
      <div className="relative w-full h-[400px] bg-black">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="flex justify-end gap-2 p-4 border-t">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button onClick={handleCrop}>Crop</Button>
      </div>
    </dialog>
  );
};

export default CropperModal;
