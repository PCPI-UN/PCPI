import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\d+)\]:\s(.+)$/,
      headerCorrespondence: ["taskId", "subject"],
    },
  },
  rules: {
    "task-id-empty": [2, "always"],
    "subject-empty": [2, "never"],
    "subject-case": [0],
  },
  plugins: [
    {
      rules: {
        "task-id-empty": ({ taskId }: { taskId?: string }) => {
          return [!!taskId, "Task ID may not be empty — expected format: [taskId]: message (e.g. [42]: add endpoint)"];
        },
      },
    },
  ],
};

export default config;
