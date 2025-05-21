import { D1Database } from "@cloudflare/workers-types";
// import { drizzle } from "drizzle-orm/d1";
// Assuming schema is defined in a way that can be imported, or we define partials here
// For now, let's assume direct queries or a simplified ORM interaction

// Define interfaces for our data structures
interface Branch {
    BranchID: number;
    BranchName: string;
    ParentBranchID: number | null;
    MemberCount: number;
    MaxCapacity: number;
    IsActiveForNewMembers: boolean;
    DepthLevel: number;
    CreationDate: string;
}

// Constants
const MAX_CAPACITY_PER_BRANCH = 100; // Maximum members per branch
const MAX_DEPTH_LEVEL = 5; // Maximum depth of branch hierarchy

// Get or create the root branch
export async function getRootBranch(db: D1Database): Promise<Branch> {
    // Check if root branch exists
    const rootBranchName = "Root";
    let stmt; // Объявляем переменную stmt в начале функции
    
    try {
        stmt = db.prepare('SELECT * FROM branches WHERE name = ?').bind(rootBranchName);
        let result = await stmt.first<Branch>();

        if (result) {
            return result;
        }

        // Create root branch if it doesn't exist
        const creationDate = new Date().toISOString();
        stmt = db.prepare(
            "INSERT INTO Branches (BranchName, ParentBranchID, MemberCount, MaxCapacity, IsActiveForNewMembers, DepthLevel, CreationDate) " +
            "VALUES (?, NULL, 0, ?, TRUE, 0, ?) RETURNING *"
        ).bind(rootBranchName, MAX_CAPACITY_PER_BRANCH, creationDate);
        
        result = await stmt.first<Branch>();
        return result as Branch;
    } catch (error) {
        console.error("Error getting/creating root branch:", error);
        throw error;
    }
}

// Get all branches
export async function getAllBranches(db: D1Database): Promise<Branch[]> {
    try {
        const { results } = await db.prepare("SELECT * FROM Branches ORDER BY DepthLevel, BranchName").all<Branch>();
        return results || [];
    } catch (error) {
        console.error("Error getting all branches:", error);
        throw error;
    }
}

// Get branch by ID
export async function getBranchById(db: D1Database, branchId: number): Promise<Branch | null> {
    try {
        const result = await db.prepare("SELECT * FROM Branches WHERE BranchID = ?").bind(branchId).first<Branch>();
        return result || null;
    } catch (error) {
        console.error(`Error getting branch ${branchId}:`, error);
        throw error;
    }
}

// Create a new branch
export async function createBranch(
    db: D1Database,
    parentBranchId: number,
    branchName: string,
    maxCapacity: number = MAX_CAPACITY_PER_BRANCH
): Promise<Branch | null> {
    try {
        // Get parent branch to determine depth level
        const parentBranch = await getBranchById(db, parentBranchId);
        if (!parentBranch) {
            throw new Error(`Parent branch ${parentBranchId} not found`);
        }

        // Check if parent branch is active for new members
        if (!parentBranch.IsActiveForNewMembers) {
            throw new Error(`Parent branch ${parentBranchId} is not active for new members`);
        }

        // Check depth level
        const newDepthLevel = parentBranch.DepthLevel + 1;
        if (newDepthLevel > MAX_DEPTH_LEVEL) {
            throw new Error(`Maximum branch depth level (${MAX_DEPTH_LEVEL}) exceeded`);
        }

        // Create new branch
        const creationDate = new Date().toISOString();
        const stmt = db.prepare(
            "INSERT INTO Branches (BranchName, ParentBranchID, MemberCount, MaxCapacity, IsActiveForNewMembers, DepthLevel, CreationDate) " +
            "VALUES (?, ?, 0, ?, TRUE, ?, ?) RETURNING *"
        ).bind(branchName, parentBranchId, maxCapacity, newDepthLevel, creationDate);
        
        const result = await stmt.first<Branch>();
        return result;
    } catch (error) {
        console.error("Error creating branch:", error);
        throw error;
    }
}

// Update branch status
export async function updateBranchStatus(
    db: D1Database,
    branchId: number,
    isActiveForNewMembers: boolean
): Promise<boolean> {
    try {
        const result = await db.prepare(
            "UPDATE Branches SET IsActiveForNewMembers = ? WHERE BranchID = ?"
        ).bind(isActiveForNewMembers, branchId).run();
        
        return result.success;
    } catch (error) {
        console.error(`Error updating branch ${branchId} status:`, error);
        throw error;
    }
}

// Increment member count for a branch
export async function incrementBranchMemberCount(db: D1Database, branchId: number): Promise<boolean> {
    try {
        // Get current branch
        const branch = await getBranchById(db, branchId);
        if (!branch) {
            throw new Error(`Branch ${branchId} not found`);
        }

        // Check if branch is at capacity
        if (branch.MemberCount >= branch.MaxCapacity) {
            throw new Error(`Branch ${branchId} is at maximum capacity`);
        }

        // Increment member count
        const result = await db.prepare(
            "UPDATE Branches SET MemberCount = MemberCount + 1 WHERE BranchID = ?"
        ).bind(branchId).run();
        
        return result.success;
    } catch (error) {
        console.error(`Error incrementing member count for branch ${branchId}:`, error);
        throw error;
    }
}

// Get available branches for new members
export async function getAvailableBranches(db: D1Database): Promise<Branch[]> {
    try {
        const { results } = await db.prepare(
            "SELECT * FROM Branches WHERE IsActiveForNewMembers = TRUE AND MemberCount < MaxCapacity ORDER BY DepthLevel, MemberCount"
        ).all<Branch>();
        
        return results || [];
    } catch (error) {
        console.error("Error getting available branches:", error);
        throw error;
    }
}

// Get branch hierarchy (tree structure)
export async function getBranchHierarchy(db: D1Database): Promise<any> {
    try {
        const branches = await getAllBranches(db);
        
        // Build tree structure
        const branchMap: Record<number, any> = {};
        const rootBranches: any[] = [];
        
        // First pass: create branch objects with children arrays
        branches.forEach(branch => {
            branchMap[branch.BranchID] = {
                ...branch,
                children: []
            };
        });
        
        // Second pass: build the tree
        branches.forEach(branch => {
            if (branch.ParentBranchID === null) {
                rootBranches.push(branchMap[branch.BranchID]);
            } else {
                const parentBranch = branchMap[branch.ParentBranchID];
                if (parentBranch) {
                    parentBranch.children.push(branchMap[branch.BranchID]);
                }
            }
        });
        
        return rootBranches;
    } catch (error) {
        console.error("Error getting branch hierarchy:", error);
        throw error;
    }
}

