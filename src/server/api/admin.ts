import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SCHEMES } from "@/data/schemes";
import { createSuccessResponse, createErrorResponse } from "@/server/middleware";
import { requireAdmin } from "@/server/auth";
import { MOCK_VERIFICATION_QUEUE } from "@/data/admin";

export const AdminStatsRequestSchema = z.object({
  timeframe: z.enum(["7d", "30d", "all"]).optional().default("30d"),
});

export const VerificationActionSchema = z.object({
  documentId: z.string().min(1),
  citizenId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "REQUEST_REUPLOAD"]),
  officerRemarks: z.string().optional(),
});

/**
 * API: Admin Analytics & Platform Overview
 * Accessible only by administrators and welfare nodal officers.
 */
export const getAdminAnalytics = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const parsed = AdminStatsRequestSchema.safeParse(input ?? {});
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    }
    return parsed.data;
  })
  .handler(async () => {
    try {
      const admin = requireAdmin();

      const totalSchemes = SCHEMES.length;
      const centralSchemes = SCHEMES.filter((s) => s.governmentLevel === "Central").length;
      const stateSchemes = SCHEMES.filter((s) => s.governmentLevel === "State").length;
      const totalCategories = new Set(SCHEMES.map((s) => s.category)).size;

      const categoryDistribution = Object.entries(
        SCHEMES.reduce<Record<string, number>>((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {})
      ).map(([category, count]) => ({ category, count }));

      const stateDistribution = Object.entries(
        SCHEMES.reduce<Record<string, number>>((acc, s) => {
          acc[s.state] = (acc[s.state] || 0) + 1;
          return acc;
        }, {})
      ).map(([state, count]) => ({ state, count }));

      return createSuccessResponse({
        officer: {
          id: admin.userId,
          name: admin.name,
          role: admin.role,
          department: admin.department,
        },
        metrics: {
          totalSchemes,
          centralSchemes,
          stateSchemes,
          totalCategories,
          pendingVerifications: MOCK_VERIFICATION_QUEUE.filter((q) => q.status === "PENDING_REVIEW").length,
          flaggedVerifications: MOCK_VERIFICATION_QUEUE.filter((q) => q.status === "FLAGGED_MISMATCH").length,
          simulatedMatchesServed: 14280,
          averageReadinessScore: 78.4,
        },
        categoryDistribution,
        stateDistribution,
        recentVerifications: MOCK_VERIFICATION_QUEUE,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("Administrator")) {
        return createErrorResponse("FORBIDDEN", "Administrator privileges required");
      }
      return createErrorResponse("INTERNAL_ERROR", message);
    }
  });

/**
 * API: Process Officer Document Verification Action
 */
export const processVerificationAction = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = VerificationActionSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid request: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    try {
      const admin = requireAdmin();
      const { documentId, citizenId, action, officerRemarks } = data;

      return createSuccessResponse({
        documentId,
        citizenId,
        action,
        officer: admin.name,
        processedAt: new Date().toISOString(),
        status: action === "APPROVE" ? "VERIFIED" : action === "REJECT" ? "REJECTED" : "REUPLOAD_REQUESTED",
        remarks: officerRemarks || "Processed by administrative portal.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return createErrorResponse("INTERNAL_ERROR", message);
    }
  });
