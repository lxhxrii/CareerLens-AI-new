import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { careers } from "../data/careers";
import { hasMatchingSkill } from "../data/skills";

function CareerRecommendation({
  profileData,
  onBack,
  onExploreCareer,
}) {
  const userSkills = profileData?.skills || [];

  /*
   * Calculate compatibility for every career.
   *
   * Match is based on how many of the career's required
   * skills are already present in the user's profile.
   */
  const recommendations = Object.entries(careers)
    .map(([careerName, career]) => {
      const requiredSkills = career.skills || [];

      const matchedSkills = requiredSkills.filter((requiredSkill) =>
        userSkills.some((userSkill) =>
          hasMatchingSkill(userSkill, requiredSkill.name)
        )
      );

      const skillMatch =
        requiredSkills.length > 0
          ? Math.round(
              (matchedSkills.length / requiredSkills.length) * 100
            )
          : 0;

      /*
       * Small market-demand contribution.
       * Skill match remains the main factor.
       */
      const demandAverage =
        requiredSkills.length > 0
          ? Math.round(
              requiredSkills.reduce(
                (total, skill) => total + skill.demand,
                0
              ) / requiredSkills.length
            )
          : 0;

      const compatibility = Math.min(
        100,
        Math.round(skillMatch * 0.75 + demandAverage * 0.25)
      );

      const missingSkills = requiredSkills.filter(
        (requiredSkill) =>
          !matchedSkills.includes(requiredSkill)
      );

      return {
        careerName,
        career,
        matchedSkills,
        missingSkills,
        skillMatch,
        demandAverage,
        compatibility,
      };
    })
    .sort((a, b) => b.compatibility - a.compatibility);

  const topCareer = recommendations[0];

  function getCompatibilityColor(score) {
    if (score >= 80) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        bar: "bg-emerald-500",
      };
    }

    if (score >= 60) {
      return {
        text: "text-blue-600",
        bg: "bg-blue-50",
        bar: "bg-blue-500",
      };
    }

    if (score >= 40) {
      return {
        text: "text-orange-600",
        bg: "bg-orange-50",
        bar: "bg-orange-500",
      };
    }

    return {
      text: "text-slate-600",
      bg: "bg-slate-100",
      bar: "bg-slate-400",
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                CareerLens
              </h1>

              <p className="text-xs text-slate-500">
                Career Recommendation
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-8 md:p-12 shadow-xl">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />

          <div className="relative">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm">
              <Sparkles size={15} />
              AI-powered career matching
            </div>

            <h2 className="mt-6 text-3xl md:text-5xl font-bold">
              Find careers that fit
              <br />
              <span className="text-blue-100">
                your current skills.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-blue-100 leading-relaxed">
              CareerLens compares your current skills with the
              skills required across available career paths and
              calculates a compatibility score.
            </p>

          </div>

        </section>

        {/* =====================================================
            PROFILE SUMMARY
        ===================================================== */}

        <section className="mt-8 grid md:grid-cols-3 gap-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase size={21} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Current Target
            </p>

            <h3 className="mt-1 text-lg font-bold">
              {profileData?.targetCareer || "Not selected"}
            </h3>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={21} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Your Skills
            </p>

            <h3 className="mt-1 text-lg font-bold">
              {userSkills.length} skills
            </h3>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={21} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Top Recommendation
            </p>

            <h3 className="mt-1 text-lg font-bold">
              {topCareer?.careerName || "Analyzing..."}
            </h3>

          </div>

        </section>

        {/* =====================================================
            YOUR SKILLS
        ===================================================== */}

        <section className="mt-10 bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-bold">
                Your Current Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                These skills are used to calculate your career compatibility.
              </p>
            </div>

          </div>

          <div className="mt-5 flex flex-wrap gap-2">

            {userSkills.length > 0 ? (
              userSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium"
                >
                  <CheckCircle2 size={15} />
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-500">
                No skills added to your profile yet.
              </p>
            )}

          </div>

        </section>

        {/* =====================================================
            RECOMMENDATIONS
        ===================================================== */}

        <section className="mt-10">

          <div className="flex items-end justify-between mb-6">

            <div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                Career Intelligence
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Career Compatibility
              </h2>

              <p className="mt-2 text-slate-500">
                Careers are ordered by compatibility with your current profile.
              </p>
            </div>

          </div>

          <div className="space-y-5">

            {recommendations.map((item, index) => {
              const colors = getCompatibilityColor(
                item.compatibility
              );

              return (
                <article
                  key={item.careerName}
                  className="
                    group
                    bg-white
                    border
                    border-slate-200
                    rounded-3xl
                    p-6
                    md:p-7
                    shadow-sm
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                    {/* RANK */}

                    <div className="flex items-center gap-4 min-w-[260px]">

                      <div
                        className={`
                          w-12
                          h-12
                          rounded-2xl
                          ${colors.bg}
                          ${colors.text}
                          flex
                          items-center
                          justify-center
                          font-bold
                        `}
                      >
                        #{index + 1}
                      </div>

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {item.careerName}
                        </h3>

                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={14} />
                          {item.career.topLocation}
                        </div>

                      </div>

                    </div>

                    {/* SCORE */}

                    <div className="flex-1">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-sm font-medium text-slate-600">
                          Compatibility
                        </span>

                        <span
                          className={`font-bold ${colors.text}`}
                        >
                          {item.compatibility}%
                        </span>

                      </div>

                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                          style={{
                            width: `${item.compatibility}%`,
                          }}
                        />

                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                        <span>
                          Skill match:{" "}
                          <strong className="text-slate-700">
                            {item.skillMatch}%
                          </strong>
                        </span>

                        <span>
                          Market demand:{" "}
                          <strong className="text-slate-700">
                            {item.demandAverage}%
                          </strong>
                        </span>

                        <span>
                          Salary:{" "}
                          <strong className="text-slate-700">
                            {item.career.salary}
                          </strong>
                        </span>

                      </div>

                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      onClick={() =>
                        onExploreCareer?.(item.careerName)
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-5
                        py-3
                        rounded-xl
                        bg-slate-900
                        text-white
                        font-semibold
                        hover:bg-blue-600
                        transition
                        whitespace-nowrap
                      "
                    >
                      Explore
                      <ArrowRight size={17} />
                    </button>

                  </div>

                  {/* SKILL DETAILS */}

                  <div className="mt-6 pt-5 border-t border-slate-100 grid md:grid-cols-2 gap-5">

                    <div>

                      <p className="text-sm font-semibold text-emerald-600">
                        Skills you already have
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {item.matchedSkills.length > 0 ? (
                          item.matchedSkills.map((skill) => (
                            <span
                              key={skill.name}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"
                            >
                              ✓ {skill.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">
                            No direct matches yet
                          </span>
                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-orange-600">
                        Skills to develop
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {item.missingSkills.length > 0 ? (
                          item.missingSkills.map((skill) => (
                            <span
                              key={skill.name}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium"
                            >
                              + {skill.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-emerald-600 font-medium">
                            ✓ Your profile covers the listed skills
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}

        <section className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-blue-100 p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm text-blue-600 flex items-center justify-center">
            <Sparkles size={25} />
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Your recommendation is a starting point.
          </h2>

          <p className="mt-2 max-w-2xl mx-auto text-slate-600">
            Build the missing skills through your personalized
            roadmap and then explore jobs matched to your profile.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              px-6
              py-3
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              text-white
              font-semibold
              shadow-lg
              hover:shadow-xl
              hover:-translate-y-0.5
              transition
            "
          >
            Continue Career Journey
            <ArrowRight size={18} />
          </button>

        </section>

      </main>
    </div>
  );
}

export default CareerRecommendation;