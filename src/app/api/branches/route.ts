import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser as getAuth, hasRole } from '@/lib/auth';

// Define the structure of a branch as returned by the API
interface ApiBranch {
    BranchID: number;
    BranchName: string;
    ParentBranchID: number | null;
    MemberCount: number;
    MaxCapacity: number;
    IsActiveForNewMembers: boolean;
    DepthLevel: number;
    CreationDate: string;
}

export async function GET(request: Request) {
    try {
        const user = await getAuth();

        if (!user || !hasRole(user, ["admin"])) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch all branches, ordered for easier hierarchy reconstruction on the client
        const branchesStmt = await (process.env as any).DB.prepare(
            "SELECT BranchID, BranchName, ParentBranchID, MemberCount, MaxCapacity, IsActiveForNewMembers, DepthLevel, CreationDate " +
            "FROM Branches ORDER BY DepthLevel ASC, ParentBranchID ASC, BranchID ASC"
        );
        const branchesResult = await branchesStmt.all();
        const branches = branchesResult.results as ApiBranch[];

        if (!branchesResult || !branchesResult.results) {
            console.error("Failed to fetch branches or no branches found.");
            return NextResponse.json({ branches: [] }); // Return empty array if none found
        }

        return NextResponse.json({ branches: branchesResult.results });

    } catch (error) {
        console.error("Error fetching branches:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: "Failed to fetch branches", details: errorMessage }, { status: 500 });
    }
}

