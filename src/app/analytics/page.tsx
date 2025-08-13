"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import api from "@/lib/app";
import { useEffect, useState } from "react";
import {
  LineChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B"];
const SECOND_COLORS = [
  "#6366F1",
  "#FBBF24",
  "#EF4444",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
];

interface ResumeRating {
  rating: number;
  pros: string[];
  improvements: string[];
}

interface PieChartEntry {
  count: number;
  status?: string;
  resumeName?: string;
}

const Analytics = () => {
  const [hasApplication, setHasApplication] = useState(false);
  const [pieChartDataApplications, setPieChartDataApplications] = useState<
    PieChartEntry[]
  >([]);
  const [pieChartDataOfferInterviewRate, setPieChartDataOfferInterviewRate] =
    useState<PieChartEntry[]>([]);
  const [chartData, setChartData] = useState([]);
  const [resumeRating, setResumeRating] = useState<ResumeRating>({
    rating: 0,
    pros: [],
    improvements: [],
  });

  const [isLoadingResumeRating, setIsLoadingResumeRating] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const hasApplicationsRes = await api.get("/analytics/has-applications");
        if (!hasApplicationsRes.data) {
          throw new Error("No applications found");
        }

        const [last7Days, resumeInterviewOffer, applicationByStatus] =
          await Promise.all([
            api.get("/analytics/last-7-days"),
            api.get("/analytics/resume-interview-offer"),
            api.get("/analytics/application-by-status"),
          ]);
        setChartData(last7Days.data);
        setPieChartDataApplications(applicationByStatus.data);
        setPieChartDataOfferInterviewRate(resumeInterviewOffer.data);
        setIsLoadingResumeRating(true);
        const resumeRatingData = await api.get("/analytics/resume-rating");
        setResumeRating(resumeRatingData.data);
        setHasApplication(true);
      } catch (error) {
        console.error("There was an error in fetching applications", error);
        setHasApplication(false);
      } finally {
        setIsLoadingResumeRating(false);
      }
    };
    getData();
  }, []);

  const isSecondPieEmpty =
    Array.isArray(pieChartDataOfferInterviewRate) &&
    pieChartDataOfferInterviewRate.every((entry) => entry.count === 0);

  const isFirstPieEmpty =
    Array.isArray(pieChartDataApplications) &&
    pieChartDataApplications.every((entry) => entry.count === 0);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/analytics" className="font-semibold">
              Analytics
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <h1 className="text-2xl font-bold">Analytics</h1>

      {hasApplication ? (
        <>
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
            {/* Applications for past 7 days */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Applications Submitted</CardTitle>
                <CardDescription>Over the Last 7 Days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-72" style={{ height: 288 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" padding={{ left: 20, right: 20 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Resume Rating */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>AI Resume Rating</CardTitle>
                <CardDescription>
                  From the resume used in the most recent application
                </CardDescription>
              </CardHeader>
              {isLoadingResumeRating ? (
                <div className="flex justify-center items-center flex-col gap-0 h-full">
                  <LoadingSpinner />
                  <p>Loading content...</p>
                </div>
              ) : (
                <CardContent>
                  <div className="max-h-72 overflow-y-auto pr-2 pb-3">
                    <h2 className="text-lg font-semibold mb-2">
                      Overall Score: {resumeRating.rating}/100
                    </h2>
                    <div className="mb-4">
                      <h3 className="text-md font-semibold mb-1">Pros:</h3>
                      {resumeRating.pros.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {resumeRating.pros.map((pro, index) => (
                            <li key={index}>{pro}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No pros available.</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-md font-semibold mb-1">
                        Improvements:
                      </h3>
                      {resumeRating.improvements.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {resumeRating.improvements.map(
                            (improvement, index) => (
                              <li key={index}>{improvement}</li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-gray-500">
                          No improvements available.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Side-by-side Pie Charts */}
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
            {/* Application Status Pie Chart */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Application Status Breakdown</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="h-72 flex items-center justify-center"
                  style={{ height: 288 }}
                >
                  {isFirstPieEmpty ? (
                    <p className="text-center text-gray-500">
                      No data available for Application Status Breakdown.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartDataApplications}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          fill="#8884d8"
                          label
                        >
                          {pieChartDataApplications.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume interview rate */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Offer & Interview Rate</CardTitle>
                <CardDescription>Compare your resumes</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="h-72 flex items-center justify-center"
                  style={{ height: 288 }}
                >
                  {isSecondPieEmpty ? (
                    <p className="text-center text-gray-500">
                      No data available for Offer & Interview Rate.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartDataOfferInterviewRate}
                          dataKey="count"
                          nameKey="resumeName"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          fill="#8884d8"
                          label
                        >
                          {pieChartDataOfferInterviewRate.map(
                            (entry, index) => (
                              <Cell
                                key={`cell2-${index}`}
                                fill={
                                  SECOND_COLORS[index % SECOND_COLORS.length]
                                }
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex text-4xl justify-center items-center h-max">
          <h1>NO APPLICATIONS FOUND. CREATE YOUR FIRST APPLICATION.</h1>
        </div>
      )}
    </div>
  );
};

export default Analytics;
