import { searchColleges } from "@/actions/colleges";
import { CollegeSearch } from "@/components/colleges/CollegeSearch";

export default async function CollegesPage() {
  const initial = await searchColleges({ page: 1, limit: 20 });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">College Search</h1>
        <p className="text-gray-500 mt-1">
          Explore colleges and find the right fit for you
        </p>
      </div>
      <CollegeSearch
        initialColleges={initial.colleges}
        initialTotal={initial.total}
      />
    </div>
  );
}
