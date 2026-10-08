# Reliable production watch rebuilds

2026-10-08. Production compilation must preserve dependencies for both standalone and exposed federation entry points across repeated watch rebuilds. Keep existing runtime identities and UI changes. No restart should be needed after ordinary source edits. Verify clean build plus multiple incremental builds and direct federation loading; document cause and evidence.
