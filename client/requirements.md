## Packages
date-fns | Date formatting and manipulation for calendar and tasks
framer-motion | Smooth animations for lists, dialogs, and page transitions
react-day-picker | Calendar component for the events page
@hookform/resolvers | Zod resolver for react-hook-form
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes without conflicts

## Notes
- Authentication is handled via Replit Auth (useAuth hook).
- The app requires a "Household" context. If a user has no household, they must create or join one.
- Backend API routes use standard REST patterns defined in @shared/routes.
- Icons provided by lucide-react (already available).
- Forms use react-hook-form with Zod validation.
