<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Page components live in `src/components/pages/`; each file in `src/routes/` only wires a path, `head()` metadata and the page component. Why: keeps the ported gateway pages intact and routes thin.
- Anything read from browser storage (service directory, language choice) is loaded in `useEffect` after mount, starting from the default (starter directory, Arabic). Why: server render and first browser render must match.
- The service directory is stored in the visitor's browser, not a database; gateway pages (`/`, `/settings`, `/storage`) need no sign-in. Why: documented product decision in `docs/alazab-cloud.md`; each linked system handles its own sign-in.
- The file gallery lives under `src/routes/_authenticated/files*` (client-only gate, redirect to `/auth`); its data access is enforced by database access rules and storage policies, never by hiding UI. Why: staff and clients share one gallery and clients must only reach released files of their own projects.
- Gallery revisions are immutable rows plus files at `{project_id}/{document_id}/{uuid}-{name}` in the private `project-files` bucket; status, numbering and the audit log are maintained by database triggers. Why: the plan requires originals never be replaced and every action logged.
- External share links resolve only through the public `resolveShare` server function, which checks expiry/revocation and returns short-lived signed URLs. Why: the share page has no session, so the check must happen server-side.
- AI document classification runs only in the staff-only `suggestDocumentClassification` server function (`src/lib/files/classify*.ts`); allowed values and answer clamping live in the client-safe `classify.ts`, the model call in `classify.server.ts`. Why: keeps the gateway key server-side and guarantees suggestions are always valid gallery categories.
- Protected server functions get the user's token from the `attachSupabaseAuth` client middleware registered in `src/start.ts`. Why: `requireSupabaseAuth` needs a bearer header and this external backend has no generated attacher.
