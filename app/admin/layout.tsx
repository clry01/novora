
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 md:flex-row">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
