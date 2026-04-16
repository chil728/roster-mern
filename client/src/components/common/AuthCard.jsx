import React from "react";
import Card from "./Card";
import PageContainer from "./PageContainer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthCard({ title, children, footer }) {
  const navigate = useNavigate();
  return (
    <PageContainer className="flex items-center justify-center p-4">
      <div
        className="mb-3 w-full flex gap-2 items-center cursor-pointer text-slate-600 dark:text-gray-400 hover:underline transition-all duration-200 dark:hover:text-gray-300"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={24} className="text-slate-600 dark:text-gray-400" />
        <span className="text-xl">Home</span>
      </div>
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-black dark:text-white">
          {title}
        </h1>
        {children}
        {footer}
      </Card>
    </PageContainer>
  );
}
