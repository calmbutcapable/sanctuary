

export type RecommendedAction =
  | "checkin"
  | "reflect"
  | "journal"
  | "continue_thread"
  | "workspace"
  | "pause";

export type HomeRecommendation = {
  primaryAction: RecommendedAction;
  reason: string;
  secondaryActions: RecommendedAction[];
};

type RecommendationParams = {
  hasCheckInToday: boolean;
  mood: number | null;
  energy: number | null;
  hasActiveThread: boolean;
  hasNextStep: boolean;
  hasJournalEntries: boolean;
};

export function getHomeRecommendation({
  hasCheckInToday,
  mood,
  energy,
  hasActiveThread,
  hasNextStep,
  hasJournalEntries,
}: RecommendationParams): HomeRecommendation {
  const lowMood = mood !== null && mood <= 2;
  const lowEnergy = energy !== null && energy <= 2;

  if (!hasCheckInToday) {
    return {
      primaryAction: "checkin",
      reason: "You have not checked in today yet.",
      secondaryActions: ["journal", "workspace"],
    };
  }

  if (lowMood || lowEnergy) {
    return {
      primaryAction: "reflect",
      reason: "A quieter step may fit better right now.",
      secondaryActions: ["journal", "pause"],
    };
  }

  if (hasActiveThread && hasNextStep) {
    return {
      primaryAction: "continue_thread",
      reason: "You already have an open thread with a next step ready.",
      secondaryActions: ["reflect", "journal"],
    };
  }

  if (hasJournalEntries) {
    return {
      primaryAction: "workspace",
      reason: "You already have some momentum recorded. This could be a good time to continue.",
      secondaryActions: ["journal", "reflect"],
    };
  }

  return {
    primaryAction: "journal",
    reason: "Writing something down is a simple place to begin.",
    secondaryActions: ["checkin", "workspace"],
  };
}