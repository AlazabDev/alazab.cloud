import { useQuery } from "@tanstack/react-query";
import { signedUrl } from "@/lib/files/upload";

export function useSignedUrl(path: string | null | undefined, download?: string) {
  return useQuery({
    queryKey: ["files", "signed", path, download ?? ""],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: () => signedUrl(path!, download ? { download } : undefined),
  });
}
