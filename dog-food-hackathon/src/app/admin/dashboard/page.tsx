"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import adminService from "../adminService";
import { toast } from "@/components/ui/toast";
import { ElevationRequestList } from "@/app/lib/types";
import { ElevationRequestStatus } from "@/app/generated/prisma/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

const DashboardPage = () => {
  const router = useRouter();
  const [records, setRecords] = useState<ElevationRequestList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const fetchElevationRequests = useCallback(async () => {
    try {
      const response = await adminService.getElevateUserList();
      if (response.success) {
        setRecords(response.data ?? []);
      } else {
        console.error("Error fetching elevation list:", response.error?.message);
        toast.add({
          title: "List fetch failed",
          description:
            response.error?.message ||
            "Something went wrong while fetching elevation list.",
        });
      }
    } catch (error) {
      console.error("Server-side error:", error);
      toast.add({
        title: "Internal Server Error",
        description: "Could not retrieve requests. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElevationRequests();
  }, [fetchElevationRequests]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await adminService.logoutUser();
      toast.add({
        title: "Logged out successfully",
        description: "Redirecting to login...",
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.add({
        title: "Logout Error",
        description: error?.message || "Failed to log out properly.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRequest = async (
    entryId: string,
    action: ElevationRequestStatus
  ) => {
    try {
      setProcessingId(entryId);
      const response = await adminService.executeElevation(entryId, action);

      if (response.success) {
        const isApproved = action === ElevationRequestStatus.APPROVED;
        toast.add({
          title: isApproved ? "User Approved" : "Request Blocked",
          description: isApproved
            ? "User has been granted organizer access."
            : "Elevation request has been blocked.",
        });

        await fetchElevationRequests();
      } else {
        toast.add({
          title: "Request Failed",
          description:
            response.error?.message ||
            "Could not process the elevation request.",
        });
      }
    } catch (error) {
      console.error("Elevation request error:", error);
      toast.add({
        title: "Internal Server Error",
        description: "Could not process the request.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section with Logout */}
        <div className="flex items-center justify-between border-b border-[#282828] pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-xs text-[#888888]">
              Manage organizer elevation requests
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="border-[#2A2A2A] bg-[#181818] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-lg border border-[#282828] bg-[#181818] shadow-xl">
          <Table>
            <TableHeader className="bg-[#202020]">
              <TableRow className="border-b border-[#282828] hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-[#A0A0A0]">Name</TableHead>
                <TableHead className="text-xs font-semibold text-[#A0A0A0]">Email</TableHead>
                <TableHead className="text-xs font-semibold text-[#A0A0A0]">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-[#A0A0A0]">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#A0A0A0]">Requested At</TableHead>
                <TableHead className="text-right text-xs font-semibold text-[#A0A0A0]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow className="border-b border-[#282828] hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-[#888888]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#888888]" />
                      <span>Loading elevation requests...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow className="border-b border-[#282828] hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-[#888888]">
                    No pending elevation requests.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow
                    key={record.id}
                    className="border-b border-[#282828] transition-colors hover:bg-[#202020]"
                  >
                    <TableCell className="text-sm font-medium text-[#EDEDED]">
                      {record.user.name}
                    </TableCell>
                    <TableCell className="text-xs text-[#B0B0B0]">{record.user.email}</TableCell>
                    <TableCell className="text-xs text-[#B0B0B0]">{record.user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          record.status === ElevationRequestStatus.APPROVED
                            ? "bg-[#1E3A2B] text-[#4ADE80]"
                            : record.status === ElevationRequestStatus.BLOCKED
                            ? "bg-[#3A1E1E] text-[#F87171]"
                            : "bg-[#3A301E] text-[#FBBF24]"
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#888888]">
                      {new Date(record.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={processingId === record.id}
                          onClick={() =>
                            handleRequest(
                              record.id,
                              ElevationRequestStatus.APPROVED
                            )
                          }
                          className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF] disabled:opacity-50"
                        >
                          {processingId === record.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingId === record.id}
                          onClick={() =>
                            handleRequest(
                              record.id,
                              ElevationRequestStatus.BLOCKED
                            )
                          }
                          className="bg-[#3A1E1E] text-xs font-semibold text-[#F87171] border border-[#522525] hover:bg-[#4E2424] hover:text-[#FF8888] disabled:opacity-50"
                        >
                          {processingId === record.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Block"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;