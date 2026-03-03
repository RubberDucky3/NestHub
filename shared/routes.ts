import { z } from 'zod';
export * from './schema';
import {
  insertHouseholdSchema,
  insertTaskSchema,
  insertShoppingItemSchema,
  insertEventSchema,
  insertStickyNoteSchema,
  updateStickyNoteSchema,
  insertBountySchema,
  insertRewardStoreSchema,
  insertTaskCommentSchema,
  insertMealSchema,
  meals,
  households,
  tasks,
  shoppingItems,
  events,
  stickyNotes,
  users,
  householdMembers,
  bounties,
  rewardStore,
  taskComments
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  // Household Management
  households: {
    create: {
      method: 'POST' as const,
      path: '/api/households' as const,
      input: insertHouseholdSchema,
      responses: {
        201: z.custom<typeof households.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    join: {
      method: 'POST' as const,
      path: '/api/households/join' as const,
      input: z.object({ joinCode: z.string() }),
      responses: {
        200: z.custom<typeof households.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/households/current' as const,
      responses: {
        200: z.custom<typeof households.$inferSelect & { members: (typeof users.$inferSelect)[] }>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    leave: {
      method: 'DELETE' as const,
      path: '/api/households/current/member' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Tasks
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect & { assignedTo: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id' as const,
      input: insertTaskSchema.partial().extend({ completed: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Shopping List
  shopping: {
    list: {
      method: 'GET' as const,
      path: '/api/shopping' as const,
      responses: {
        200: z.array(z.custom<typeof shoppingItems.$inferSelect & { addedBy: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/shopping' as const,
      input: insertShoppingItemSchema,
      responses: {
        201: z.custom<typeof shoppingItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/shopping/:id' as const,
      input: insertShoppingItemSchema.partial().extend({ completed: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof shoppingItems.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/shopping/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Events
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect & { createdBy: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Sticky Notes
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes' as const,
      responses: {
        200: z.array(z.custom<typeof stickyNotes.$inferSelect & { author: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes' as const,
      input: insertStickyNoteSchema,
      responses: {
        201: z.custom<typeof stickyNotes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/notes/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/notes/:id' as const,
      input: updateStickyNoteSchema,
      responses: {
        200: z.custom<typeof stickyNotes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound
      }
    }
  },

  // Bounties
  bounties: {
    list: {
      method: 'GET' as const,
      path: '/api/bounties' as const,
      responses: {
        200: z.array(z.custom<typeof bounties.$inferSelect & { claimedBy: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/bounties' as const,
      input: insertBountySchema,
      responses: {
        201: z.custom<typeof bounties.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    claim: {
      method: 'POST' as const,
      path: '/api/bounties/:id/claim' as const,
      responses: {
        200: z.custom<typeof bounties.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Rewards Store
  rewards: {
    list: {
      method: 'GET' as const,
      path: '/api/rewards' as const,
      responses: {
        200: z.array(z.custom<typeof rewardStore.$inferSelect>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/rewards' as const,
      input: insertRewardStoreSchema,
      responses: {
        201: z.custom<typeof rewardStore.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    purchase: {
      method: 'POST' as const,
      path: '/api/rewards/purchase' as const,
      input: z.object({ rewardId: z.number() }),
      responses: {
        200: z.object({ success: z.boolean(), remainingPoints: z.number(), reward: z.custom<typeof rewardStore.$inferSelect>() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Task Comments
  taskComments: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks/:id/comments' as const,
      responses: {
        200: z.array(z.custom<typeof taskComments.$inferSelect & { user: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks/:id/comments' as const,
      input: insertTaskCommentSchema,
      responses: {
        201: z.custom<typeof taskComments.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Meals
  meals: {
    list: {
      method: 'GET' as const,
      path: '/api/meals' as const,
      responses: {
        200: z.array(z.custom<typeof meals.$inferSelect & { createdBy: typeof users.$inferSelect | null }>()),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/meals' as const,
      input: insertMealSchema,
      responses: {
        201: z.custom<typeof meals.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/meals/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    }
  },

  // Subscription
  subscription: {
    get: {
      method: "GET" as const,
      path: "/api/subscription" as const,
      responses: {
        200: z.object({ isSubscribed: z.boolean(), expiresAt: z.string().nullable() }),
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/subscription" as const,
      responses: {
        200: z.object({ isSubscribed: z.boolean(), expiresAt: z.string() }),
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
