
import DashboardLayout from "@/layouts/DashboardLayout";

const Create = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create</h1>
        <p className="text-gray-500">Create new workflows and automation</p>
      </div>
      
      <div className="glass rounded-xl p-8 overflow-hidden border border-gray-100 shadow-sm">
        <div className="text-center py-10">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-medium mb-2">Coming Soon</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            We're working on this feature. Check back soon for workflow creation tools!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Create;
