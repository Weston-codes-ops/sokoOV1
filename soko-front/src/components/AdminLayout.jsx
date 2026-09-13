import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f4f7f4]">
      <AdminSidebar />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  )
}