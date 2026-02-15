import { z } from 'zod';
import { 
  insertHouseholdSchema, 
  insertTaskSchema, 
  insertShoppingItemSchema, 
  insertEventSchema, 
  insertStickyNoteSchema,
  households,
  tasks,
  shoppingItems,
  events,
  stickyNotes,
  users,
  householdMembers
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
