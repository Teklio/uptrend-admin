import type { DropdownOption } from "../components/shared/Dropdown";

// Mirrors the server's courseLanguages enum (src/schemas/course.schema.ts)
// — the DB column itself is still a plain string, this just constrains
// what the admin lets you pick.
export const COURSE_LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: "English", value: "english" },
  { label: "Malayalam", value: "malayalam" },
];
