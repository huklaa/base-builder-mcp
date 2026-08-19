import { z } from "zod";
import { getFindGuideParamsPrompt } from "./utils";

export function getGuideParams() {
  return z.object({
    guideLink: z.string().describe(getFindGuideParamsPrompt()),
  });
}
