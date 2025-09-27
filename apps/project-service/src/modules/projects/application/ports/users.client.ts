export interface EnsureUsersResult {
  email: string;
  userId: number;
}

export interface UsersClient {
    // Nos aseguramos de la existencia de usuarios por email y retorna sus IDs.
    ensureUsersByEmail(input: { email: string; fullName?: string }[]): Promise<EnsureUsersResult[]>;
}
