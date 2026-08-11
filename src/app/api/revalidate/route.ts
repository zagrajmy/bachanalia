import { type } from "arktype";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * WordPress posts this on every publish, and both fields reach Next's cache
 * API as strings. A number in the list used to travel all the way there.
 */
const RevalidateBody = type({
  "paths?": "string[]",
  "tags?": "string[]",
});

export async function PUT(request: NextRequest) {
  /**
   * Before the body is touched, not after: parsing first meant any unsigned
   * request with a malformed body answered 500 and a stack trace where it
   * should have answered 401.
   */
  if (request.headers.get("X-Headless-Secret-Key") !== process.env.HEADLESS_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let parsed: unknown;

  try {
    const body = await request.text();
    parsed = body ? JSON.parse(body) : {};
  } catch {
    return NextResponse.json({ message: "Malformed body" }, { status: 400 });
  }

  const validated = RevalidateBody(parsed);

  if (validated instanceof type.errors) {
    return NextResponse.json({ message: validated.summary }, { status: 400 });
  }

  const { paths = [], tags = [] } = validated;
  let revalidated = false;

  try {
    if (paths.length > 0) {
      for (const path of paths) revalidatePath(path);
      revalidated = true;
    }

    if (tags.length > 0) {
      for (const tag of tags) revalidateTag(tag, "max");
      revalidated = true;
    }

    return NextResponse.json({ revalidated, now: Date.now(), paths, tags });
  } catch {
    return NextResponse.json({ message: "Error revalidating paths or tags" }, { status: 500 });
  }
}
