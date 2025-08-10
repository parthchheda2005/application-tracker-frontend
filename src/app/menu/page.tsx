"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const Menu = () => {
  const router = useRouter();

  const navigationOptions = [
    {
      title: "Applications",
      desc: "View, edit and add your job applications",
      color: "from-pink-500 to-orange-500",
      page: "/applications",
    },
    {
      title: "Resumes",
      desc: "View, edit and add resumes",
      color: "from-green-500 to-teal-500",
      page: "/resumes",
    },
    {
      title: "Analytics",
      desc: "View statistics on your applications and resumes",
      color: "from-indigo-500 to-purple-500",
      page: "/analytics",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center gap-6 min-h-screen lg:flex-row px-4">
      {navigationOptions.map((item, idx) => (
        <Card
          key={idx}
          className={clsx(
            "relative shadow-2xl w-full max-w-sm h-44 p-6 flex flex-col justify-center items-center text-center rounded-2xl bg-white cursor-pointer group transition-all duration-300 ease-out",
            "hover:-translate-y-1 hover:scale-105"
          )}
          style={{
            boxShadow: `0 4px 20px rgba(0,0,0,0.05)`,
          }}
          onClick={() => router.push(item.page)}
        >
          <div
            className={clsx(
              "absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r",
              item.color,
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}
          >
            <div className="h-full w-full bg-white rounded-2xl" />
          </div>

          <CardTitle className="text-2xl font-bold relative z-10">
            {item.title}
          </CardTitle>
          <CardDescription className="mt-2 text-gray-500 relative z-10 text-base">
            {item.desc}
          </CardDescription>
        </Card>
      ))}
    </div>
  );
};

export default Menu;
