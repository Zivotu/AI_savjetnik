import {
  PromptAgentInputToolsItem_System,
  ConversationalConfig,
  AgentConfig,
  PromptAgent,
} from "elevenlabs";

export const endCallTool = PromptAgentInputToolsItem_System({
  name: "end_call",
});

export const convCfg: ConversationalConfig = {
  agent: AgentConfig({
    prompt: PromptAgent({
      // ⬇︎ add the tool
      tools: [endCallTool],
      // 👉 INCLUDE in the system-prompt:
      // “When you have delivered the final solution and
      //  the user has no more questions, call end_call
      //  with { reason: 'Task completed', message: 'Hvala, doviđenja!' }”
    }),
  }),
};
