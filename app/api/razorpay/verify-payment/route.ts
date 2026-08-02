import { NextResponse } from "next/server";

/**
 * Schema Flow is 100% Free & Open Source. Payment routes are deprecated.
 */
export async function POST(): Promise<NextResponse> {
    return NextResponse.json(
        { message: "Schema Flow is 100% Free & Open Source. No payments required!" },
        { status: 200 }
    );
}
