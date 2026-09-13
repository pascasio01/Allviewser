import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.string(),
  meta: z
    .object({
      provider: z.string().optional(),
      error: z.string().optional(),
      cancelled: z.boolean().optional(),
      simulated: z.literal(false).optional(),
    })
    .optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  messages: z.array(ChatMessageSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
