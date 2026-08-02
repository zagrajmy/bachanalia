import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(request: NextRequest) {
  /**
   * Before the body is touched, not after: parsing first meant any unsigned
   * request with a malformed body answered 500 and a stack trace where it
   * should have answered 401.
   */
  if (request.headers.get("X-Headless-Secret-Key") !== process.env.HEADLESS_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let paths: unknown;
  let tags: unknown;

  try {
    const body = await request.text();
    ({ paths = [], tags = [] } = body ? JSON.parse(body) : {});
  } catch {
    return NextResponse.json({ message: "Malformed body" }, { status: 400 });
  }

  let revalidated = false;

  try {
    if (Array.isArray(paths) && paths.length > 0) {
      for (const path of paths) revalidatePath(path);
      revalidated = true;
    }

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) revalidateTag(tag, "max");
      revalidated = true;
    }

    return NextResponse.json({ revalidated, now: Date.now(), paths, tags });
  } catch {
    return NextResponse.json({ message: "Error revalidating paths or tags" }, { status: 500 });
  }
}
