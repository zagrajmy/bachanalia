import { con } from "@/content/con";

/**
 * The convention as a file a calendar can swallow. All-day rather than timed:
 * the doors open at 14:00 on Friday but nothing says when Sunday ends, and a
 * three-day block is what a visitor actually wants in their week anyway.
 */

/** Commas, semicolons and backslashes carry meaning in a property value. */
const escape = (value: string) =>
  value.replaceAll(/([\\,;])/g, String.raw`\$1`).replaceAll(/\n/g, String.raw`\n`);

const compact = (iso: string) => iso.replaceAll(/-/g, "");

/** `DTEND` is exclusive for an all-day event, so the con ends the day after. */
function dayAfter(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}

/**
 * RFC 5545 caps a line at 75 octets and continues it with a leading space.
 * Folded at 74 characters, which is never more octets than that, because the
 * venue line runs past the limit and Outlook is the strict one.
 */
function fold(line: string) {
  if (line.length <= 74) return line;

  const parts = [line.slice(0, 74)];
  for (let at = 74; at < line.length; at += 73) parts.push(String(line.slice(at, at + 73)));

  return parts.join("\r\n");
}

export function GET() {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bachanalia Fantastyczne//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${con.edition.toLowerCase()}-${con.starts}@bachanaliafantastyczne.pl`,
    `DTSTAMP:${new Date().toISOString().replaceAll(/[-:]|\.\d{3}/g, "")}`,
    `DTSTART;VALUE=DATE:${compact(con.starts)}`,
    `DTEND;VALUE=DATE:${compact(dayAfter(con.ends))}`,
    `SUMMARY:${escape(`${con.name} ${con.edition}`)}`,
    `LOCATION:${escape(`${con.venue}, ${con.address}`)}`,
    `DESCRIPTION:${escape(`${con.rank} ${con.starts.slice(0, 4)}. Organizuje ${con.organiser}.`)}`,
    "URL:https://bachanaliafantastyczne.pl/",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
    .concat("\r\n");

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="bachanalia-fantastyczne.ics"',
      "cache-control": "public, max-age=86400",
    },
  });
}
