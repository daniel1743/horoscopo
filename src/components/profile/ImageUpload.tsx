import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadProfileImage } from "@/lib/storage/upload";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ImageUploadProps {
  userId: string;
  type: "avatar" | "cover";
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function ImageUpload({ userId, type, currentUrl, onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadProfileImage(file, userId, type);
      onUploadSuccess(url);
      toast.success("Imagen subida con éxito.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {currentUrl && (
        <div className="relative overflow-hidden rounded-md border border-line bg-surface">
          <img 
            src={currentUrl} 
            alt={`Current ${type}`} 
            className={`object-cover ${type === 'avatar' ? 'h-24 w-24 rounded-full mx-auto my-4' : 'w-full h-32'}`} 
          />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button 
          type="button" 
          variant={currentUrl ? "outline" : "default"} 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : currentUrl ? (
            `Cambiar ${type === 'avatar' ? 'Avatar' : 'Portada'}`
          ) : (
            `Subir ${type === 'avatar' ? 'Avatar' : 'Portada'}`
          )}
        </Button>
      </div>
    </div>
  );
}
