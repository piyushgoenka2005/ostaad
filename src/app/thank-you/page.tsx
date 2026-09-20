import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function ThankYouPage() {
  return (
    <div className="pt-32 pb-20 px-4 md:px-[4.5%] max-w-[700px] mx-auto min-h-screen text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-[#7C8764]/20 text-[#7C8764] flex items-center justify-center mb-6">
        <CheckCircle2 size={36} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#23384F] tracking-tight">
        Thank You for Reaching the Ostaad Desk
      </h1>
      <p className="text-sm sm:text-base text-[#54524D] mt-4 leading-relaxed font-sans max-w-lg">
        Your engineering request has been logged. Our materials specialist is reviewing your submission and will contact you promptly.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href="/products">
          <Button size="md" variant="primary" hasArrow>
            <span>Explore Material Catalog</span>
          </Button>
        </Link>
        <Link href="/">
          <Button size="md" variant="outline">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
