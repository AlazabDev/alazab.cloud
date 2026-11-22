import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY, PAYMENT_PROFILES, RULES, type PaymentProfileId } from "@/lib/azdocs/company";
import {
  KIND_TITLE,
  amountInArabicWords,
  docCode,
  money,
  paginate,
  qty,
  type PagePlan,
  type SalesDoc,
} from "@/lib/azdocs/model";
import logo from "@/assets/alazab-logo.png.asset.json";
import watermark from "@/assets/az-watermark.png.asset.json";

/** Designed table-body height per page type (mm), split evenly between that page's rows. */
const BODY_MM = { single: 117, first: 195, middle: 252, last: 180 } as const;

function pageType(p: PagePlan): keyof typeof BODY_MM {
  if (p.header && p.totals) return "single";
  if (p.header) return "first";
  if (p.totals) return "last";
  return "middle";
}

const COLS = [
  { label: "Total", width: "18%" },
  { label: "Qu", width: "8.5%" },
  { label: "Unit Price", width: "12.5%" },
  { label: "Item", width: "25.5%" },
  { label: "Code", width: "16.5%" },
  { label: "Image", width: "19%" },
];

interface Props {
  doc: SalesDoc;
  paymentProfile?: PaymentProfileId;
}

/** A4 pages of an invoice / quotation in the AzDocs design (labels stay in English as designed). */
export function SalesDocPrint({ doc, paymentProfile }: Props) {
  const code = docCode(doc.kind, doc.date, doc.number);
  const pay = PAYMENT_PROFILES[paymentProfile ?? doc.paymentProfile];
  const pages = paginate(doc.items.length);
  const [qr, setQr] = useState("");

  useEffect(() => {
    let alive = true;
    const value =
      doc.qrValue ||
      `${code} | ${doc.clientName} | ${money(doc.subtotal + doc.tax)} ${doc.currency}`;
    QRCode.toDataURL(value, { width: 240, margin: 0, errorCorrectionLevel: "M" })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(""));
    return () => {
      alive = false;
    };
  }, [code, doc.qrValue, doc.clientName, doc.subtotal, doc.tax, doc.currency]);

  return (
    <div className="az-print-root flex flex-col items-center">
      {pages.map((p, pi) => {
        const type = pageType(p);
        const rowH = `${BODY_MM[type] / p.capacity}mm`;
        const rows = doc.items.slice(p.start, p.end);
        const fillers = Math.max(0, p.capacity - rows.length);
        return (
          <section
            key={pi}
            className="az-page"
            aria-label={`${KIND_TITLE[doc.kind]} page ${pi + 1}`}
          >
            <div className="az-ribbon">
              <span>{code}</span>
            </div>
            <img className="az-watermark" src={watermark.url} alt="" />

            <div className="az-body">
              {p.header ? (
                <>
                  <header className="az-head">
                    <img className="az-logo" src={logo.url} alt="al-azab.co" />
                    <div className="az-title">
                      <h1>{KIND_TITLE[doc.kind]}</h1>
                      <p>Tax: {COMPANY.taxNumber}</p>
                    </div>
                  </header>

                  <div className="az-info">
                    <div>
                      <b>Date:</b>
                      <span>{doc.date}</span>
                    </div>
                    <div>
                      <b>Payment to:</b>
                      <span>{pay.payTo}</span>
                    </div>
                    <div>
                      <b>{doc.kind === "quote" ? "Quotation to:" : "Invoice to:"}</b>
                      <span>{doc.clientName}</span>
                    </div>
                    <div>
                      <b>{doc.kind === "quote" ? "Quotation Number:" : "Invoice Number:"}</b>
                      <span>{code}</span>
                    </div>
                    <div>
                      <b>Phone Number:</b>
                      <span>{doc.clientPhone}</span>
                    </div>
                    <div>
                      <b>Representative:</b>
                      <span>{doc.representative}</span>
                    </div>
                    <div>
                      <b>Address:</b>
                      <span>{doc.clientAddress}</span>
                    </div>
                    <div>
                      <b>Section:</b>
                      <span>{doc.section}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="az-spacer" />
              )}

              <div className="az-tablewrap" style={{ marginTop: p.header ? "7mm" : 0 }}>
                <table className="az-table">
                  <colgroup>
                    {COLS.map((c) => (
                      <col key={c.label} style={{ width: c.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {COLS.map((c) => (
                        <th key={c.label}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((it, i) => (
                      <tr key={p.start + i} style={{ height: rowH }}>
                        <td>{money(it.total)}</td>
                        <td>{qty(it.quantity)}</td>
                        <td>{money(it.unitPrice)}</td>
                        <td className="az-item">
                          <div className="az-item-in" style={{ maxHeight: `calc(${rowH} - 2mm)` }}>
                            <strong>{it.name}</strong>
                            {it.description && it.description !== it.name && (
                              <small>{it.description}</small>
                            )}
                          </div>
                        </td>
                        <td className="az-code">{it.code}</td>
                        <td className="az-img-cell">
                          {it.imageUrl && (
                            <img
                              src={it.imageUrl}
                              alt={it.name}
                              style={{ maxHeight: `calc(${rowH} - 3mm)` }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                    {Array.from({ length: fillers }, (_, i) => (
                      <tr key={`f${i}`} style={{ height: rowH }}>
                        {COLS.map((c) => (
                          <td key={c.label} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {p.totals && (
                <>
                  <div className="az-summary">
                    <table className="az-totals">
                      <tbody>
                        <tr>
                          <td>{money(doc.subtotal)}</td>
                          <td>Total</td>
                        </tr>
                        <tr>
                          <td>{money(doc.tax)}</td>
                          <td>Tax</td>
                        </tr>
                        <tr>
                          <td>{money(doc.paid)}</td>
                          <td>Paid</td>
                        </tr>
                        <tr className="az-final">
                          <td>
                            {money(doc.finalTotal)} <small>{doc.currency}</small>
                          </td>
                          <td>Final Total</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="az-rules">
                      <h3>Rules and Instructions</h3>
                      <ul>
                        {RULES.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="az-amount-words" dir="rtl">
                    <b>المبلغ كتابة:</b> {amountInArabicWords(doc.finalTotal, doc.currency)}
                  </p>
                  <div className="az-pay">
                    <dl>
                      <dt>Payments Account:</dt>
                      <dd>{pay.account}</dd>
                      <dt>Bank Name:</dt>
                      <dd>{pay.bank}</dd>
                      <dt>Account Name:</dt>
                      <dd>{pay.accountName}</dd>
                      {pay.sortCode && (
                        <>
                          <dt>Sort Code:</dt>
                          <dd>{pay.sortCode}</dd>
                        </>
                      )}
                      <dt>Instapay:</dt>
                      <dd>{pay.instapay}</dd>
                    </dl>
                    {qr && <img className="az-qr" src={qr} alt="QR" />}
                  </div>
                </>
              )}
            </div>

            {p.totals && (
              <footer className="az-foot">
                <div className="az-contacts">
                  <span>
                    <i>
                      <MapPin />
                    </i>
                    {COMPANY.address}
                  </span>
                  <span>
                    <i>
                      <Mail />
                    </i>
                    {COMPANY.email}
                  </span>
                  <span>
                    <i>
                      <Phone />
                    </i>
                    {COMPANY.phone}
                  </span>
                </div>
              </footer>
            )}
            <div className="az-bar" />
          </section>
        );
      })}
    </div>
  );
}
