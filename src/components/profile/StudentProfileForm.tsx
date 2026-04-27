"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentProfileSchema,
  type StudentProfileInput,
} from "@/lib/validations/profile";
import { upsertStudentProfile } from "@/actions/profile";
import type { StudentProfile } from "@prisma/client";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const REGIONS = ["Northeast", "Midwest", "South", "West"];

const COMMON_MAJORS = [
  "Computer Science", "Biology", "Business", "Engineering", "Psychology",
  "Economics", "Political Science", "English", "Mathematics", "Chemistry",
  "Communications", "History", "Nursing", "Education", "Art",
];

interface Props {
  defaultValues?: Partial<StudentProfile>;
}

export function StudentProfileForm({ defaultValues }: Props) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema) as never,
    defaultValues: {
      gpa: defaultValues?.gpa ? Number(defaultValues.gpa) : undefined,
      satScore: defaultValues?.satScore ?? undefined,
      actScore: defaultValues?.actScore ?? undefined,
      graduationYear: defaultValues?.graduationYear ?? 2025,
      highSchool: defaultValues?.highSchool ?? "",
      highSchoolType: defaultValues?.highSchoolType ?? "PUBLIC",
      state: defaultValues?.state ?? "",
      intendedMajors: defaultValues?.intendedMajors ?? [],
      preferredSize: defaultValues?.preferredSize ?? undefined,
      preferredRegion: defaultValues?.preferredRegion ?? [],
      maxTuition: defaultValues?.maxTuition ?? undefined,
      prefersCampus: defaultValues?.prefersCampus ?? undefined,
      awards: defaultValues?.awards ?? [],
      apCourses: defaultValues?.apCourses ?? [],
      ibCourses: defaultValues?.ibCourses ?? [],
    },
  });

  const selectedMajors = watch("intendedMajors") ?? [];
  const selectedRegions = watch("preferredRegion") ?? [];

  function toggleArray(
    field: "intendedMajors" | "preferredRegion",
    value: string
  ) {
    const current = field === "intendedMajors" ? selectedMajors : selectedRegions;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next);
  }

  async function onSubmit(data: StudentProfileInput) {
    setServerError("");
    const result = await upsertStudentProfile(data);
    if (result.error) {
      setServerError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const steps = ["Academic", "Preferences", "Background"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition ${
              i === step
                ? "bg-indigo-600 text-white"
                : i < step
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
          {serverError}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (unweighted)
              </label>
              <input
                {...register("gpa")}
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                placeholder="3.85"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <select
                {...register("graduationYear")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SAT Score
              </label>
              <input
                {...register("satScore")}
                type="number"
                min="400"
                max="1600"
                placeholder="1400"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ACT Score
              </label>
              <input
                {...register("actScore")}
                type="number"
                min="1"
                max="36"
                placeholder="32"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                High School
              </label>
              <input
                {...register("highSchool")}
                type="text"
                placeholder="Lincoln High School"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Type
              </label>
              <select
                {...register("highSchoolType")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="CHARTER">Charter</option>
                <option value="HOMESCHOOL">Homeschool</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intended Majors
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_MAJORS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArray("intendedMajors", m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedMajors.includes(m)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred College Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "SMALL", label: "Small", desc: "< 5,000" },
                { value: "MEDIUM", label: "Medium", desc: "5–15k" },
                { value: "LARGE", label: "Large", desc: "15,000+" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition ${
                    watch("preferredSize") === opt.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    {...register("preferredSize")}
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Campus Setting
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "URBAN", label: "Urban", desc: "City campus" },
                { value: "SUBURBAN", label: "Suburban", desc: "Near a city" },
                { value: "RURAL", label: "Rural", desc: "College town" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition ${
                    watch("prefersCampus") === opt.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    {...register("prefersCampus")}
                    type="radio"
                    value={opt.value}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Regions
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleArray("preferredRegion", r)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedRegions.includes(r)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Annual Budget (after aid)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">
                $
              </span>
              <input
                {...register("maxTuition")}
                type="number"
                min="0"
                step="1000"
                placeholder="30000"
                className="w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home State
            </label>
            <select
              {...register("state")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Awards & Honors
            </label>
            <textarea
              onChange={(e) =>
                setValue(
                  "awards",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              defaultValue={(defaultValues?.awards ?? []).join("\n")}
              rows={3}
              placeholder="National Merit Scholar&#10;AP Scholar with Distinction&#10;..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">One per line</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Statement (optional)
            </label>
            <textarea
              {...register("personalStatement")}
              rows={8}
              placeholder="Tell your story..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : saved ? "Saved!" : "Save profile"}
          </button>
        )}
      </div>
    </form>
  );
}
