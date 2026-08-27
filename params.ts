import { z } from "zod";
import { getFormattedSidebar } from "./utils.js";

export function getGuideParams(sidebar = getFormattedSidebar()) {
  const findGuideParamsPrompt = `
    This is the path to the technical documentation to create actions from.
    To get the steps list, you need to pass the guideLink to the BuildOnBase getGuide tool.
    From the user prompt, find the most relevant guide from the sidebar of the docs website.
    The sidebar list can be found here:
    ${sidebar}
    Find the path of the guide in the sidebar and pass it as guideLink by adding https://docs.base.org to the getStepsList tool.

    For example, if the user wants to create a sign and verify component, the guideLink should be https://docs.base.org/identity/smart-wallet/guides/signing-and-verifying-messages

    You will find that in the sidebar list, the guide is under the "Smart Wallet" section.
    `;

  return z.object({
    guideLink: z.string().describe(findGuideParamsPrompt),
  });
}
