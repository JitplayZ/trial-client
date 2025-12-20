import { Helmet } from 'react-helmet';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SocialRewardsManagement } from '@/components/admin/sections/SocialRewardsManagement';

const AdminSocialRewards = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Social Rewards - Admin Panel</title>
      </Helmet>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Social Rewards</h1>
          <p className="text-foreground-secondary">Review and approve social media posts for free credits</p>
        </div>
        <SocialRewardsManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminSocialRewards;
