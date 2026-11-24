import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Trash2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Building2,
  Target,
  TrendingUp,
} from "lucide-react";

// ============================================================
// APPLICATION TRACKER — JOB SEARCH INTELLIGENCE
// ============================================================

const STORAGE_KEY = "careerLensApplications";

const STATUS_OPTIONS = [
  "Applied",
  "Interview",
  "Selected",
  "Rejected",
];

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function loadApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to load applications:", error);
    return [];
  }
}

export default function ApplicationTracker({ profileData, onBack }) {
  const [applications, setApplications] = useState(loadApplications);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");

  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    location: "",
    applicationDate: getTodayString(),
    status: "Applied",
    link: "",
    interviewDate: "",
    notes: "",
  });

  function saveApplications(updatedApplications) {
    setApplications(updatedApplications);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedApplications)
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function addApplication(event) {
    event.preventDefault();

    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      alert("Please enter company name and job title.");
      return;
    }

    const newApplication = {
      id: Date.now(),
      company: formData.company.trim(),
      jobTitle: formData.jobTitle.trim(),
      location: formData.location.trim(),
      applicationDate: formData.applicationDate,
      status: formData.status,
      link: formData.link.trim(),
      interviewDate: formData.interviewDate,
      notes: formData.notes.trim(),
    };

    saveApplications([newApplication, ...applications]);

    setFormData({
      company: "",
      jobTitle: "",
      location: "",
      applicationDate: getTodayString(),
      status: "Applied",
      link: "",
      interviewDate: "",
      notes: "",
    });

    setShowForm(false);
  }

  function deleteApplication(id) {
    const updatedApplications = applications.filter(
      (application) => application.id !== id
    );

    saveApplications(updatedApplications);
  }

  function updateApplication(id, changes) {
    const updatedApplications = applications.map((application) =>
      application.id === id
        ? { ...application, ...changes }
        : application
    );

    saveApplications(updatedApplications);
  }

  const companies = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          applications
            .map((application) => application.company)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [applications]);

  const enrichedApplications = useMemo(() => {
    return applications.map((application) => ({
      ...application,
      daysSinceApplication: getDaysSince(application.applicationDate),
      needsFollowUp: shouldFollowUp(application),
      interviewUpcoming: isUpcomingInterview(application.interviewDate),
    }));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enrichedApplications
      .filter((application) => {
        const matchesSearch =
          !query ||
          application.company.toLowerCase().includes(query) ||
          application.jobTitle.toLowerCase().includes(query) ||
          (application.location || "").toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          application.status === statusFilter;

        const matchesCompany =
          companyFilter === "All" ||
          application.company === companyFilter;

        return matchesSearch && matchesStatus && matchesCompany;
      })
      .sort(
        (a, b) =>
          new Date(b.applicationDate || 0) -
          new Date(a.applicationDate || 0)
      );
  }, [
    enrichedApplications,
    searchTerm,
    statusFilter,
    companyFilter,
  ]);

  const statistics = useMemo(() => {
    const total = applications.length;

    const applied = applications.filter(
      (application) => application.status === "Applied"
    ).length;

    const interviews = applications.filter(
      (application) => application.status === "Interview"
    ).length;

    const selected = applications.filter(
      (application) => application.status === "Selected"
    ).length;

    const rejected = applications.filter(
      (application) => application.status === "Rejected"
    ).length;

    const decided = selected + rejected;

    const successRate =
      decided === 0 ? 0 : Math.round((selected / decided) * 100);

    const interviewRate =
      total === 0 ? 0 : Math.round((interviews / total) * 100);

    const followUps = enrichedApplications.filter(
      (application) => application.needsFollowUp
    ).length;

    const upcomingInterviews = enrichedApplications
      .filter((application) => application.interviewUpcoming)
      .sort(
        (a, b) =>
          new Date(a.interviewDate) -
          new Date(b.interviewDate)
      );

    const companyCounts = applications.reduce(
      (accumulator, application) => {
        accumulator[application.company] =
          (accumulator[application.company] || 0) + 1;
        return accumulator;
      },
      {}
    );

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      applied,
      interviews,
      selected,
      rejected,
      successRate,
      interviewRate,
      followUps,
      upcomingInterviews,
      topCompanies,
    };
  }, [applications, enrichedApplications]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
              <Briefcase size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold">CareerLens</h1>
              <p className="text-xs text-slate-500">
                Application Tracker
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Application
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* HERO */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-7 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/90">
                <Briefcase size={17} />
                Job Search Intelligence
              </div>

              <h2 className="text-3xl font-bold md:text-4xl">
                Turn applications into a strategy
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                Track every opportunity, identify follow-ups, monitor
                interviews and understand your job-search progress.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-6 py-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                Total Applications
              </p>

              <p className="mt-1 text-4xl font-bold">
                {statistics.total}
              </p>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total"
            value={statistics.total}
            icon={<Briefcase size={20} />}
            theme="blue"
          />

          <StatCard
            label="Applied"
            value={statistics.applied}
            icon={<Clock3 size={20} />}
            theme="purple"
          />

          <StatCard
            label="Interviews"
            value={statistics.interviews}
            icon={<CalendarDays size={20} />}
            theme="orange"
          />

          <StatCard
            label="Selected"
            value={statistics.selected}
            icon={<CheckCircle2 size={20} />}
            theme="green"
          />

          <StatCard
            label="Rejected"
            value={statistics.rejected}
            icon={<XCircle size={20} />}
            theme="red"
          />
        </section>

        {/* INTELLIGENCE CARDS */}
        <section className="mb-8 grid gap-5 lg:grid-cols-3">
          <InsightCard
            icon={<TrendingUp size={21} />}
            title="Success Rate"
            value={`${statistics.successRate}%`}
            description={
              statistics.selected + statistics.rejected === 0
                ? "Add a selected or rejected application to calculate."
                : "Selected applications among completed outcomes."
            }
            theme="green"
          />

          <InsightCard
            icon={<Target size={21} />}
            title="Interview Rate"
            value={`${statistics.interviewRate}%`}
            description="Applications that have reached interview stage."
            theme="purple"
          />

          <InsightCard
            icon={<AlertTriangle size={21} />}
            title="Follow-Ups Needed"
            value={statistics.followUps}
            description="Applied roles older than 7 days without an interview or final outcome."
            theme="orange"
          />
        </section>

        {/* PROFILE INFO */}
        {profileData?.targetCareer && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
            <Target size={19} className="text-blue-600" />

            <p className="text-sm text-blue-800">
              Tracking applications for your target career:
              <span className="ml-1 font-bold">
                {profileData.targetCareer}
              </span>
            </p>
          </div>
        )}

        {/* UPCOMING INTERVIEWS */}
        {statistics.upcomingInterviews.length > 0 && (
          <section className="mb-8 rounded-3xl border border-orange-200 bg-orange-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <CalendarDays size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Upcoming Interviews
                </h3>
                <p className="text-sm text-slate-600">
                  Your next scheduled interview dates.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {statistics.upcomingInterviews
                .slice(0, 4)
                .map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-orange-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">
                          {application.jobTitle}
                        </p>
                        <p className="text-sm text-slate-600">
                          {application.company}
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        {formatDate(application.interviewDate)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* FOLLOW-UP ALERTS */}
        {statistics.followUps > 0 && (
          <section className="mb-8 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Follow-up recommended
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {statistics.followUps} application
                    {statistics.followUps !== 1 ? "s" : ""} has
                    been in the Applied stage for more than 7 days.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatusFilter("Applied")}
                className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
              >
                Show Applied
              </button>
            </div>
          </section>
        )}

        {/* ANALYTICS */}
        {applications.length > 0 && (
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <AnalyticsPanel
              title="Application Pipeline"
              icon={<BarChart3 size={20} />}
            >
              <PipelineBar
                label="Applied"
                value={statistics.applied}
                total={statistics.total}
                theme="blue"
              />
              <PipelineBar
                label="Interview"
                value={statistics.interviews}
                total={statistics.total}
                theme="orange"
              />
              <PipelineBar
                label="Selected"
                value={statistics.selected}
                total={statistics.total}
                theme="green"
              />
              <PipelineBar
                label="Rejected"
                value={statistics.rejected}
                total={statistics.total}
                theme="red"
              />
            </AnalyticsPanel>

            <AnalyticsPanel
              title="Top Companies"
              icon={<Building2 size={20} />}
            >
              {statistics.topCompanies.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Company data will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {statistics.topCompanies.map(
                    ([company, count], index) => (
                      <div
                        key={company}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-slate-800">
                              {company}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              {count}
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${
                                  (count /
                                    statistics.topCompanies[0][1]) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </AnalyticsPanel>
          </section>
        )}

        {/* SEARCH + FILTERS */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">
              Search & Filter Applications
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search company, role or location..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={companyFilter}
              onChange={(event) =>
                setCompanyFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company === "All"
                    ? "All Companies"
                    : company}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm ||
            statusFilter !== "All" ||
            companyFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setCompanyFilter("All");
              }}
              className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </section>

        {/* APPLICATION LIST */}
        {applications.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start tracking your job search by adding the
              applications you have submitted.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Your First Application
            </button>
          </section>
        ) : filteredApplications.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <Search
              size={34}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-bold">
              No matching applications
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Showing {filteredApplications.length} of{" "}
                {applications.length} applications
              </p>
            </div>

            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onDelete={deleteApplication}
                onUpdate={updateApplication}
              />
            ))}
          </section>
        )}
      </main>

      {/* ADD APPLICATION MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Job Application
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add details so CareerLens can help you track
                  your job search.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={addApplication} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Company Name *"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Example: Deloitte"
                />

                <FormField
                  label="Job Title *"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Example: Data Analyst"
                />

                <FormField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Hyderabad"
                />

                <DateField
                  label="Application Date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <DateField
                  label="Interview Date"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleChange}
                />

                <FormField
                  label="Application Link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://..."
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Example: Recruiter contacted me / aptitude round completed..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APPLICATION CARD
// ============================================================

function ApplicationCard({
  application,
  onDelete,
  onUpdate,
}) {
  const statusStyle = getStatusStyle(application.status);
  const days = application.daysSinceApplication;

  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        application.needsFollowUp
          ? "border-amber-200"
          : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Briefcase size={22} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {application.jobTitle}
              </h3>

              {application.needsFollowUp && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                  <AlertTriangle size={12} />
                  Follow Up
                </span>
              )}

              {application.interviewUpcoming && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-800">
                  <CalendarDays size={12} />
                  Interview Soon
                </span>
              )}
            </div>

            <p className="mt-1 font-medium text-slate-600">
              {application.company}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              {application.location && (
                <span>📍 {application.location}</span>
              )}

              {application.applicationDate && (
                <span>
                  📅 Applied{" "}
                  {formatDate(application.applicationDate)}
                </span>
              )}

              <span>
                ⏱️{" "}
                {days === 0
                  ? "Applied today"
                  : `${days} day${days === 1 ? "" : "s"} ago`}
              </span>
            </div>

            {application.interviewDate && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
                <CalendarDays size={14} />
                Interview: {formatDate(application.interviewDate)}
              </div>
            )}

            {application.notes && (
              <p className="mt-3 max-w-3xl rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                {application.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <select
            value={application.status}
            onChange={(event) =>
              onUpdate(application.id, {
                status: event.target.value,
              })
            }
            className={`rounded-full border px-4 py-2 text-xs font-bold outline-none ${statusStyle}`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {application.status === "Interview" &&
            !application.interviewDate && (
              <button
                type="button"
                onClick={() => {
                  const date = window.prompt(
                    "Enter interview date (YYYY-MM-DD):"
                  );

                  if (date) {
                    onUpdate(application.id, {
                      interviewDate: date,
                    });
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                <CalendarDays size={15} />
                Add Interview
              </button>
            )}

          {application.link && (
            <a
              href={application.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ExternalLink size={15} />
              Open
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${application.jobTitle} at ${application.company}?`
                )
              ) {
                onDelete(application.id);
              }
            }}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete application"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, icon, theme }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${themes[theme]}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// INSIGHT CARD
// ============================================================

function InsightCard({
  icon,
  title,
  value,
  description,
  theme,
}) {
  const themes = {
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-600",
    },
    purple: {
      icon: "bg-purple-50 text-purple-600",
      value: "text-purple-600",
    },
    orange: {
      icon: "bg-orange-50 text-orange-600",
      value: "text-orange-600",
    },
  };

  const colors = themes[theme] || themes.green;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}
        >
          {icon}
        </div>

        <span className={`text-3xl font-bold ${colors.value}`}>
          {value}
        </span>
      </div>

      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// ANALYTICS PANEL
// ============================================================

function AnalyticsPanel({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      {children}
    </div>
  );
}

// ============================================================
// PIPELINE BAR
// ============================================================

function PipelineBar({ label, value, total, theme }) {
  const themes = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
    red: "bg-red-500",
  };

  const percentage =
    total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          {label}
        </span>

        <span className="font-bold text-slate-900">
          {value}{" "}
          <span className="font-medium text-slate-400">
            ({percentage}%)
          </span>
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${themes[theme]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// ============================================================
// DATE FIELD
// ============================================================

function DateField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysSince(dateString) {
  if (!dateString) return 0;

  const applicationDate = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(applicationDate.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference =
    today.getTime() - applicationDate.getTime();

  return Math.max(0, Math.floor(difference / 86400000));
}

function shouldFollowUp(application) {
  if (application.status !== "Applied") return false;

  return getDaysSince(application.applicationDate) >= 7;
}

function isUpcomingInterview(dateString) {
  if (!dateString) return false;

  const interviewDate = new Date(
    `${dateString}T23:59:59`
  );

  if (Number.isNaN(interviewDate.getTime())) return false;

  const now = new Date();
  const sevenDaysFromNow = new Date(
    now.getTime() + 7 * 86400000
  );

  return interviewDate >= now && interviewDate <= sevenDaysFromNow;
}

function getStatusStyle(status) {
  switch (status) {
    case "Interview":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Selected":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}
