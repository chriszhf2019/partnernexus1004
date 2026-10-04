import React from "react";
import { motion } from "motion/react";
import { ZenSkeleton, SkeletonCard } from "./ZenSkeleton";

interface LoadingSkeletonProps {
  tab: "core" | "web" | "ripple";
}

export function LoadingSkeleton({ tab }: LoadingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Intro summary */}
      <SkeletonCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <ZenSkeleton variant="text" width="200px" className="mb-2" />
            <ZenSkeleton variant="text" lines={2} />
          </div>
          <div className="flex items-center gap-3">
            <ZenSkeleton variant="rect" width={100} height={28} className="rounded-xl" />
            <ZenSkeleton variant="rect" width={110} height={28} className="rounded-xl" />
          </div>
        </div>
      </SkeletonCard>

      {tab === "core" && <CoreTabSkeleton />}
      {tab === "web" && <GalaxyTabSkeleton />}
      {tab === "ripple" && <RippleTabSkeleton />}
    </motion.div>
  );
}

function CoreTabSkeleton() {
  return (
    <>
      {/* Seed grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} className="!p-4">
            <div className="flex items-start gap-3 mb-3">
              <ZenSkeleton variant="circle" width={40} height={40} />
              <div className="flex-1">
                <ZenSkeleton variant="text" width="70%" className="mb-1.5" />
                <ZenSkeleton variant="text" width="40%" />
              </div>
            </div>
            <ZenSkeleton variant="text" width="30%" />
          </SkeletonCard>
        ))}
      </div>

      {/* Coach section */}
      <SkeletonCard>
        <div className="flex items-center gap-2 mb-4">
          <ZenSkeleton variant="circle" width={20} height={20} />
          <ZenSkeleton variant="text" width="120px" />
        </div>
        <ZenSkeleton variant="text" lines={4} />
      </SkeletonCard>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <ZenSkeleton variant="circle" width={18} height={18} />
            <ZenSkeleton variant="text" width="100px" />
          </div>
          <ZenSkeleton variant="rect" width="100%" height={180} className="rounded-xl" />
        </SkeletonCard>

        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <ZenSkeleton variant="circle" width={18} height={18} />
            <ZenSkeleton variant="text" width="100px" />
          </div>
          <ZenSkeleton variant="rect" width="100%" height={180} className="rounded-xl" />
        </SkeletonCard>
      </div>
    </>
  );
}

function GalaxyTabSkeleton() {
  return (
    <>
      {/* Galaxy visualizer */}
      <SkeletonCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ZenSkeleton variant="circle" width={20} height={20} />
            <ZenSkeleton variant="text" width="140px" />
          </div>
          <ZenSkeleton variant="rect" width={80} height={28} className="rounded-lg" />
        </div>
        <ZenSkeleton variant="rect" width="100%" height={400} className="rounded-2xl" />
      </SkeletonCard>
    </>
  );
}

function RippleTabSkeleton() {
  return (
    <>
      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} className="!p-4">
            <div className="flex items-start gap-3 mb-2">
              <ZenSkeleton variant="circle" width={36} height={36} />
              <div className="flex-1">
                <ZenSkeleton variant="text" width="60%" className="mb-1.5" />
                <ZenSkeleton variant="text" width="35%" />
              </div>
            </div>
            <ZenSkeleton variant="text" lines={2} />
          </SkeletonCard>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <ZenSkeleton variant="circle" width={18} height={18} />
            <ZenSkeleton variant="text" width="100px" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <ZenSkeleton variant="circle" width={28} height={28} />
                <div className="flex-1">
                  <ZenSkeleton variant="text" width="50%" className="mb-1" />
                  <ZenSkeleton variant="text" width="70%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <ZenSkeleton variant="circle" width={18} height={18} />
            <ZenSkeleton variant="text" width="100px" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <ZenSkeleton variant="circle" width={28} height={28} />
                <div className="flex-1">
                  <ZenSkeleton variant="text" width="60%" className="mb-1" />
                  <ZenSkeleton variant="text" width="80%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </>
  );
}
