import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  CheckCircle2,
  DollarSign,
  GitCompareArrows,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { getCareer } from "../data/careers";
import { hasMatchingSkill } from "../data/skills";

// ============================================================
// CAREER COMPARISON
// ============================================================

const CAREER_NAMES = [
  "Data Scientist",
  "Data Analyst",
  "Software Developer",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
];

function normalizeCareer(rawCareer, careerName) {
  const career = rawCareer || {};

  const rawSkills = career.skills || [];

  const skills = rawSkills.map((skill) => {
    if (typeof skill === "string") {
      return {
        name: skill,
        demand: 0,
      };
    }

    return {
      name: skill.name || skill.skill || "",
      demand: Number(skill.demand) || 0,
    };
  }).filter((skill) => skill.name);

  return {
    careerName,
    demand:
      career.demand ||
      career.demandLevel ||
      "Not available",

    growth:
      career.growth ||
      career.demandGrowth ||
      career.growthRate ||
      "Not available",

    salary:
      career.salary ||
      career.averageSalary ||
      "Not available",

    jobs:
      career.jobs ||
      career.positions ||
      career.availableJobs ||
      0,

    topLocation:
      career.topLocation ||
      career.location ||
      "Multiple locations",

    skills,
  };
}

function CareerComparison({
  profileData,
  onBack,
  onExploreCareer,
}) {
  const [selectedCareers, setSelectedCareers] = useState([
    "Data Analyst",
    "Data Scientist",
  ]);

  // Profile skills are stored as an array of strings.
  // Normalize defensively so comparison works with an empty or incomplete profile.
  const userSkills = Array.isArray(profileData?.skills)
    ? profileData.skills.filter((skill) => typeof skill === "string" && skill.trim())
    : [];

  const isSkillMatched = (requiredSkill) =>
    userSkills.some((userSkill) =>
      hasMatchingSkill(userSkill, requiredSkill)
    );

  // ------------------------------------------------------------
  // TOGGLE CAREER
  // ------------------------------------------------------------

  function toggleCareer(careerName) {
    setSelectedCareers((previous) => {
      if (previous.includes(careerName)) {
        return previous.filter((item) => item !== careerName);
      }

      if (previous.length >= 3) {
        return previous;
      }

      return [...previous, careerName];
    });
  }

  // ------------------------------------------------------------
  // BUILD COMPARISON DATA
  // ------------------------------------------------------------

  const comparisonData = useMemo(() => {
    return selectedCareers.map((careerName) => {
      let rawCareer = {};

      try {
        rawCareer = getCareer(careerName) || {};
      } catch (error) {
        console.error(`Unable to load ${careerName}:`, error);
      }

      const career = normalizeCareer(rawCareer, careerName);

      const matchedSkills = career.skills.filter((skill) =>
        isSkillMatched(skill.name)
      );

      const skillMatch =
        career.skills.length === 0
          ? 0
          : Math.round(
              (matchedSkills.length / career.skills.length) * 100
            );

      return {
        ...career,
        matchedSkills,
        skillMatch,
      };
    });
  }, [selectedCareers, userSkills]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-md">
              <GitCompareArrows size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                CareerLens
              </h1>
              <p className="text-xs text-slate-500">
                Career Comparison
              </p>
            </div>
          </div>

          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-7 text-white shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/90">
                <Sparkles size={17} />
                CareerLens Intelligence
              </div>

              <h2 className="text-3xl font-bold md:text-4xl">
                Compare your career options
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                Compare salary, job demand, growth, locations, required
                skills and your personal skill match across career paths.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-6 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                Careers selected
              </p>
              <p className="mt-1 text-3xl font-bold">
                {selectedCareers.length}/3
              </p>
            </div>

          </div>
        </section>

        {/* ====================================================
            SELECT CAREERS
        ==================================================== */}

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              Select careers to compare
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose up to three career paths.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {CAREER_NAMES.map((careerName) => {
              const selected = selectedCareers.includes(careerName);

              return (
                <button
                  key={careerName}
                  type="button"
                  onClick={() => toggleCareer(careerName)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-orange-400 bg-orange-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="font-semibold text-slate-900">
                        {careerName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Click to {selected ? "remove" : "add"}
                      </p>
                    </div>

                    {selected ? (
                      <CheckCircle2
                        size={22}
                        className="shrink-0 text-orange-500"
                      />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
                    )}

                  </div>
                </button>
              );
            })}

          </div>

          {selectedCareers.length >= 3 && (
            <p className="mt-4 text-xs font-medium text-orange-600">
              Maximum of 3 careers can be compared at once.
            </p>
          )}

        </section>

        {/* ====================================================
            COMPARISON
        ==================================================== */}

        {comparisonData.length >= 2 ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Side-by-side comparison
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Green skill badges indicate skills already present in your
                profile.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div
                className="grid min-w-[850px]"
                style={{
                  gridTemplateColumns:
                    `210px repeat(${comparisonData.length}, minmax(270px, 1fr))`,
                }}
              >

                {/* Career header */}

                <div className="border-b border-r border-slate-200 bg-slate-50 p-5 font-semibold text-slate-600">
                  Career
                </div>

                {comparisonData.map((career) => (
                  <div
                    key={career.careerName}
                    className="border-b border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h4 className="font-bold text-slate-900">
                          {career.careerName}
                        </h4>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={13} />
                          {career.topLocation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCareer(career.careerName)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Remove career"
                      >
                        <X size={17} />
                      </button>

                    </div>
                  </div>
                ))}

                {/* Skill match */}

                <ComparisonLabel
                  icon={<Target size={18} />}
                  label="Your Skill Match"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>

                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-slate-900">
                        {career.skillMatch}%
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        Profile Match
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${career.skillMatch}%` }}
                      />
                    </div>

                  </ComparisonCell>
                ))}

                {/* Demand */}

                <ComparisonLabel
                  icon={<Users size={18} />}
                  label="Job Demand"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>
                    <Metric
                      icon={<BarChart3 size={18} />}
                      value={career.demand}
                    />
                  </ComparisonCell>
                ))}

                {/* Growth */}

                <ComparisonLabel
                  icon={<TrendingUp size={18} />}
                  label="Growth"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>
                    <Metric
                      icon={<TrendingUp size={18} />}
                      value={career.growth}
                    />
                  </ComparisonCell>
                ))}

                {/* Salary */}

                <ComparisonLabel
                  icon={<DollarSign size={18} />}
                  label="Average Salary"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>
                    <Metric
                      icon={<DollarSign size={18} />}
                      value={career.salary}
                    />
                  </ComparisonCell>
                ))}

                {/* Jobs */}

                <ComparisonLabel
                  icon={<Briefcase size={18} />}
                  label="Available Jobs"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>
                    <Metric
                      icon={<Briefcase size={18} />}
                      value={
                        career.jobs === null ||
                        career.jobs === undefined ||
                        career.jobs === ""
                          ? "Not available"
                          : typeof career.jobs === "number"
                            ? career.jobs.toLocaleString()
                            : String(career.jobs)
                      }
                    />
                  </ComparisonCell>
                ))}

                {/* Location */}

                <ComparisonLabel
                  icon={<MapPin size={18} />}
                  label="Top Location"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>
                    <p className="font-semibold text-slate-900">
                      {career.topLocation}
                    </p>
                  </ComparisonCell>
                ))}

                {/* Skills */}

                <ComparisonLabel
                  icon={<CheckCircle2 size={18} />}
                  label="Required Skills"
                />

                {comparisonData.map((career) => (
                  <ComparisonCell key={career.careerName}>

                    <div className="flex flex-wrap gap-2">
                      {career.skills.map((skill) => {
                        const matched = isSkillMatched(skill.name);

                        return (
                          <span
                            key={skill.name}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              matched
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {skill.name}
                            {matched ? " ✓" : ""}
                          </span>
                        );
                      })}
                    </div>

                  </ComparisonCell>
                ))}

                {/* Action */}

                <div className="border-r border-slate-200 bg-slate-50 p-5" />

                {comparisonData.map((career) => (
                  <div
                    key={career.careerName}
                    className="p-5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onExploreCareer?.(career.careerName)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
                    >
                      Explore {career.careerName}
                      <TrendingUp size={17} />
                    </button>
                  </div>
                ))}

              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <GitCompareArrows
              size={42}
              className="mx-auto text-orange-500"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Select at least two careers
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Choose two or three career paths above to compare them.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// ============================================================
// REUSABLE UI
// ============================================================

function ComparisonLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 border-b border-r border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
      <span className="text-orange-500">{icon}</span>
      {label}
    </div>
  );
}

function ComparisonCell({ children }) {
  return (
    <div className="border-b border-slate-200 p-5">
      {children}
    </div>
  );
}

function Metric({ icon, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
        {icon}
      </div>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

export default CareerComparison;
