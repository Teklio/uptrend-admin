import { useMemo, useState } from "react";
import { buildCertificateHtml, type CertificateData } from "../../utils/certificateTemplate";

// Design-review-only route: renders the exact same HTML/CSS that Puppeteer
// turns into the real certificate PDF (server/src/utils/certificateTemplate.ts),
// so edits can be judged here before touching the server copy. Keep both
// files in sync when the design changes.

const SAMPLE_DATA: CertificateData = {
  studentName: "Shoukath",
  courseTitle: "Nifty 50 Options, Futures, Indian Equities & Forex",
  batch: "2026 September",
  certificateId: "PAY260915EQO",
  issueDate: "September 15, 2026",
  instructorName: "Asif Junais",
  verifyUrl: "http://localhost:3001/verify/PAY260915EQO",
};

const CertificatePage = () => {
  const [data, setData] = useState<CertificateData>(SAMPLE_DATA);
  const html = useMemo(() => buildCertificateHtml(data), [data]);

  const updateField = (field: keyof CertificateData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-900">Certificate design preview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Byte-identical to the real PDF template. Edit the sample fields to see how it holds up with different
          content, then request design changes.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["studentName", "Student name"],
              ["courseTitle", "Course title"],
              ["batch", "Batch"],
              ["instructorName", "Instructor"],
              ["issueDate", "Issue date"],
              ["certificateId", "Certificate ID"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              {label}
              <input
                value={data[field]}
                onChange={updateField(field)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="shadow-xl" style={{ width: "297mm", height: "210mm", flexShrink: 0 }}>
          <iframe title="Certificate preview" srcDoc={html} className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
