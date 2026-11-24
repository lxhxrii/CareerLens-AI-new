import { useEffect, useState } from "react";
import RecommendedJobs from "./RecommendedJobs";

import {
  TrendingUp,
  DollarSign,
  MapPin,
  Briefcase,
  ArrowUpRight,
  ArrowLeft,
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  Rocket,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// CENTRALIZED CAREER DATA
// ============================================================

import { getCareer } from "../data/careers";

// ============================================================
// API
// ============================================================

import { getProfileAnalytics } from "../services/api";

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({
  role,
  profileId,
  onBack,
  onSkillGap,
  onJobs,
}) {
  // ==========================================================
  // GET SELECTED CAREER
  // ==========================================================

  const selectedRole =
    role || "Data Scientist";

  const career = getCareer(selectedRole);

  // ==========================================================
  // ANALYTICS STATE
  // ==========================================================

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  // Application Tracker data is stored locally by CareerLens.
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    try {
      const savedApplications = localStorage.getItem(
        "careerLensApplications"
      );

      if (savedApplications) {
        const parsed = JSON.parse(savedApplications);
        setApplications(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Unable to load application tracker data:", error);
      setApplications([]);
    }
  }, []);

  // ==========================================================
  // FETCH BACKEND ANALYTICS
  // ==========================================================

  useEffect(() => {
    async function loadAnalytics() {
      // Profile.jsx stores the backend profile ID in localStorage.
      // Use it when App's profileId state has not updated yet.
      const savedProfileId =
        localStorage.getItem("careerLensProfileId") || "";

      const activeProfileId = profileId || savedProfileId;

      if (!activeProfileId) {
        setAnalytics(null);
        return;
      }

      try {
        setLoadingAnalytics(true);
        setAnalyticsError("");

        const response =
          await getProfileAnalytics(activeProfileId);

        if (response.success) {
          setAnalytics(response.analytics);
        } else {
          setAnalyticsError(
            response.message ||
              "Unable to load analytics"
          );
        }
      } catch (error) {
        console.error(
          "Dashboard analytics error:",
          error
        );

        setAnalyticsError(
          "Unable to connect to analytics service."
        );
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [profileId]);

  // ==========================================================
  // SALARY DATA
  // ==========================================================

  const salaryData = career.salaryTrend.map(
    (salary, index) => {
      const experienceLevels = [
        "0–2 yrs",
        "2–5 yrs",
        "5–8 yrs",
        "8+ yrs",
      ];

      return {
        experience: experienceLevels[index],
        salary,
      };
    }
  );

  // ==========================================================
  // LOCATION DATA
  // ==========================================================

  const locationData = career.locations.map(
    (location) => ({
      name: location.name,
      percentage: `${location.demand}%`,
    })
  );

  // ==========================================================
  // READINESS COLOR
  // ==========================================================

  function getReadinessStyle(score) {
    if (score >= 80) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    }

    if (score >= 65) {
      return {
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
    }

    if (score >= 50) {
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };
    }

    return {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    };
  }

  const readinessStyle =
    getReadinessStyle(
      analytics?.readinessScore || 0
    );

  // ==========================================================
  // PERSONALIZED DASHBOARD METRICS
  // ==========================================================

  const applicationStats = {
    total: applications.length,
    interviews: applications.filter(
      (item) => item.status === "Interview"
    ).length,
    selected: applications.filter(
      (item) => item.status === "Selected"
    ).length,
    rejected: applications.filter(
      (item) => item.status === "Rejected"
    ).length,
    active: applications.filter(
      (item) => item.status === "Applied"
    ).length,
  };

  const learningProgress =
    analytics?.totalRequiredSkills > 0
      ? Math.round(
          (analytics.totalMatchedSkills /
            analytics.totalRequiredSkills) *
            100
        )
      : 0;

  const nextSkill =
    analytics?.recommendedSkills?.[0] ||
    analytics?.missingSkills?.[0] ||
    "Build a portfolio project";

  const readinessScore = analytics?.readinessScore || 0;

  const nextAction =
    readinessScore < 50
      ? {
          title: "Strengthen your core skills",
          description:
            `Start with ${nextSkill} and build a practical project around it.`,
          button: "Analyze Skill Gap",
        }
      : readinessScore < 75
      ? {
          title: "Close your remaining skill gaps",
          description:
            `Prioritize ${nextSkill} to improve your readiness for ${selectedRole}.`,
          button: "Analyze Skill Gap",
        }
      : {
          title: "Start applying strategically",
          description:
            `Your profile is becoming job-ready. Explore ${selectedRole} opportunities and track your applications.`,
          button: "Explore Jobs",
        };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>

            <div>

              <h1 className="text-xl font-bold">
                CareerLens
              </h1>

              <p className="text-xs text-slate-400">
                Career Intelligence
              </p>

            </div>

          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

        </div>

      </nav>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
            Career Analytics
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <div>

              <h2 className="text-4xl font-bold mt-2">
                {selectedRole}
              </h2>

              <p className="text-slate-400 mt-2">
                Explore market demand, salary trends and required skills.
              </p>

            </div>

            <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              ● {career.demand} Demand
            </div>

          </div>

        </div>

        {/* ==================================================
            BACKEND READINESS ANALYTICS
        ================================================== */}

        {(profileId || localStorage.getItem("careerLensProfileId")) && (
          <div className="mb-8">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* READINESS SCORE */}

                <div className="flex items-center gap-5">

                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex items-center justify-center">

                    {loadingAnalytics ? (
                      <span className="text-sm text-slate-400">
                        ...
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-blue-400">
                        {analytics?.readinessScore ?? 0}%
                      </span>
                    )}

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <Sparkles
                        size={20}
                        className="text-blue-400"
                      />

                      <h3 className="text-xl font-semibold">
                        Career Readiness
                      </h3>

                    </div>

                    {loadingAnalytics ? (
                      <p className="text-slate-400 mt-1">
                        Calculating your readiness...
                      </p>
                    ) : analytics ? (
                      <p
                        className={`mt-1 font-medium ${readinessStyle.text}`}
                      >
                        {analytics.readinessLevel}
                      </p>
                    ) : (
                      <p className="text-slate-500 mt-1">
                        Analytics unavailable
                      </p>
                    )}

                  </div>

                </div>

                {/* ANALYTICS COUNTS */}

                {analytics && (
                  <div className="grid grid-cols-3 gap-4">

                    <MiniStat
                      value={
                        analytics.totalMatchedSkills
                      }
                      label="Matched"
                    />

                    <MiniStat
                      value={
                        analytics.totalMissingSkills
                      }
                      label="Missing"
                    />

                    <MiniStat
                      value={
                        analytics.totalRequiredSkills
                      }
                      label="Required"
                    />

                  </div>
                )}

              </div>

              {/* ERROR */}

              {analyticsError && (
                <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {analyticsError}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            PERSONALIZED OVERVIEW
        ================================================== */}

        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Readiness */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-blue-400" size={20} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                    Personalized Overview
                  </span>
                </div>

                <h3 className="mt-2 text-2xl font-bold">
                  Your Career Readiness
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  CareerLens combines your backend skill analysis, career
                  market data and application activity to show what you should
                  focus on next.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-blue-500/20">
                  {loadingAnalytics ? (
                    <span className="text-sm text-slate-500">...</span>
                  ) : (
                    <span className={`text-2xl font-bold ${readinessStyle.text}`}>
                      {readinessScore}%
                    </span>
                  )}
                </div>

                <div>
                  <p className={`font-semibold ${readinessStyle.text}`}>
                    {analytics?.readinessLevel || "Profile Analysis"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Backend skill assessment
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>Skill readiness</span>
                <span>{readinessScore}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Next action */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
            <div className="flex items-center gap-2 text-blue-100">
              <Rocket size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                AI Next Action
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold">
              {nextAction.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-blue-100">
              {nextAction.description}
            </p>

            <button
              type="button"
              onClick={
                readinessScore < 75
                  ? onSkillGap
                  : onJobs
              }
              className="mt-5 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              {nextAction.button}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* ==================================================
            ACTIVITY SNAPSHOT
        ================================================== */}

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Target size={21} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                SKILLS
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Skills matched
            </p>
            <p className="mt-1 text-2xl font-bold">
              {analytics?.totalMatchedSkills ?? 0}
              <span className="text-sm font-normal text-slate-500">
                {" "}/ {analytics?.totalRequiredSkills ?? 0}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <BookOpen size={21} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                LEARNING
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Career skill coverage
            </p>
            <p className="mt-1 text-2xl font-bold">
              {learningProgress}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ClipboardCheck size={21} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                APPLICATIONS
              </span>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Jobs being tracked
            </p>
            <p className="mt-1 text-2xl font-bold">
              {applicationStats.total}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {applicationStats.interviews} interviews ·{" "}
              {applicationStats.selected} selected
            </p>
          </div>
        </section>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="grid md:grid-cols-4 gap-5">

          <StatCard
            icon={<TrendingUp />}
            title="Market Demand"
            value={career.demand}
            subtitle={`+${career.growth}% this year`}
          />

          <StatCard
            icon={<DollarSign />}
            title="Average Salary"
            value={career.salary}
            subtitle="India"
          />

          <StatCard
            icon={<Briefcase />}
            title="Open Positions"
            value={career.jobs}
            subtitle="Current listings"
          />

          <StatCard
            icon={<MapPin />}
            title="Top Location"
            value={career.topLocation}
            subtitle="Highest hiring"
          />

        </div>

        {/* ==================================================
            MATCHED / MISSING SKILLS
        ================================================== */}

        {analytics && (
          <div className="grid lg:grid-cols-2 gap-6 mt-8">

            {/* MATCHED */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-emerald-400"
                />

                <div>

                  <h3 className="text-xl font-semibold">
                    Matched Skills
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Skills you already have
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                {analytics.matchedSkills.length > 0 ? (
                  analytics.matchedSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                      >
                        ✓ {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-slate-500 text-sm">
                    No matching skills yet.
                  </p>
                )}

              </div>

            </div>

            {/* MISSING */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <XCircle
                  className="text-red-400"
                />

                <div>

                  <h3 className="text-xl font-semibold">
                    Skills to Improve
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Skills required for your target role
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                {analytics.missingSkills.length > 0 ? (
                  analytics.missingSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        + {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-emerald-400 text-sm">
                    🎉 You have all required skills!
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            RECOMMENDED SKILLS
        ================================================== */}

        {analytics &&
          analytics.recommendedSkills?.length > 0 && (
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <Target className="text-blue-400" />

                <div>

                  <h3 className="text-xl font-semibold">
                    Recommended Skills to Learn
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Highest-priority skills based on market demand
                  </p>

                </div>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-6">

                {analytics.recommendedSkills.map(
                  (skill, index) => (
                    <div
                      key={skill}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800"
                    >

                      <span className="text-xs text-blue-400">
                        Priority #{index + 1}
                      </span>

                      <h4 className="font-semibold mt-2">
                        {skill}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Recommended for {selectedRole}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        {/* ==================================================
            APPLICATION + CAREER SNAPSHOT
        ================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Job Search Snapshot
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your current application pipeline
                </p>
              </div>
              <ClipboardCheck className="text-cyan-400" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <PipelineStat label="Applied" value={applicationStats.active} />
              <PipelineStat label="Interviews" value={applicationStats.interviews} />
              <PipelineStat label="Selected" value={applicationStats.selected} />
              <PipelineStat label="Rejected" value={applicationStats.rejected} />
            </div>

            {applications.length === 0 && (
              <p className="mt-5 rounded-xl bg-slate-950 p-4 text-sm text-slate-500">
                No applications are being tracked yet. Start adding jobs in
                Application Tracker to monitor your search progress here.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <Target className="text-blue-400" />
              <div>
                <h3 className="text-xl font-semibold">
                  Focus Area
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  The most useful next improvement
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Recommended
              </p>
              <h4 className="mt-2 text-lg font-bold">
                {nextSkill}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This is currently one of the most useful areas to focus on for
                your {selectedRole} career path.
              </p>

              <button
                type="button"
                onClick={onSkillGap}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                View skill analysis
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================
            CHARTS
        ================================================== */}

        <div className="grid lg:grid-cols-2 gap-6 mt-8">

          {/* SALARY CHART */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h3 className="text-xl font-semibold">
                  Salary by Experience
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Average annual salary in LPA
                </p>

              </div>

              <ArrowUpRight className="text-blue-500" />

            </div>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart data={salaryData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="experience"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `₹${value} LPA`,
                    "Salary",
                  ]}
                />

                <Bar
                  dataKey="salary"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* SKILL CHART */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h3 className="text-xl font-semibold">
                  Skill Demand
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Percentage of job postings requiring the skill
                </p>

              </div>

              <TrendingUp className="text-blue-500" />

            </div>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={career.skills}
                layout="vertical"
                margin={{ left: 20 }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#94a3b8"
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  stroke="#94a3b8"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `${value}%`,
                    "Demand",
                  ]}
                />

                <Bar
                  dataKey="demand"
                  fill="#8b5cf6"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ==================================================
            SKILLS + LOCATIONS
        ================================================== */}

        <div className="grid lg:grid-cols-3 gap-6 mt-8">

          {/* CORE SKILLS */}

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center gap-3">

              <Target className="text-blue-500" />

              <div>

                <h3 className="text-xl font-semibold">
                  Core Skills Required
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  Most important skills for {selectedRole}
                </p>

              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">

              {career.skills.map((item) => (

                <div
                  key={item.name}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800"
                >

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      {item.name}
                    </span>

                    <span className="text-blue-400">
                      {item.demand}%
                    </span>

                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.demand}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Priority: {item.priority}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* LOCATIONS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h3 className="text-xl font-semibold">
              Top Hiring Locations
            </h3>

            <p className="text-slate-400 text-sm mt-1 mb-6">
              Cities with highest demand
            </p>

            {locationData.map((location) => (

              <Location
                key={location.name}
                name={location.name}
                percentage={location.percentage}
              />

            ))}

          </div>

        </div>

        {/* ==================================================
            RECOMMENDED JOBS
        ================================================== */}

        <RecommendedJobs
          role={selectedRole}
          onViewAll={onJobs}
        />

        {/* ==================================================
            INSIGHT CARD
        ================================================== */}

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>

            <div>

              <h3 className="font-semibold text-lg">
                Career Market Insight
              </h3>

              <p className="text-slate-400 mt-2 leading-relaxed">

                {selectedRole} currently shows strong hiring demand.
                Focus on the highest-demand skills above to improve
                your chances of becoming job-ready.

              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="mt-8 p-8 rounded-2xl bg-blue-600">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

            <div>

              <h3 className="text-2xl font-bold">
                Take the next step in your career
              </h3>

              <p className="text-blue-100 mt-2">
                Analyze your skills or explore jobs matching your career.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={onSkillGap}
                className="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Analyze My Skills →
              </button>

              <button
                onClick={onJobs}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-lg font-semibold hover:bg-slate-900 transition border border-slate-800"
              >
                <Briefcase size={18} />
                View Recommended Jobs
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

// ============================================================
// MINI STAT
// ============================================================

function MiniStat({ value, label }) {
  return (
    <div className="text-center px-4">

      <p className="text-2xl font-bold text-white">
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {label}
      </p>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function PipelineStat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
        {icon}
      </div>

      <p className="text-sm text-slate-400 mt-5">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-1">
        {value}
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

// ============================================================
// LOCATION
// ============================================================

function Location({
  name,
  percentage,
}) {
  return (
    <div className="mb-5">

      <div className="flex justify-between text-sm mb-2">

        <span>
          {name}
        </span>

        <span className="text-slate-400">
          {percentage}
        </span>

      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{
            width: percentage,
          }}
        />

      </div>

    </div>
  );
}

export default Dashboard;