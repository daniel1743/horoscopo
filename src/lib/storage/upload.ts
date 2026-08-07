import { supabase } from "@/integrations/supabase/client";

/**
 * Sube una imagen al bucket de profile-images.
 * @param file El archivo a subir
 * @param userId El ID del usuario actual
 * @param type "avatar" o "cover"
 * @returns La URL pública de la imagen
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  type: "avatar" | "cover"
): Promise<string> {
  if (!file) throw new Error("No file provided");

  // Validate size (< 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("El archivo excede el límite de 2MB");
  }

  // Validate type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Formato inválido. Usa JPG, PNG o WEBP.");
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError, data } = await supabase.storage
    .from("profile-images")
    .upload(fileName, file, {
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("profile-images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
