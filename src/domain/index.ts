// ---------------------------------------------------------------------------
// TKLH domain layer — the single API surface shared by the customer, partner,
// and admin web apps, and by future iOS/Android clients.
//
// Rules for this folder:
//  - No React, no hooks, no animation, no UI imports.
//  - Every database/storage/edge-function call lives here, not in a component.
//  - Security stays server-side (RLS + SECURITY DEFINER functions); these
//    services never assume the caller is trusted.
// ---------------------------------------------------------------------------
export * as authService from "@/domain/auth/service";
export * as usersService from "@/domain/users/service";
export * as vendorsService from "@/domain/vendors/service";
export * as eventsService from "@/domain/events/service";
export * as bookingsService from "@/domain/bookings/service";
export * as paymentsService from "@/domain/payments/service";
export * as packagesService from "@/domain/packages/service";
export * as availabilityService from "@/domain/availability/service";
export * as reviewsService from "@/domain/reviews/service";
export * as notificationsService from "@/domain/notifications/service";
export * as leadsService from "@/domain/leads/service";
export * as incidentsService from "@/domain/incidents/service";
export * as storageService from "@/domain/storage/service";
export * as functionsService from "@/domain/functions/service";

export * from "@/domain/types";
