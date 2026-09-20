import { expect, test } from "bun:test";

import { strToU8, zipSync } from "fflate";

import { guestsFromXlsx } from "./guest-sheet";

const xml = (source: string) => strToU8(`<?xml version="1.0" encoding="UTF-8"?>${source}`);

const cells = (row: number, values: number[]) =>
  values
    .map(
      (value, index) =>
        `<c r="${String.fromCodePoint(65 + index)}${row}" t="s"><v>${value}</v></c>`,
    )
    .join("");

function fixture() {
  const strings = [
    "L.P.",
    "Imię",
    "Nazwisko",
    "Bio",
    "Zdjęcie",
    "Ola & Andzia",
    "Testowa",
    "Pierwszy akapit.",
    "Bez",
    "Zdjęcia",
  ];
  return zipSync({
    "xl/workbook.xml": xml(
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Arkusz1" r:id="rId1"/></sheets></workbook>',
    ),
    "xl/_rels/workbook.xml.rels": xml(
      '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
    ),
    "xl/sharedStrings.xml": xml(
      `<sst>${strings.map((value) => `<si><t>${value.replaceAll("&", "&amp;")}</t></si>`).join("")}</sst>`,
    ),
    "xl/worksheets/sheet1.xml": xml(
      `<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetData><row r="1">${cells(1, [0, 1, 2, 3, 4])}</row><row r="2">${cells(2, [0, 5, 6, 7])}</row><row r="3">${cells(3, [0, 8, 9])}</row></sheetData><drawing r:id="rId2"/></worksheet>`,
    ),
    "xl/worksheets/_rels/sheet1.xml.rels": xml(
      '<Relationships><Relationship Id="rId2" Target="../drawings/drawing1.xml"/></Relationships>',
    ),
    "xl/drawings/drawing1.xml": xml(
      '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>4</xdr:col><xdr:row>1</xdr:row></xdr:from><xdr:pic><xdr:blipFill><a:blip r:embed="rId3"/></xdr:blipFill></xdr:pic></xdr:oneCellAnchor></xdr:wsDr>',
    ),
    "xl/drawings/_rels/drawing1.xml.rels": xml(
      '<Relationships><Relationship Id="rId3" Target="../media/photo.png"/></Relationships>',
    ),
    "xl/media/photo.png": new Uint8Array([1, 2, 3, 4]),
  });
}

test("reads over-cell photos from a Google Sheets XLSX export", () => {
  expect(guestsFromXlsx(fixture())).toEqual([
    {
      Imię: "Ola & Andzia",
      Nazwisko: "Testowa",
      Bio: "Pierwszy akapit.",
      Zdjęcie: "",
      photo: new Uint8Array([1, 2, 3, 4]),
    },
    {
      Imię: "Bez",
      Nazwisko: "Zdjęcia",
      Bio: "",
      Zdjęcie: "",
      photo: undefined,
    },
  ]);
});
