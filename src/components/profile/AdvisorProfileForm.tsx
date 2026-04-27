"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  advisorProfileSchema,
  type AdvisorProfileInput,
} from "@/lib/validations/profile";
import { upsertAdvisorProfile } from "@/actions/profile";
import type { AdvisorProfile } from "@prisma/client";

const SPECIALIZATIONS = [
  "Ivy League",
  "STEM",
  "Liberal Arts",
  "Financial Aid",
  "Athletics",
  "International Students",
  "First-Generation",
  "Transfer",
  "Graduate Schools",
  "Art & Design",
];

interface Props {
  defaultValues?: Partial<AdvisorProfile>;
}

export function AdvisorProfileForm({ defaultValues }: Props) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<AdvisorProfileInput>({
    resolver: zodResolver(advisorProfileSchema) as never,
    defaultValues: {
      bio: defaultValues?.bio ?? "",
      specializations: defaultValues?.specializations ?? [],
      yearsExperience: defaultValues?.yearsExperience ?? 0,
      acceptingClients: defaultValues?.acceptingClients ?? true,
      calendarUrl: defaultValues?.calendarUrl ?? "",
      timezone: defaultValues?.timezone ?? "America/New_York",
    },
  });

  const selected = watch("specializations") ?? [];

  function toggleSpec(s: string) {
    const next = selected.includes(s)
      ? selected.filter((v) => v !== s)
      : [...selected, s];
    setValue("specializations", next);
  }

  async function onSubmit(data: AdvisorProfileInput) {
    setServerError("");
    const result = await upsertAdvisorProfile(data);
    if (result.error) {
      setServerError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          placeholder="Tell students about your background and approach..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpec(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selected.includes(s)
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            {...register("yearsExperience")}
            type="number"
            min="0"
            max="50"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            {...register("timezone")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[
              "America/New_York",
              "America/Chicago",
              "America/Denver",
              "America/Los_Angeles",
              "America/Phoenix",
              "Pacific/Honolulu",
            ].map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("America/", "").replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calendar / Booking Link (optional)
        </label>
        <input
          {...register("calendarUrl")}
          type="url"
          placeholder="https://calendly.com/your-link"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          {...register("acceptingClients")}
          type="checkbox"
          id="accepting"
          className="w-4 h-4 accent-indigo-600"
        />
        <label htmlFor="accepting" className="text-sm text-gray-700">
          Currently accepting new students
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : saved ? "Saved!" : "Save profile"}
      </button>
    </form>
  );
}
