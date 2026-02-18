export async function fileToImageData(file: File): Promise<ImageData> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 224, 224);

  return ctx.getImageData(0, 0, 224, 224);
}
