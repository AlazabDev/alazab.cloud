# Roadmap

## Professional file gallery (ALAZAB Files)
- [x] Database: projects, members, folders, documents, versions, approvals, share links, audit log + access rules
- [x] Private file storage with per-project access
- [x] Sign-in / sign-up / password reset for staff and clients; first account becomes admin
- [x] Gallery shell: Home, Projects, Gallery, Approvals, Shares, Archive, Users (admin)
- [x] Project explorer: folders tree, grid/list, upload with type check + checksum
- [x] Document page: preview (image/PDF/video/Office/3D), metadata, versions, approvals, share links
- [x] Public share page with expiry/revocation
- [x] Link the gallery from the gateway
- [x] Side-by-side version comparison (basic)
- [x] AI suggestion of category, discipline and issuing party from title + description (staff only)
- [x] Specialised CAD/BIM viewers (DXF + IFC, added from GitHub)

## AZ Docs — branded invoices, quotations and documents (Daftra)
- [x] Brand templates from AzDocs designs: invoice + quotation (one page / multi-page), title document, maintenance receipt
- [x] Print / save as PDF on A4
- [x] Staff-only section in the signed-in area, linked from the gateway and the gallery
- [x] Daftra reader: invoices and quotations list + single document with line items, product codes and photos
- [x] Connect the Daftra account (alazab-co)
- [x] Document numbering: Daftra number as issued (AZ-INV-YYYY-NNNN)

## Integrate files added from GitHub (Nov 20)
- [ ] Fix type errors in added backend functions (Daftra assistant legacy tools, UberFix)
- [ ] Daftra sync function: working webhook + pull, invoices table + sync log, staff-only access
- [ ] Function settings (no platform JWT check where functions verify callers themselves)
- [ ] Invoices page route thin (page component under components/pages)
- [ ] WhatsApp: database tables for accounts, contacts, conversations, messages, templates, media
- [ ] WhatsApp: staff inbox page in the signed-in area (list conversations, read and send messages)
- [ ] Deploy functions; list secrets still needed (Daftra key, WhatsApp token, MinIO, MCP key)
