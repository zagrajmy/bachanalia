import { posix } from "node:path";

import { XMLParser } from "fast-xml-parser";
import { unzipSync } from "fflate";

const COLUMNS = ["Imię", "Nazwisko", "Bio", "Zdjęcie"] as const;
const decoder = new TextDecoder();
const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  removeNSPrefix: true,
  trimValues: false,
});

type Column = (typeof COLUMNS)[number];
interface XmlNode {
  [key: string]: XmlValue | undefined;
}
type XmlValue = XmlNode | XmlValue[] | number | string;

export type GuestSheetRow = Record<Column, string> & {
  photo?: Uint8Array;
};

const array = (value: XmlValue | undefined): XmlValue[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

function node(value: XmlValue | undefined, label: string): XmlNode {
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`xlsx: no ${label}`);
  return value;
}

const nodes = (value: XmlValue | undefined, label: string) =>
  array(value).map((entry) => node(entry, label));

function xmlText(value: XmlValue | undefined): string {
  if (value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(xmlText).join("");
  return Object.entries(value)
    .filter(([key]) => !key.startsWith("@_"))
    .map(([, child]) => xmlText(child))
    .join("");
}

function isXmlNode(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseXml(files: Record<string, Uint8Array>, path: string) {
  const bytes = files[path];
  if (!bytes) throw new Error(`xlsx: no ${path}`);
  const parsed: unknown = parser.parse(decoder.decode(bytes));
  if (!isXmlNode(parsed)) throw new Error(`xlsx: invalid XML in ${path}`);
  return parsed;
}

function relationshipPath(source: string) {
  return posix.join(posix.dirname(source), "_rels", `${posix.basename(source)}.rels`);
}

function relatedFile(files: Record<string, Uint8Array>, source: string, id: string) {
  const document = parseXml(files, relationshipPath(source));
  const relationships = node(document.Relationships, "Relationships");
  const relationship = nodes(relationships.Relationship, "Relationship").find(
    (entry) => xmlText(entry["@_Id"]) === id,
  );
  const target = xmlText(relationship?.["@_Target"]);
  if (!target) throw new Error(`xlsx: no ${id} relationship from ${source}`);
  return posix.normalize(posix.join(posix.dirname(source), target));
}

function firstSheetPath(files: Record<string, Uint8Array>) {
  const workbookPath = "xl/workbook.xml";
  const workbook = node(parseXml(files, workbookPath).workbook, "workbook");
  const sheets = node(workbook.sheets, "sheets");
  const sheet = nodes(sheets.sheet, "sheet")[0];
  const id = xmlText(sheet?.["@_id"]);
  if (!id) throw new Error("xlsx: workbook has no sheet");
  return relatedFile(files, workbookPath, id);
}

function sharedStrings(files: Record<string, Uint8Array>) {
  const path = "xl/sharedStrings.xml";
  if (!files[path]) return [];
  const document = node(parseXml(files, path).sst, "shared strings");
  return nodes(document.si, "shared string").map(xmlText);
}

function columnNumber(reference: string) {
  const letters = /^[A-Z]+/.exec(reference)?.[0];
  if (!letters) throw new Error(`xlsx: bad cell reference ${reference}`);
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.codePointAt(0)! - 64;
  return result;
}

function sheetCells(files: Record<string, Uint8Array>, sheetPath: string) {
  const strings = sharedStrings(files);
  const document = node(parseXml(files, sheetPath).worksheet, "worksheet");
  const sheetData = node(document.sheetData, "sheet data");
  const rows = new Map<number, Map<number, string>>();

  for (const row of nodes(sheetData.row, "row")) {
    const rowNumber = Number(xmlText(row["@_r"]));
    const cells = new Map<number, string>();
    for (const cell of nodes(row.c, "cell")) {
      const reference = xmlText(cell["@_r"]);
      const type = xmlText(cell["@_t"]);
      const raw = type === "inlineStr" ? xmlText(cell.is) : xmlText(cell.v);
      const value = type === "s" ? (strings[Number(raw)] ?? "") : raw;
      cells.set(columnNumber(reference), value);
    }
    rows.set(rowNumber, cells);
  }

  return { document, rows };
}

function sheetImages(
  files: Record<string, Uint8Array>,
  sheetPath: string,
  worksheet: XmlNode,
  photoColumn: number,
) {
  const images = new Map<number, Uint8Array>();
  if (worksheet.drawing === undefined) return images;
  const drawingId = xmlText(node(worksheet.drawing, "drawing")["@_id"]);
  const drawingPath = relatedFile(files, sheetPath, drawingId);
  const drawing = node(parseXml(files, drawingPath).wsDr, "drawing document");
  const anchors = [
    ...nodes(drawing.oneCellAnchor, "one-cell image anchor"),
    ...nodes(drawing.twoCellAnchor, "two-cell image anchor"),
  ];

  for (const anchor of anchors) {
    const from = node(anchor.from, "image anchor origin");
    const column = Number(xmlText(from.col)) + 1;
    if (column !== photoColumn) continue;

    const row = Number(xmlText(from.row)) + 1;
    const picture = node(anchor.pic, "anchored picture");
    const fill = node(picture.blipFill, "picture fill");
    const blip = node(fill.blip, "picture data");
    const imageId = xmlText(blip["@_embed"]);
    const imagePath = relatedFile(files, drawingPath, imageId);
    const bytes = files[imagePath];
    if (!bytes) throw new Error(`xlsx: no embedded image ${imagePath}`);
    if (images.has(row)) throw new Error(`xlsx: two photos anchored to row ${row}`);
    images.set(row, bytes);
  }

  return images;
}

export function guestsFromXlsx(bytes: ArrayBuffer | Uint8Array): GuestSheetRow[] {
  const files = unzipSync(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  const sheetPath = firstSheetPath(files);
  const { document, rows } = sheetCells(files, sheetPath);
  const headers = rows.get(1);
  if (!headers) throw new Error("xlsx: sheet has no header row");

  const columns = new Map<Column, number>();
  for (const column of COLUMNS) {
    const match = [...headers].find(([, value]) => value.trim() === column);
    if (!match)
      throw new Error(`xlsx: no ${column} column among ${[...headers.values()].join(", ")}`);
    columns.set(column, match[0]);
  }

  const photoColumn = columns.get("Zdjęcie");
  if (photoColumn === undefined) throw new Error("xlsx: no Zdjęcie column");
  const images = sheetImages(files, sheetPath, document, photoColumn);
  const value = (cells: Map<number, string>, column: Column) =>
    (cells.get(columns.get(column) ?? -1) ?? "").trim();

  return [...rows]
    .filter(([row]) => row > 1)
    .map(([row, cells]) => ({
      Imię: value(cells, "Imię"),
      Nazwisko: value(cells, "Nazwisko"),
      Bio: value(cells, "Bio"),
      Zdjęcie: value(cells, "Zdjęcie"),
      photo: images.get(row),
    }));
}
