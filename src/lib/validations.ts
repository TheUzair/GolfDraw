import { z } from "zod";

export const scoreSchema = z.object({
  value: z.number().int().min(1).max(45),
  playedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export const charitySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1),
  image: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const donationSchema = z.object({
  charityId: z.string().min(1),
  amount: z.number().positive(),
});

export const drawConfigSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024),
  drawType: z.enum(["RANDOM", "ALGORITHMIC"]),
});

export const winnerVerificationSchema = z.object({
  winnerId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  charityId: z.string().optional(),
  charityPct: z.number().int().min(10).max(100).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  charityId: z.string().optional(),
});
