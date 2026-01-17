"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// SwaggerUI is not SSR compatible
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-10">
        <h1 className="mb-6 px-4 text-3xl font-black">API Documentation</h1>
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <SwaggerUI url="/api/swagger" />
        </div>
      </div>
    </div>
  );
}
