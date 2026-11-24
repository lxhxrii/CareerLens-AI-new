import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Briefcase,
  MapPin,
  BookOpen,
  Target,
  Rocket,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

import { getCareer } from "../data/careers";
import { hasMatchingSkill } from "../data/skills";
import { getProfileAnalytics } from "../services/api";

function CareerInsights({
  profileData,
  onBack,
  onSkillGap,
  onRoadmap,
  onJobs,
}) {
  const targetCareer = profileData?.targetCareer || "Data Scientist";

  const [backendAnalytics, setBackendAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      if (!profileData?.id && !profileData?.profileId) {
        setBackendAnalytics(null);
        setAnalyticsError("");
        return;
      }

      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const id = profileData.id || profileData.profileId;
        const result = await getProfileAnalytics(id);

        if (!cancelled) {
          setBackendAnalytics(result);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendAnalytics(null);
          setAnalyticsError(
            "Backend analytics are unavailable right now. Showing local career analysis."
          );
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [profileData?.id, profileData?.profileId, profileData?.skills, targetCareer]);

  const career = useMemo(() => {
    return getCareer(targetCareer) || getCareer("Data Scientist");
  }, [targetCareer]);

  const analysis = useMemo(() => {
    if (!career) {
      return {
        matchedSkills: [],
        missingSkills: [],
        readinessScore: 0,
        strengths: [],
        recommendations: [],
      };
    }

    const requiredSkills = career.skills || [];
    const userSkills = profileData?.skills || [];

    const matchedSkills = requiredSkills.filter((skill) =>
      hasMatchingSkill(userSkills, skill.name || skill)
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !hasMatchingSkill(userSkills, skill.name || skill)
    );

    const totalDemand = requiredSkills.reduce(
      (sum, skill) => sum + Number(skill.demand || 0),
      0
    );

    const matchedDemand = matchedSkills.reduce(
      (sum, skill) => sum + Number(skill.demand || 0),
      0
    );

    const readinessScore =
      totalDemand > 0
        ? Math.round((matchedDemand / totalDemand) * 100)
        : requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    const strengths = [...matchedSkills]
      .sort((a, b) => Number(b.demand || 0) - Number(a.demand || 0))
      .slice(0, 4);

    const recommendations = [...missingSkills]
      .sort((a, b) => Number(b.demand || 0) - Number(a.demand || 0))
      .slice(0, 5);

    return {
      matchedSkills,
      missingSkills,
      readinessScore,
      strengths,
      recommendations,
    };
  }, [career, profileData]);

  // Prefer the backend analytics engine when profile analytics are available.
  const backendScore =
    backendAnalytics?.readinessScore ??
    backendAnalytics?.analytics?.readinessScore ??
    null;

  const effectiveReadinessScore =
    typeof backendScore === "number"
      ? Math.max(0, Math.min(100, Math.round(backendScore)))
      : analysis.readinessScore;

  const backendMatchedSkills =
    backendAnalytics?.matchedSkills ??
    backendAnalytics?.analytics?.matchedSkills ??
    null;

  const backendMissingSkills =
    backendAnalytics?.missingSkills ??
    backendAnalytics?.analytics?.missingSkills ??
    null;

  const backendRecommendations =
    backendAnalytics?.recommendedSkills ??
    backendAnalytics?.analytics?.recommendedSkills ??
    null;

  const effectiveMatchedSkills = Array.isArray(backendMatchedSkills)
    ? backendMatchedSkills
    : analysis.matchedSkills;

  const effectiveMissingSkills = Array.isArray(backendMissingSkills)
    ? backendMissingSkills
    : analysis.missingSkills;

  const effectiveRecommendations = Array.isArray(backendRecommendations)
    ? backendRecommendations
    : analysis.recommendations;

  const getReadinessLabel = (score) => {
    if (score >= 80) return "Career Ready";
    if (score >= 60) return "Almost Ready";
    if (score >= 40) return "Building Skills";
    return "Early Stage";
  };

  const getReadinessMessage = (score) => {
    if (score >= 80) {
      return "Your current skills align strongly with this career. Focus on projects, interview preparation, and real-world experience.";
    }

    if (score >= 60) {
      return "You have a strong foundation. Closing a few important skill gaps can significantly improve your career readiness.";
    }

    if (score >= 40) {
      return "You have started building relevant skills. Focus on the high-demand skills below and strengthen them through projects.";
    }

    return "You are at the beginning of your journey. Build the core skills first, then move toward projects and job applications.";
  };

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold shadow-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 text-orange-500" size={42} />
          <h2 className="text-2xl font-bold text-slate-900">
            Career data unavailable
          </h2>
          <p className="mt-2 text-slate-500">
            We couldn't load the selected career information.
          </p>
        </div>
      </div>
    );
  }

  const salary = career.salary || "Not available";
  const jobs = career.jobs ?? "Not available";
  const growth = career.growth || "Not available";
  const demand = career.demand || "Not available";
  const location = career.topLocation || "Multiple locations";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 text-white shadow-lg">
              <BrainCircuit size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                CareerLens AI Insights
              </h1>
              <p className="text-xs text-slate-500">
                Personalized career intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-blue-100">
              <BrainCircuit size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                AI Career Analysis
              </span>
            </div>

            <h2 className="text-3xl font-extrabold md:text-4xl">
              Your Career Insights
            </h2>

            <p className="mt-3 max-w-2xl text-lg text-blue-100">
              Personalized analysis based on your current skills and your
              target career:{" "}
              <span className="font-bold text-white">{career.careerName}</span>
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                🎯 {getReadinessLabel(effectiveReadinessScore)}
              </span>

              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                📊 {effectiveReadinessScore}% Readiness
              </span>

              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                🧠 {effectiveMatchedSkills.length} Skills Matched
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  analyticsLoading
                    ? "bg-yellow-300 animate-pulse"
                    : backendAnalytics
                    ? "bg-emerald-300"
                    : "bg-slate-300"
                }`}
              />
              <span className="text-blue-100">
                {analyticsLoading
                  ? "Connecting to CareerLens Analytics Engine..."
                  : backendAnalytics
                  ? "Powered by CareerLens backend analytics"
                  : "Local career analysis active"}
              </span>
            </div>

            {analyticsError && (
              <p className="mt-2 text-xs text-blue-100/80">
                {analyticsError}
              </p>
            )}
          </div>
        </section>

        {/* Readiness + Market */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Readiness */}
          <div className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Career Readiness
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {getReadinessLabel(effectiveReadinessScore)}
                </h3>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                <span className="text-2xl font-extrabold text-blue-700">
                  {effectiveReadinessScore}%
                </span>
              </div>
            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700"
                style={{ width: `${effectiveReadinessScore}%` }}
              />
            </div>

            <p className="mt-5 leading-7 text-slate-600">
              {getReadinessMessage(effectiveReadinessScore)}
            </p>
          </div>

          {/* Market */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <TrendingUp size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-400">Market Snapshot</p>
                <h3 className="font-bold text-slate-900">
                  {career.careerName}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <DollarSign size={17} />
                  Salary
                </span>
                <span className="font-bold text-slate-900">{salary}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Briefcase size={17} />
                  Jobs
                </span>
                <span className="font-bold text-slate-900">{jobs}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <TrendingUp size={17} />
                  Growth
                </span>
                <span className="font-bold text-green-600">{growth}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Target size={17} />
                  Demand
                </span>
                <span className="font-bold text-blue-600">{demand}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <MapPin size={17} />
                  Top Location
                </span>
                <span className="text-right font-bold text-slate-900">
                  {location}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Strengths and gaps */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Your Strengths
                </h3>
                <p className="text-sm text-slate-500">
                  Skills already aligned with your target career
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(effectiveMatchedSkills.length > 0 ? effectiveMatchedSkills.slice(0, 4) : analysis.strengths).length > 0 ? (
                (effectiveMatchedSkills.length > 0 ? effectiveMatchedSkills.slice(0, 4) : analysis.strengths).map((skill, index) => (
                  <div
                    key={`${skill.name || skill}-${index}`}
                    className="flex items-center justify-between rounded-2xl bg-green-50 p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {skill.name || skill}
                      </p>
                      <p className="text-xs text-slate-500">
                        {skill.category || "Relevant skill"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Matched
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">
                  No strong skill matches yet. Start with the recommended
                  skills below.
                </div>
              )}
            </div>
          </div>

          {/* Gaps */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Skill Gaps
                </h3>
                <p className="text-sm text-slate-500">
                  Important skills to strengthen
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {effectiveRecommendations.length > 0 ? (
                effectiveRecommendations.map((skill, index) => (
                  <div
                    key={`${skill.name || skill}-${index}`}
                    className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        {skill.name || skill}
                      </p>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {skill.demand || "High"} Demand
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100">
                      <div
                        className="h-full rounded-full bg-orange-400"
                        style={{
                          width: `${Math.min(
                            100,
                            Number(skill.demand || 70)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-green-50 p-5 text-center text-green-700">
                  🎉 No major skill gaps detected.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Learning recommendations */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <BookOpen size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Recommended Learning Path
              </h3>
              <p className="text-sm text-slate-500">
                Prioritized skills based on career relevance
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {effectiveRecommendations.slice(0, 3).map((skill, index) => (
              <div
                key={`${skill.name || skill}-${index}`}
                className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>

                  <Lightbulb size={20} className="text-purple-500" />
                </div>

                <h4 className="mt-4 font-bold text-slate-900">
                  Learn {skill.name || skill}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Build practical knowledge and complete a project using this
                  skill to improve your career readiness.
                </p>
              </div>
            ))}

            {effectiveRecommendations.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 rounded-2xl bg-green-50 p-6 text-center text-green-700">
                Your current skill profile already covers the major required
                skills for this career.
              </div>
            )}
          </div>
        </section>

        {/* Action plan */}
        <section className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-7 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <Rocket size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold">Your Next Steps</h3>
              <p className="text-sm text-slate-300">
                A practical plan based on your current profile
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <span className="text-sm font-bold text-blue-300">
                STEP 01
              </span>
              <h4 className="mt-2 font-bold">Close Skill Gaps</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Focus first on the highest-demand missing skills.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <span className="text-sm font-bold text-purple-300">
                STEP 02
              </span>
              <h4 className="mt-2 font-bold">Build Projects</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Apply your skills through projects that demonstrate practical
                ability.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <span className="text-sm font-bold text-cyan-300">
                STEP 03
              </span>
              <h4 className="mt-2 font-bold">Explore Jobs</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use CareerLens job recommendations to identify relevant
                opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <button
            onClick={onSkillGap}
            className="group rounded-2xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Target className="text-blue-600" size={24} />
              <ArrowRight
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                size={20}
              />
            </div>

            <h4 className="mt-4 font-bold text-slate-900">View Skill Gap</h4>
            <p className="mt-1 text-sm text-slate-500">
              See your detailed skill comparison.
            </p>
          </button>

          <button
            onClick={onRoadmap}
            className="group rounded-2xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Rocket className="text-purple-600" size={24} />
              <ArrowRight
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-600"
                size={20}
              />
            </div>

            <h4 className="mt-4 font-bold text-slate-900">
              Open Career Roadmap
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Follow a structured learning plan.
            </p>
          </button>

          <button
            onClick={onJobs}
            className="group rounded-2xl bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Briefcase className="text-green-600" size={24} />
              <ArrowRight
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-600"
                size={20}
              />
            </div>

            <h4 className="mt-4 font-bold text-slate-900">Explore Jobs</h4>
            <p className="mt-1 text-sm text-slate-500">
              Find jobs matching your target career.
            </p>
          </button>
        </section>
      </main>
    </div>
  );
}

export default CareerInsights;