import { UserPhoto } from '@/shared/dto/Photo';
import { Camera, CameraOptions, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = Date.now() + '.jpeg';
    const newPhotos = [
      {
        filepath: fileName,
        webviewPath: photo.webPath,
      },
      ...photos,
    ];
    setPhotos(newPhotos);
  };

  const importPhoto = async () => {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    const fileName = Date.now() + '.jpeg';

    const newPhotos = [
      {
        filepath: fileName,
        webviewPath: photo.webPath,
      },
      ...photos,
    ];
    setPhotos(newPhotos);
  }

  return {
    photos,
    setPhotos,
    takePhoto,
    importPhoto,
  };
}