# Gaius Ministry · Staff Hub (English / አማርኛ)

Monday staff meeting and program attendance, with name + password login, comments, and an admin/leader view of **who joined and who did not**. Static site (no build) + Supabase backend. Deploy free on GitHub Pages.

## 1. Supabase (5 minutes)
1. Create a project at supabase.com.
2. **SQL Editor** > New query > paste `supabase/schema.sql` > Run.
3. **Authentication > Providers > Email**: keep Email enabled and turn **OFF "Confirm email"** (users sign in with a username, so no email is sent).
4. **Project Settings > API**: copy the Project URL and the `anon` public key into `config.js`.

## 2. GitHub Pages
Push this folder to a GitHub repo > **Settings > Pages** > Deploy from branch `main`, folder `/ (root)`. Open the page URL.

## 3. First use
- The **first person to request access becomes the admin automatically**. Do this yourself first.
- Everyone else: *Request access* (full name, username, password). The admin approves them in the **Members** tab and can make someone a **Leader** (creates meetings, sees attendance, marks people present).
- Leaders create the Monday *staff meeting* or *program* (Meetings > Create meeting). Staff tap **I am present** on the meeting day (Addis Ababa time); the time is recorded automatically.
- The meeting page shows **Joined / Did not join** with counts, and a comment box. Leader comments carry a badge.

## Notes
- Username login is mapped to `username@EMAIL_DOMAIN` (set in `config.js`); no real mailbox is needed.
- Password reset: Supabase dashboard > Authentication > Users > the user > Send/Update password (the app has no self-service reset).
- The anon key is safe to publish; access is enforced by the Row Level Security policies in `schema.sql`. Never put the `service_role` key in this project.
- Brand: logo from your files; colors sampled from the logo (leaf green `#4E9A1F`, light green `#86C24F`, grey `#6B6D70`).
