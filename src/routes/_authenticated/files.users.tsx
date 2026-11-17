import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "@/components/pages/files/UsersPage";
import { privateHead } from "@/lib/seo";
import { peopleQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/users")({
  head: () => privateHead("المستخدمون", "إدارة حسابات الموظفين والعملاء وصلاحياتهم."),
  loader: ({ context }) => context.queryClient.ensureQueryData(peopleQuery()),
  component: UsersPage,
});
