import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentProfile, getAdvisorProfile } from "@/actions/profile";
import { StudentProfileForm } from "@/components/profile/StudentProfileForm";
import { AdvisorProfileForm } from "@/components/profile/AdvisorProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;

  if (role === "STUDENT") {
    const profile = await getStudentProfile();
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="bg-white border rounded-xl p-6">
          <StudentProfileForm defaultValues={profile ?? undefined} />
        </div>
      </div>
    );
  }

  if (role === "ADVISOR") {
    const profile = await getAdvisorProfile();
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="bg-white border rounded-xl p-6">
          <AdvisorProfileForm defaultValues={profile ?? undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <p className="text-gray-500">Profile not available for your role.</p>
    </div>
  );
}
