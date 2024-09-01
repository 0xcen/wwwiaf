import { Match, Fighter } from "../types/schema";

export function calculateMatchRank(match: Match): number {
  const voteCount = match.votes_fighter1 + match.votes_fighter2;

  // Check if lastEngagementDate exists and is valid
  let daysSinceLastEngagement = 0;
  if (match.lastEngagementDate && match.lastEngagementDate instanceof Date) {
    daysSinceLastEngagement =
      (Date.now() - match.lastEngagementDate.getTime()) / (1000 * 3600 * 24);
  }

  return voteCount / Math.max(1, Math.log(daysSinceLastEngagement + 1));
}

export function calculateFighterRank(
  fighter: Fighter,
  matches: Match[]
): number {
  const fighterMatches = matches.filter(
    match =>
      match.fighter1_id === fighter.id || match.fighter2_id === fighter.id
  );
  const totalRank = fighterMatches.reduce((sum, match) => sum + match.rank, 0);
  return totalRank / Math.max(1, fighterMatches.length);
}
