/** Company details printed on every AZ document (taken from the AzDocs designs). */
export const COMPANY = {
  taxNumber: "577219804",
  address: "A8/500 St Maadi Cairo",
  email: "info@alazab.com",
  phone: "+201004006620",
} as const;

export type PaymentProfileId = "combined" | "smart_lights" | "alazab_co";

export interface PaymentProfile {
  id: PaymentProfileId;
  /** Shown in the "Payment to" field. */
  payTo: string;
  account: string;
  bank: string;
  accountName: string;
  sortCode: string;
  instapay: string;
}

export const PAYMENT_PROFILES: Record<PaymentProfileId, PaymentProfile> = {
  combined: {
    id: "combined",
    payTo: "ALAZAB CO",
    account: "2157525511 | 10098645432",
    bank: "QNB | CIB",
    accountName: "ALAZAB CO | SMART LIGHTS",
    sortCode: "QNBAEGCXXXX",
    instapay: "alazab.payments@instapay",
  },
  smart_lights: {
    id: "smart_lights",
    payTo: "SMART LIGHTS",
    account: "2157525511",
    bank: "QNB",
    accountName: "SMART LIGHTS",
    sortCode: "QNBAEGCXXXX",
    instapay: "mohamed.azab750351@instapay",
  },
  alazab_co: {
    id: "alazab_co",
    payTo: "ALAZAB CO",
    account: "10098645432",
    bank: "CIB",
    accountName: "ALAZAB CO",
    sortCode: "",
    instapay: "alazab.payments@instapay",
  },
};

export const RULES = [
  "Payment can be made in cash or by bank transfer.",
  "Goods cannot be returned or exchanged after 14 days from Purchase.",
  "Returns are accepted in the case of a manufacturing defect.",
  "The original invoice must be presented for returns or exchanges.",
] as const;
