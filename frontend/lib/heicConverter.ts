let heic2anyInstance: any = null;

const loadHeic2Any = async () => {
  if (!heic2anyInstance) {
    heic2anyInstance = (await import("heic2any")).default;
  }
  return heic2anyInstance;
};

export async function convertHeicToJpeg(
  heicFile: File,
  quality: number = 0.8
): Promise<File> {
  try {
    const heic2any = await loadHeic2Any();

    const jpegBlob = await heic2any({
      blob: heicFile,
      toType: "image/jpeg",
      quality: quality,
    });

    const jpegFile = new File(
      [jpegBlob as Blob],
      heicFile.name.replace(/\.heic$/i, ".jpg"),
      {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      }
    );
    return jpegFile;
  } catch (error) {
    console.error("process heic image file error: ", error);
    throw new Error("process heic file image error");
  }
}
