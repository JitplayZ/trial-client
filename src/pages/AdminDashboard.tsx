import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/sections/AdminOverview";
import { UserManagement } from "@/components/admin/sections/UserManagement";
import { BillingManagement } from "@/components/admin/sections/BillingManagement";
import { SupportReports } from "@/components/admin/sections/SupportReports";
import { ProjectMonitoring } from "@/components/admin/sections/ProjectMonitoring";
import { SystemSettings } from "@/components/admin/sections/SystemSettings";
import { SocialRewardsManagement } from "@/components/admin/sections/SocialRewardsManagement";
const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="support" element={<SupportReports />} />
        <Route path="projects" element={<ProjectMonitoring />} />
        <Route path="social-rewards" element={<SocialRewardsManagement />} />
        <Route path="settings" element={<SystemSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
