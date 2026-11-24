import { useEffect, useState } from "react";

import {
  Search,
  TrendingUp,
  Target,
  Briefcase,
  BarChart3,
  Map,
  ArrowRight,
  Sparkles,
  GitCompareArrows,
  ClipboardCheck,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import CareerRecommendation from "./pages/CareerRecommendation";
import CareerComparison from "./pages/CareerComparison";
import ApplicationTracker from "./pages/ApplicationTracker";
import CareerInsights from "./pages/CareerInsights";

function App() {
  // Add a persistent Home shortcut to every inner page.
  function withHomeNavigation(content) {
    return (
      <>
        <div className="fixed top-4 left-4 z-[100]">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="cl-home-shortcut inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go to home page"
          >
            <span aria-hidden="true">⌂</span>
            Home
          </button>
        </div>
        {content}
      </>
    );
  }

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [page, setPage] = useState("home");

  // ============================================================
  // PROFILE DATA
  // ============================================================

  const defaultProfileData = {
    name: "",
    education: "B.Tech Computer Science",
    college: "",
    targetCareer: "Data Scientist",
    experience: "Fresher",
    skills: ["Python", "SQL", "Java", "HTML", "CSS"],
  };

  const [profileData, setProfileData] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("careerLensProfileData");

      if (savedProfile) {
        return {
          ...defaultProfileData,
          ...JSON.parse(savedProfile),
        };
      }
    } catch (error) {
      console.error("Unable to load saved CareerLens profile:", error);
    }

    return defaultProfileData;
  });

  // ============================================================
  // CAREER ROLE
  // ============================================================

  const [role, setRole] = useState("Data Scientist");

  // ============================================================
  // SELECTED JOB
  // ============================================================

  const [selectedJob, setSelectedJob] = useState(null);
  const [profileId, setProfileId] = useState(
  localStorage.getItem("careerLensProfileId")
);

  // Save the user's profile locally so it remains available
  // when CareerLens is opened again later.
  useEffect(() => {
    try {
      localStorage.setItem(
        "careerLensProfileData",
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.error("Unable to save CareerLens profile:", error);
    }
  }, [profileData]);


  // ============================================================
  // ANALYZE ROLE FROM HOME SEARCH
  // ============================================================

  function analyzeRole() {
    const selectedRole = role.trim();

    if (!selectedRole) {
      alert("Please enter a career role.");
      return;
    }

    // Keep profile career synchronized with searched career
    setProfileData((previous) => ({
      ...previous,
      targetCareer: selectedRole,
    }));

    setRole(selectedRole);
    setPage("dashboard");
  }

  // ============================================================
  // OPEN PROFILE
  // ============================================================

  function openProfile() {
    setPage("profile");
  }

  // ============================================================
  // OPEN SKILL GAP
  // ============================================================

  function openSkillGap() {
    setPage("skillgap");
  }

  // ============================================================
  // OPEN DASHBOARD
  // ============================================================

  function openDashboard() {
    const selectedRole =
      profileData.targetCareer || "Data Scientist";

    setRole(selectedRole);
    setPage("dashboard");
  }

  // ============================================================
  // OPEN ROADMAP
  // ============================================================

  function openRoadmap() {
    setPage("roadmap");
  }
  
  function openApplicationTracker() {
  setPage("applicationTracker");
}
function openCareerInsights() {
  setPage("careerInsights");
}

function openSkillGap() {
  setPage("skillgap");
}

function openRoadmap() {
  setPage("roadmap");
}
  // ============================================================
  // OPEN JOBS
  // ============================================================

  function openJobs() {
    const selectedRole =
      profileData.targetCareer ||
      role ||
      "Data Scientist";

    setRole(selectedRole);
    setPage("jobs");
  }
  // ============================================================
// OPEN CAREER RECOMMENDATION
// ============================================================

function openCareerRecommendation() {
  setPage("careerRecommendation");
}

function exploreRecommendedCareer(careerName) {
  setProfileData((previous) => ({
    ...previous,
    targetCareer: careerName,
  }));

  setRole(careerName);
  setPage("dashboard");
}

// ============================================================
// OPEN CAREER COMPARISON
// ============================================================

function openCareerComparison() {
  setPage("careerComparison");
}

// ============================================================
// EXPLORE COMPARED CAREER
// ============================================================

function exploreComparedCareer(careerName) {
  setProfileData((previous) => ({
    ...previous,
    targetCareer: careerName,
  }));

  setRole(careerName);
  setPage("dashboard");
}
  // ============================================================
  // OPEN JOB DETAILS
  // ============================================================

  function openJobDetails(job) {
    setSelectedJob(job);
    setPage("jobDetails");
  }

  // ============================================================
  // DASHBOARD PAGE
  // ============================================================

  if (page === "dashboard") {
    return withHomeNavigation(
      <Dashboard
  role={
    profileData.targetCareer ||
    role ||
    "Data Scientist"
  }
  profileId={profileId}
  onBack={() => setPage("home")}
  onSkillGap={openSkillGap}
  onJobs={openJobs}
/>
    );
  }

  // ============================================================
  // PROFILE PAGE
  // ============================================================

  if (page === "profile") {
    return withHomeNavigation(
      <Profile
        profileData={profileData}
        setProfileData={setProfileData}
        onBack={() => setPage("home")}
        onAnalyze={() => {
          setRole(
            profileData.targetCareer ||
            "Data Scientist"
          );

          setPage("skillgap");
        }}
      />
    );
  }

  // ============================================================
  // SKILL GAP PAGE
  // ============================================================

  if (page === "skillgap") {
    return withHomeNavigation(
      <SkillGap
  profileData={profileData}
  profileId={profileId}
  onBack={() => setPage("profile")}
  onRoadmap={openRoadmap}
/>
    );
  }

  // ============================================================
  // ROADMAP PAGE
  // ============================================================

  if (page === "roadmap") {
    return withHomeNavigation(
     <Roadmap
  profileData={profileData}
  profileId={profileId}
  onBack={() => setPage("skillgap")}
  onJobs={openJobs}
/>
    );
  }
  

  // ============================================================
  // CAREER RECOMMENDATION PAGE
  // ============================================================

  if (page === "careerRecommendation") {
    return withHomeNavigation(
      <CareerRecommendation
        profileData={profileData}
        onBack={() => setPage("home")}
        onExploreCareer={exploreRecommendedCareer}
      />
    );
  }
  
  if (page === "careerComparison") {
  return withHomeNavigation(
    <CareerComparison
      profileData={profileData}
      onBack={() => setPage("home")}
      onExploreCareer={exploreComparedCareer}
    />
  );
}
if (page === "applicationTracker") {
  return withHomeNavigation(
    <ApplicationTracker
      profileData={profileData}
      onBack={() => setPage("home")}
    />
  );
}

if (page === "careerInsights") {
  return withHomeNavigation(
    <CareerInsights
      profileData={profileData}
      onBack={() => setPage("home")}
      onSkillGap={openSkillGap}
      onRoadmap={openRoadmap}
      onJobs={openJobs}
    />
  );
}
  // ============================================================
  // JOBS PAGE
  // ============================================================

  if (page === "jobs") {
    return withHomeNavigation(
      <Jobs
  role={profileData.targetCareer}
  profileData={profileData}
  profileId={profileId}
  onBack={() => setPage("dashboard")}
  onJobDetails={openJobDetails}
/>
    );
  }

  // ============================================================
  // JOB DETAILS PAGE
  // ============================================================

  if (page === "jobDetails") {
    const userSkills = profileData?.skills || [];

    const skillAliases = {
      javascript: ["javascript", "js"],
      js: ["javascript", "js"],

      react: ["react", "reactjs"],
      reactjs: ["react", "reactjs"],

      sql: ["sql", "mysql", "postgresql"],
      mysql: ["sql", "mysql"],
      postgresql: ["sql", "postgresql"],

      python: ["python"],

      ml: ["ml", "machine learning"],
      "machine learning": ["ml", "machine learning"],

      dl: ["dl", "deep learning"],
      "deep learning": ["dl", "deep learning"],

      tensorflow: ["tensorflow"],

      aws: ["aws"],
      linux: ["linux"],
      docker: ["docker"],
      kubernetes: ["kubernetes"],
      terraform: ["terraform"],

      cybersecurity: [
        "cybersecurity",
        "cyber security",
      ],

      "cyber security": [
        "cybersecurity",
        "cyber security",
      ],

      networking: ["networking"],
      siem: ["siem"],
      statistics: ["statistics"],
      excel: ["excel"],
      "power bi": ["power bi"],
      tableau: ["tableau"],

      git: ["git", "github"],
      github: ["git", "github"],

      html: ["html"],
      css: ["css"],
      pandas: ["pandas"],
    };

    function hasMatchingSkill(
      userSkill,
      requiredSkill
    ) {
      const user = userSkill
        .toLowerCase()
        .trim();

      const required = requiredSkill
        .toLowerCase()
        .trim();

      if (user === required) {
        return true;
      }

      const aliases =
        skillAliases[required] || [required];

      return aliases.some(
        (alias) =>
          user === alias ||
          user.includes(alias) ||
          alias.includes(user)
      );
    }

    const requiredSkills =
      selectedJob?.skills || [];

    const matchedSkills =
      requiredSkills.filter((requiredSkill) =>
        userSkills.some((userSkill) =>
          hasMatchingSkill(
            userSkill,
            requiredSkill
          )
        )
      );

    const missingSkills =
      requiredSkills.filter(
        (requiredSkill) =>
          !matchedSkills.includes(requiredSkill)
      );

    const matchPercentage =
      requiredSkills.length === 0
        ? 0
        : Math.round(
            (matchedSkills.length /
              requiredSkills.length) *
              100
          );

    return withHomeNavigation(
      <JobDetails
        job={selectedJob}
        matchPercentage={matchPercentage}
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
        onBack={() => setPage("jobs")}
      />
    );
  }

  // ============================================================
  // HOME PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-slate-800 bg-slate-950/90">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => setPage("home")}
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>

            <div className="text-left">

              <h1 className="text-xl font-bold">
                CareerLens
              </h1>

              <p className="text-xs text-slate-400">
                Career Intelligence
              </p>

            </div>

          </button>

          {/* NAVIGATION */}

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">

            <button
              type="button"
              onClick={() => setPage("home")}
              className="hover:text-white transition"
            >
              Home
            </button>

            <button
              type="button"
              onClick={openProfile}
              className="hover:text-white transition"
            >
              My Profile
            </button>

            <button
              type="button"
              onClick={() => setPage("careerComparison")}
              className="text-left w-full"
              >
              Analytics
            </button>

            <button
              type="button"
              onClick={openSkillGap}
              className="hover:text-white transition"
            >
              Skill Gap
            </button>

            <button
  type="button"
  onClick={openApplicationTracker}
  className="text-left w-full"
>
              Application Tracker
            </button>

          </div>

          {/* GET STARTED */}

          <div className="flex items-center gap-3">
            {profileData?.name && (
              <button
                type="button"
                onClick={openProfile}
                className="hidden lg:flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300"
                title="Your profile is saved on this device"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Profile Saved
              </button>
            )}

            <button
              type="button"
              onClick={openProfile}
              className="px-5 py-2.5 rounded-lg bg-white text-slate-950 font-semibold hover:bg-slate-200 transition"
            >
              {profileData?.name ? "My Profile" : "Get Started"}
            </button>
          </div>

        </div>

      </nav>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* BACKGROUND GLOW */}

        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-3xl rounded-full" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">

          {/* BADGE */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">

            <TrendingUp size={16} />

            Data-driven career intelligence

          </div>

          {/* HEADING */}

          <h2 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight">

            Build the career

            <br />

            <span className="text-blue-500">
              you are ready for.
            </span>

          </h2>

          {/* DESCRIPTION */}

          <p className="mt-7 max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">

            Explore job demand, salary trends, required skills,
            skill gaps and personalized career roadmaps — all in one platform.

          </p>

          {/* SEARCH */}

          <div className="mt-10 max-w-2xl mx-auto">

            <div className="flex items-center bg-white rounded-xl p-2 shadow-2xl">

              <Search
                size={22}
                className="ml-3 text-slate-400"
              />

              <input
                type="text"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    analyzeRole();
                  }
                }}
                placeholder="Search a career role..."
                className="flex-1 px-4 py-3 text-slate-900 outline-none"
              />

              <button
                type="button"
                onClick={analyzeRole}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                Analyze
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

          {/* POPULAR ROLES */}

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">

            <span className="text-slate-500">
              Popular:
            </span>

            {[
              "Data Scientist",
              "Software Developer",
              "Data Analyst",
              "Cloud Engineer",
            ].map((item) => (

              <button
                key={item}
                type="button"
                onClick={() => {
                  setRole(item);

                  setProfileData((previous) => ({
                    ...previous,
                    targetCareer: item,
                  }));
                }}
                className="text-slate-300 hover:text-blue-400 transition"
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </section>

      {profileData?.name && (
        <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 px-5 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                ✓
              </div>
              <div>
                <p className="font-semibold text-white">
                  Welcome back, {profileData.name}!
                </p>
                <p className="text-sm text-slate-400">
                  Your profile is saved on this device.
                  {profileData.targetCareer && (
                    <>
                      {" "}Target career:{" "}
                      <span className="font-semibold text-slate-200">
                        {profileData.targetCareer}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          FEATURE CARDS
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <button type="button" onClick={openDashboard} className="text-left w-full">
            <FeatureCard
              icon={<BarChart3 size={25} />}
              title="Job Market Analytics"
              description="Understand job demand, salary trends, locations and emerging opportunities."
              theme="blue"
              label="MARKET INSIGHTS"
            />
          </button>

          <button type="button" onClick={openSkillGap} className="text-left w-full">
            <FeatureCard
              icon={<Target size={25} />}
              title="Skill Gap Analysis"
              description="Compare your current skills with the skills employers require."
              theme="purple"
              label="AI ANALYSIS"
            />
          </button>

          <button type="button" onClick={openProfile} className="text-left w-full">
            <FeatureCard
              icon={<Map size={25} />}
              title="Personalized Roadmap"
              description="Get a step-by-step learning roadmap based on your career goal."
              theme="green"
              label="PERSONALIZED"
            />
          </button>

          <button type="button" onClick={openCareerRecommendation} className="text-left w-full">
            <FeatureCard
              icon={<Sparkles size={25} />}
              title="Career Recommendation"
              description="Discover career paths that align with your skills, interests and current profile."
              theme="pink"
              label="AI RECOMMENDATION"
            />
          </button>

          <button type="button" onClick={openCareerComparison} className="text-left w-full">
            <FeatureCard
              icon={<GitCompareArrows size={25} />}
              title="Career Comparison"
              description="Compare careers using salary, demand, growth, skills and market opportunities."
              theme="orange"
              label="COMPARE ROLES"
            />
          </button>

          <button type="button" onClick={openApplicationTracker} className="text-left w-full">
            <FeatureCard
              icon={<ClipboardCheck size={25} />}
              title="Application Tracker"
              description="Keep your job search organized and stay on top of the opportunities you explore."
              theme="cyan"
              label="JOB MANAGEMENT"
            />
          </button>

        </div>

      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="border-t border-slate-800 bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="text-center">

            <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
              How it works
            </p>

            <h3 className="mt-3 text-3xl md:text-4xl font-bold">
              From career goal to job-ready
            </h3>

            <p className="mt-4 text-slate-400">
              Make better career decisions using job-market insights.
            </p>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-14">

            <Step
              number="01"
              title="Choose a Career"
              description="Select the role you want to pursue."
            />

            <Step
              number="02"
              title="Analyze the Market"
              description="Explore salary, demand and required skills."
            />

            <Step
              number="03"
              title="Find Your Gap"
              description="Compare your skills with industry requirements."
            />

            <Step
              number="04"
              title="Follow Your Roadmap"
              description="Build the skills needed to become job-ready."
            />

          </div>

        </div>

      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="border-t border-slate-800">

        <div className="max-w-5xl mx-auto px-6 py-20 text-center">

          <Briefcase
            className="mx-auto text-blue-500"
            size={38}
          />

          <h3 className="mt-6 text-3xl md:text-4xl font-bold">
            Your career. Backed by data.
          </h3>

          <p className="mt-4 text-slate-400">
            Stop guessing what to learn. Start understanding what the market needs.
          </p>

          <button
            type="button"
            onClick={openProfile}
            className="mt-8 px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            {profileData?.name
              ? "Open My Profile →"
              : "Start Career Analysis →"}
          </button>

        </div>

      </section>

    </div>
  );
}

// ============================================================
// FEATURE CARD
// ============================================================

function FeatureCard({
  icon,
  title,
  description,
  theme = "blue",
  label = "CAREER INSIGHTS",
}) {
  const themes = {
    blue: { accent: "bg-blue-600", iconBg: "bg-blue-50", iconColor: "text-blue-600", badge: "bg-blue-50 text-blue-600", glow: "bg-blue-200" },
    purple: { accent: "bg-purple-600", iconBg: "bg-purple-50", iconColor: "text-purple-600", badge: "bg-purple-50 text-purple-600", glow: "bg-purple-200" },
    green: { accent: "bg-emerald-600", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600", glow: "bg-emerald-200" },
    pink: { accent: "bg-pink-600", iconBg: "bg-pink-50", iconColor: "text-pink-600", badge: "bg-pink-50 text-pink-600", glow: "bg-pink-200" },
    orange: { accent: "bg-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600", badge: "bg-orange-50 text-orange-600", glow: "bg-orange-200" },
    cyan: { accent: "bg-cyan-600", iconBg: "bg-cyan-50", iconColor: "text-cyan-600", badge: "bg-cyan-50 text-cyan-600", glow: "bg-cyan-200" },
  };

  const colors = themes[theme] || themes.blue;

  return (
    <div className="group relative overflow-hidden min-h-[270px] p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />

      <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${colors.glow}`} />

      <div className={`relative w-14 h-14 rounded-2xl ${colors.iconBg} ${colors.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      <span className={`inline-block mt-5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${colors.badge}`}>
        {label}
      </span>

      <h3 className="mt-4 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-slate-600 leading-relaxed">
        {description}
      </p>

      <div className={`mt-5 flex items-center gap-2 text-sm font-semibold ${colors.iconColor} group-hover:gap-3 transition-all`}>
        Explore feature
        <ArrowRight size={16} />
      </div>
    </div>
  );
}

// ============================================================
// STEP
// ============================================================

function Step({
  number,
  title,
  description,
}) {

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">

      <span className="text-blue-500 font-bold">
        {number}
      </span>

      <h4 className="mt-4 text-lg font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>

    </div>
  );
}

export default App;