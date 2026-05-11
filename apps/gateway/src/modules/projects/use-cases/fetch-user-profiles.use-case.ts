import { Injectable, Logger } from '@nestjs/common';
import { JurorKey } from '@app/common/generated/project';
import { AuthService } from '../../auth/auth.service';
import { JurorProfile, UserProfileMap } from '../types/project-enrichment.types';

/**
 * Configuration for concurrency limits when fetching user profiles
 */
export interface FetchUserProfilesConfig {
  /**
   * Maximum number of concurrent user profile requests
   * @default 5
   */
  concurrencyLimit?: number;
}

/**
 * Use case for fetching user profiles with concurrency control
 * Prevents overwhelming the auth service by limiting concurrent requests
 */
@Injectable()
export class FetchUserProfilesUseCase {
  private readonly logger = new Logger(FetchUserProfilesUseCase.name);
  private readonly DEFAULT_CONCURRENCY_LIMIT = 5;

  constructor(private readonly authService: AuthService) {}

  /**
   * Fetches user profiles for multiple user IDs with concurrency limiting
   * @param userIds - Set of unique user IDs to fetch
   * @param config - Configuration options
   * @returns Map of user ID to profile
   */
  async execute(
    userIds: Set<number>,
    config?: FetchUserProfilesConfig,
  ): Promise<UserProfileMap> {
    if (userIds.size === 0) {
      return new Map();
    }

    const concurrencyLimit = config?.concurrencyLimit ?? this.DEFAULT_CONCURRENCY_LIMIT;

    this.logger.debug(
      `Fetching profiles for ${userIds.size} users with concurrency limit of ${concurrencyLimit}`,
    );

    const userIdArray = Array.from(userIds);
    const userProfiles = new Map<number, JurorProfile>();

    // Process user IDs in batches to respect concurrency limit
    for (let i = 0; i < userIdArray.length; i += concurrencyLimit) {
      const batch = userIdArray.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map((userId) =>
        this.fetchUserProfile(userId).then((profile) => {
          if (profile) {
            userProfiles.set(userId, profile);
          }
        }),
      );

      // Wait for batch to complete before moving to next batch
      await Promise.all(batchPromises);
    }

    this.logger.debug(`Successfully fetched ${userProfiles.size} user profiles`);

    return userProfiles;
  }

  /**
   * Fetches a single user profile with error handling
   */
  private async fetchUserProfile(userId: number): Promise<JurorProfile | null> {
    try {
      const user = await this.authService.getUser(userId);

      return {
        id: String(user.id) || `user-${userId}`,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      };
    } catch (error) {
      this.logger.warn(
        `Failed to fetch user profile for juror ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Return a placeholder profile instead of null to maintain consistency
      return {
        id: `user-${userId}`,
        firstName: '',
        lastName: '',
        email: '',
      };
    }
  }
}
