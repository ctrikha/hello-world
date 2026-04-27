"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? undefined;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT", inviteToken },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterInput) {
    setServerError("");
    const result = await registerUser(data);
    if (result.error) {
      setServerError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-semibold mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm">
          We sent a magic link to your inbox. Click it to finish signing up.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8">
      <h2 className="text-xl font-semibold mb-6">Create your account</h2>

      {inviteToken && (
        <div className="bg-indigo-50 text-indigo-700 text-sm rounded-lg p-3 mb-4">
          You were invited to join a college advisory workspace.
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Jane Smith"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {!inviteToken && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "STUDENT", label: "Student", desc: "Researching colleges" },
                { value: "ADVISOR", label: "Advisor", desc: "Helping students" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition ${
                    selectedRole === opt.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
        )}

        <input {...register("inviteToken")} type="hidden" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
