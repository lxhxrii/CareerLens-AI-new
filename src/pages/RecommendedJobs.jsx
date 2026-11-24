import { useMemo } from "react";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { getJobsByCareer } from "../data/jobs";
import { hasMatchingSkill } from "../data/skills";

function RecommendedJobs({ role, onViewAll }) {
  const profileData = useMemo(() => {
    try {
      const saved = localStorage.getItem("careerLensProfileData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userSkills = profileData?.skills || [];

  const recommendedJobs = useMemo(() => {
    const careerJobs = getJobsByCareer(role || "Data Scientist");

    return careerJobs
      .map((job) => {
        const matchedSkills = job.skills.filter((skill) =>
          hasMatchingSkill(userSkills, skill)
        );

        const matchPercentage =
          job.skills.length === 0
            ? 0
            : Math.round(
                (matchedSkills.length / job.skills.length) * 100
              );

        return {
          ...job,
          matchedSkills,
          matchPercentage,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);
  }, [role, userSkills]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Briefcase className="text-blue-400" size={21} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Recommended Jobs
              </h3>
              <p className="text-sm text-slate-400">
                Top opportunities matched to your current skills
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          View All Jobs
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {recommendedJobs.length > 0 ? (
          recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:-translate-y-1 hover:border-blue-500/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-white">{job.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{job.company}</p>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-2">
                  <Briefcase size={18} className="text-blue-400" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 text-slate-300">
                  <MapPin size={13} />
                  {job.location}
                </span>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400">
                  {job.salary}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Skill Match</span>
                  <span className="text-lg font-bold text-blue-400">
                    {job.matchPercentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${job.matchPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Matching Skills
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.matchedSkills.length > 0 ? (
                    job.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400"
                      >
                        <CheckCircle2 size={13} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Build the required skills to improve this match.
                    </span>
                  )}
                </div>
              </div>

              {job.matchPercentage >= 75 && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400">
                  <Sparkles size={13} />
                  Strong match
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="lg:col-span-3 rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <Briefcase className="mx-auto text-slate-500" size={30} />
            <p className="mt-3 font-medium text-white">
              No jobs available for this career yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Explore the full Jobs section for more opportunities.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecommendedJobs;
