"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ParticipantHackathonHistoryItem } from "@/app/lib/types";
import { useRouter } from "next/navigation";

type HackathonAction = {
  label: string;
  onClick: (participation: ParticipantHackathonHistoryItem) => void;
};

type HackathonTableProps = {
  hackathons: ParticipantHackathonHistoryItem[];
  actions: HackathonAction[];
};

const HackathonTable = ({ hackathons, actions }: HackathonTableProps) => {
  if (hackathons.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No hackathons found.
      </div>
    );
  }
  const router = useRouter();

  return (
    <div className="rounded-md border border-gray-700 bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="text-white">Hackathon</TableHead>

            <TableHead className="text-white">Description</TableHead>

            <TableHead className="text-white">Tracks</TableHead>

            <TableHead className="text-white">Registration Ends</TableHead>

            <TableHead className="text-white">Submission Deadline</TableHead>

            <TableHead className="text-white">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {hackathons.map((participation) => (
            <TableRow
              key={participation.id}
              className="border-gray-700 hover:bg-gray-800"
            >
              <TableCell className="font-medium text-white">
                {participation.hackathon.title}
              </TableCell>

              <TableCell className="text-gray-300">
                {participation.hackathon.description ?? "—"}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {participation.hackathon.tracks.map((track) => (
                    <span
                      key={track.id}
                      className="rounded-md bg-gray-700 px-2 py-1 text-xs text-white"
                    >
                      {track.name}
                    </span>
                  ))}
                </div>
              </TableCell>

              <TableCell className="text-gray-300">
                {new Date(
                  participation.hackathon.registration_end,
                ).toLocaleString()}
              </TableCell>

              <TableCell className="text-gray-300">
                {new Date(
                  participation.hackathon.submission_deadline,
                ).toLocaleString()}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.label}
                      onClick={() => action.onClick(participation)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HackathonTable;
