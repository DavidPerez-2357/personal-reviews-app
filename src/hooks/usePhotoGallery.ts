import { UserPhoto } from '@/shared/dto/Photo';
import { Camera, CameraOptions, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<UserPhoto[]>([]);

  const savePhoto = async (photo: UserPhoto): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webviewPath!);
    const savedFile = await Filesystem.writeFile({
      path: photo.filepath,
      data: base64Data,
      directory: Directory.Data,
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    const newSavedPhotos = [
      {
        filepath: savedFile.uri,
        webviewPath: photo.webviewPath,
      },
      ...savedPhotos,
    ];
    setSavedPhotos(newSavedPhotos);

    return {
      filepath: savedFile.uri,
      webviewPath: photo.webviewPath,
    };
  };

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

  const deletePhoto = async (photo: UserPhoto) => {
    // remove photo from photos array
    setPhotos(photos.filter((p) => p.filepath !== photo.filepath));
    setSavedPhotos(savedPhotos.filter((p) => p.filepath !== photo.filepath));
  
    // delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data,
    });
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
    savedPhotos,
    setPhotos,
    setSavedPhotos,
    takePhoto,
    importPhoto,
    savePhoto,
    deletePhoto,
  };
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('method did not return a string');
      }
    };
    reader.readAsDataURL(blob);
  });
}