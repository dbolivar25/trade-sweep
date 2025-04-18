import { format, parse } from "date-fns";
import {
  TradeType,
  TradeValidationFormSchema,
  ValidationResult,
} from "@/lib/types";

export function validateTrade(
  tradeType: TradeType,
  formData: TradeValidationFormSchema,
  currentTime: Date,
): ValidationResult {
  // Convert time to format needed for validation
  const timeString = format(currentTime, "HH:mm");

  // Define valid trading time range
  const startTime = parse("05:50", "HH:mm", new Date());
  const endTime = parse("10:30", "HH:mm", new Date());
  const timeToCheck = parse(timeString, "HH:mm", new Date());

  // Check if current time is between 9:50 and 10:30
  const isValidTime = timeToCheck >= startTime && timeToCheck <= endTime;

  // Parse number values
  const fvgLow = parseFloat(formData.fvgLow);
  const fvgHigh = parseFloat(formData.fvgHigh);
  const currentPrice = parseFloat(formData.currentPrice);

  let isValid = false;
  let message = "";

  if (!isValidTime) {
    message = "Invalid time to enter. Trade from 9:50 to 10:30.";
  } else if (tradeType === "short" && fvgLow > currentPrice) {
    isValid = true;
    message = "Valid time to enter short.";
  } else if (tradeType === "long" && fvgHigh < currentPrice) {
    isValid = true;
    message = "Valid time to enter long.";
  } else {
    message = "Trade conditions not met.";
  }

  return { isValid, message };
}
