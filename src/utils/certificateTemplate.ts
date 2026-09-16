// Copied from server/src/utils/certificateTemplate.ts so the /certificate
// design-review route renders byte-identical markup to the real PDF. Keep
// both files in sync when editing the certificate design.

import { LOGO_DATA_URI } from "./certificateAssets";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  batch: string;
  certificateId: string;
  issueDate: string;
  instructorName: string;
  verifyUrl: string;
}

const NAVY = "#002b7f";
const NAVY_DARK = "#001c54";
const GOLD = "#f5a300";

export const buildCertificateHtml = (data: CertificateData) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 297mm;
    height: 210mm;
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #ffffff;
  }
  .sheet {
    position: relative;
    width: 297mm;
    height: 210mm;
    background: linear-gradient(135deg, #ffffff 0%, #fafaf9 50%, #fffdf5 100%);
    border: 10px solid ${NAVY};
    overflow: hidden;
  }
  .border-gold {
    position: absolute;
    inset: 14px;
    border: 3px solid ${GOLD};
    pointer-events: none;
  }
  .border-thin {
    position: absolute;
    inset: 20px;
    border: 1px solid rgba(0, 43, 127, 0.2);
    pointer-events: none;
  }
  .corner {
    position: absolute;
    width: 22px;
    height: 22px;
    background: ${GOLD};
    transform: rotate(45deg);
  }
  .corner.tl { top: 6px; left: 6px; }
  .corner.tr { top: 6px; right: 6px; }
  .corner.bl { bottom: 6px; left: 6px; }
  .corner.br { bottom: 6px; right: 6px; }

  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -52%);
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 900;
    font-size: 380px;
    line-height: 1;
    color: rgba(0, 43, 127, 0.035);
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }

  .content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 26px;
    padding: 16px 56px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .header .logo {
    height: 48px;
    margin: 0 auto 12px;
    display: block;
  }
  .header .brand {
    font-size: 19px;
    font-weight: bold;
    letter-spacing: 5px;
    color: ${NAVY};
  }
  .header .sub {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 3px;
    color: #d68e00;
    text-transform: uppercase;
  }
  .divider {
    width: 240px;
    height: 2px;
    background: ${GOLD};
    margin: 12px auto 0;
  }

  .title {
    margin-top: 10px;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 900;
    font-size: 42px;
    letter-spacing: 2px;
    color: ${NAVY_DARK};
    text-transform: uppercase;
  }
  .presented {
    margin-top: 14px;
    font-style: italic;
    font-size: 17px;
    color: #64748b;
    font-family: Georgia, serif;
  }
  .student-name {
    margin-top: 16px;
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: bold;
    font-size: 56px;
    letter-spacing: 1px;
    color: ${NAVY};
  }
  .name-underline {
    width: 360px;
    height: 2px;
    background: ${GOLD};
    margin: 10px auto 0;
  }
  .statement {
    margin-top: 18px;
    max-width: 760px;
    font-size: 15px;
    color: #475569;
    line-height: 1.6;
  }
  .course-title {
    margin-top: 12px;
    font-weight: bold;
    font-size: 28px;
    color: #0f172a;
    text-transform: uppercase;
  }
  .batch-badge {
    display: inline-block;
    margin-top: 16px;
    padding: 8px 20px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 13px;
    font-weight: bold;
    color: #334155;
    letter-spacing: 0.5px;
  }

  .footer {
    width: 100%;
    padding-top: 12px;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 24px;
  }
  .sig-block { width: 280px; text-align: center; }
  .sig-line { width: 100%; border-top: 1.5px solid #94a3b8; margin-bottom: 10px; }
  .sig-name { font-style: italic; font-size: 21px; color: ${NAVY}; font-family: Georgia, serif; }
  .sig-role { margin-top: 6px; font-weight: bold; font-size: 13px; color: #0f172a; }
  .sig-org { margin-top: 2px; font-size: 12px; color: #64748b; }

  .seal {
    width: 94px;
    height: 94px;
    border-radius: 50%;
    background: ${GOLD};
    border: 3px solid ${NAVY};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .seal-inner {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    border: 2px dashed #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${NAVY};
  }
  .seal-inner .official { font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }
  .seal-inner .certified { font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="border-gold"></div>
    <div class="border-thin"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
    <div class="watermark">U</div>

    <div class="content">
      <div class="header">
        <img class="logo" src="${LOGO_DATA_URI}" alt="" />
        <div class="brand">UPTREND FINANCIAL ACADEMY</div>
        <div class="sub">Center for Institutional Trading Excellence</div>
        <div class="divider"></div>
      </div>

      <div>
        <div class="title">Certificate of Completion</div>
        <div class="presented">This is proudly presented to</div>
        <div class="student-name">${data.studentName}</div>
        <div class="name-underline"></div>
        <div class="statement">
          for successfully completing the comprehensive professional syllabus and risk management framework of
        </div>
        <div class="course-title">${data.courseTitle}</div>
        <div class="batch-badge">Batch: ${data.batch}</div>
      </div>

      <div class="footer">
        <div class="signatures">
          <div class="sig-block"></div>

          <div class="seal">
            <div class="seal-inner">
              <span class="official">OFFICIAL</span>
              <span class="certified">CERTIFIED</span>
            </div>
          </div>

          <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-name">${data.instructorName}</div>
            <div class="sig-role">Lead Market Mentor</div>
            <div class="sig-org">UPtrend Financial Academy</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
