import { createFileRoute } from "@tanstack/react-router";
import FilesShell from "@/components/files/FilesShell";
import { meQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files")({
  loader: ({ context }) => context.queryClient.ensureQueryData(meQuery()),
  component: FilesShell,
});
