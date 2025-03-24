
import DashboardLayout from "@/layouts/DashboardLayout";

const ContentHub = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Hub</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your content library and resources</p>
      </div>
      
      <div className="glass dark:glass-dark rounded-xl p-8 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="text-center py-10">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-medium mb-2 dark:text-white">Coming Soon</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            We're working on this feature. Check back soon for content management tools!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContentHub;
