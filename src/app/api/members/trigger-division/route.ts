// API route to manually trigger or check the member division logic
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Threshold for division
const DIVISION_THRESHOLD = 5000;
const DIVISION_FLAG_KEY = 'division_completed';

export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db = env.DB;

    // 1. Check if division has already been completed
const divisionFlag = await db.prepare(
  `SELECT value FROM app_settings WHERE key = ?`
).bind('division_completed_flag').first<{ value: string }>();

    if (divisionFlag?.value === 'true') {
      return NextResponse.json({ message: 'Division has already been completed.' }, { status: 200 });
    }

    // 2. Get the current count of active members
    // Assuming 'active' is a valid membership_status
    const countResult = await db.prepare(
  `SELECT COUNT(*) as count FROM members WHERE membership_status = ?`
).bind('active').first<{ count: number }>();

    const activeMemberCount = countResult?.count ?? 0;

    // 3. Check if the threshold is met
    if (activeMemberCount < DIVISION_THRESHOLD) {
      return NextResponse.json({ message: `Member count (${activeMemberCount}) is below the threshold (${DIVISION_THRESHOLD}). Division not triggered.` }, { status: 200 });
    }

    // 4. Perform the division
    console.log(`Threshold reached (${activeMemberCount} members). Starting division...`);

    // Fetch members who are active but don't have a group assigned yet
    const membersToDivide = await (process.env as any).DB.prepare(`
      SELECT id 
      FROM members 
      WHERE membership_status = 'active' AND (division_group IS NULL OR division_group = '')
    `).all();

    if (!membersToDivide.results || membersToDivide.results.length === 0) {
        console.log('No members found needing division assignment.');
        // Still mark as complete if threshold is met but no one needs assignment (edge case)
        return NextResponse.json({ message: 'Threshold reached, but no members needed assignment (already assigned or none found). Division marked as complete.' }, { status: 200 });
    }

    console.log(`Assigning groups to ${membersToDivide.results.length} members...`);

    // Prepare batch update statements
    const batchStatements = membersToDivide.results.map((member: { id: number }) => {
      const group = member.id % 2 === 0 ? 'even' : 'odd';
    });

    // Execute batch update
    await db.batch(batchStatements);

    // 5. Mark division as completed in settings

    console.log('Division completed successfully.');
    return NextResponse.json({ message: `Division completed successfully. Assigned groups to ${membersToDivide.results.length} members.` }, { status: 200 });

  } catch (error: any) {
    console.error('Error triggering division:', error);
    return NextResponse.json({ message: 'Error triggering division', error: error.message }, { status: 500 });
  }
}

// Optional: GET method to check status without triggering
export async function GET(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = env.DB;

// Внутри функции GET
const divisionFlag = await db.prepare(
  `SELECT value FROM app_settings WHERE key = ?`
).bind("division_completed_flag").first<{ value: string }>();

const countResult = await db.prepare(
  `SELECT COUNT(*) as count FROM members WHERE membership_status = ?`
).bind("active").first<{ count: number }>();

        const activeMemberCount = countResult?.count ?? 0;

        const status = {
            divisionCompleted: divisionFlag?.value === 'true',
            activeMemberCount: activeMemberCount,
            threshold: DIVISION_THRESHOLD,
            thresholdMet: activeMemberCount >= DIVISION_THRESHOLD
        };

        return NextResponse.json(status, { status: 200 });

    } catch (error: any) {
        console.error('Error checking division status:', error);
        return NextResponse.json({ message: 'Error checking division status', error: error.message }, { status: 500 });
    }
}

