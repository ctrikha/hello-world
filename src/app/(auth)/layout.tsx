export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "College Advisory"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Your path to the right college
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
