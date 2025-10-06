import { z } from "zod";

// Flat schema for a single NBA card information extraction
const singleCardSchema = z.object({
  isValid: z.boolean().describe("Whether this image contains a valid PSA-graded NBA card"),
  validationError: z.string().optional().describe("Reason why the image is invalid (only if isValid is false)"),
  playerName: z.string().describe("Full name of the NBA player on the card"),
  teamName: z.string().describe("Name of the NBA team"),
  cardYear: z.string().describe("Year the card was produced"),
  cardBrand: z
    .string()
    .describe("Card manufacturer/brand (e.g., Panini, Topps, Upper Deck)"),
  cardSeries: z.string().describe("Card series or set name"),
  cardNumber: z.string().describe("Card number within the set"),
  psaGrade: z.string().describe("PSA grade number (1-10)"),
  psaCertNumber: z.string().describe("PSA certification number"),
  cardType: z
    .string()
    .describe("Type of card (e.g., Base, Rookie, Autograph, Jersey)"),
  isRookieCard: z.boolean().describe("Whether this is a rookie card"),
  cardCondition: z.string().describe("Overall condition description"),
  specialFeatures: z
    .string()
    .describe(
      "Any special features like autograph, patch, serial number, etc."
    ),
});

// Schema for multiple cards
export const nbaCardSchema = z.object({
  cards: z
    .array(singleCardSchema)
    .describe("Array of NBA cards analyzed from the images"),
});

export type NBACardData = z.infer<typeof nbaCardSchema>;
export type SingleCardData = z.infer<typeof singleCardSchema>;
