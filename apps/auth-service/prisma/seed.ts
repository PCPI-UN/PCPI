import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Platform Permissions (18 total)
const PLATFORM_PERMISSIONS = [
  // User Management
  { action: 'create', resource: 'users', description: 'Create new user accounts' },
  { action: 'read', resource: 'users', description: 'View user information' },
  { action: 'update', resource: 'users', description: 'Modify user profiles' },
  { action: 'delete', resource: 'users', description: 'Deactivate user accounts' },
  { action: 'manage', resource: 'user_roles', description: 'Assign/remove platform roles' },

  // Invitation Management
  { action: 'create', resource: 'invitations', description: 'Create platform/event/project invitations' },
  { action: 'read', resource: 'invitations', description: 'View invitation details' },
  { action: 'accept', resource: 'invitations', description: 'Accept invitations (USER)' },

  // Event Management
  { action: 'manage', resource: 'events', description: 'Full event management (CRUD)' },
  { action: 'read', resource: 'events', description: 'View event information' },
  { action: 'create', resource: 'events', description: 'Create new events' },
  { action: 'update', resource: 'events', description: 'Modify event details' },
  { action: 'delete', resource: 'events', description: 'Delete events' },
  { action: 'manage', resource: 'all_events', description: 'Bypass event membership checks (admin override)' },
  { action: 'view', resource: 'public_events', description: 'View public events (USER)' },

  // Course Management
  { action: 'manage', resource: 'courses', description: 'Manage courses within events' },

  // Profile Management
  { action: 'manage', resource: 'own_profile', description: 'Manage own user profile (USER)' },
  { action: 'view', resource: 'own_data', description: 'View own user data (USER)' },
];

// Event Permissions (7 total)
const EVENT_PERMISSIONS = [
  { action: 'read', resource: 'event_members', description: 'View event member list' },
  { action: 'read', resource: 'event_projects', description: 'View projects in event' },
  { action: 'read', resource: 'event_info', description: 'View basic event information' },
  { action: 'evaluate', resource: 'projects', description: 'Submit evaluations for assigned projects' },
  { action: 'read', resource: 'evaluations', description: 'View evaluations' },
  { action: 'submit', resource: 'projects', description: 'Submit projects to event' },
  { action: 'update', resource: 'own_project', description: 'Modify own submitted project' },
];

// Role definitions with permission mappings
const ROLES = [
  {
    name: 'Admin',
    scope: 'PLATFORM',
    description: 'Full system administrator with all permissions',
    permissions: PLATFORM_PERMISSIONS.map(p => `${p.action}:${p.resource}`),
  },
  {
    name: 'EventManager',
    scope: 'PLATFORM',
    description: 'User responsible for creating and managing events',
    permissions: [
      'view:public_events',
      'accept:invitations',
      'manage:own_profile',
      'view:own_data',
      'read:users',
      'create:invitations',
      'read:invitations',
      'manage:events',
      'read:events',
      'create:events',
      'update:events',
      'delete:events',
      'manage:courses',
    ],
  },
  {
    name: 'User',
    scope: 'PLATFORM',
    description: 'Regular authenticated user with basic platform permissions',
    permissions: [
      'view:public_events',
      'accept:invitations',
      'manage:own_profile',
      'view:own_data',
    ],
  },
  {
    name: 'Juror',
    scope: 'EVENT',
    description: 'Event member who evaluates assigned projects',
    permissions: [
      'read:event_members',
      'read:event_projects',
      'read:event_info',
      'evaluate:projects',
      'read:evaluations',
    ],
  },
  {
    name: 'Participant',
    scope: 'EVENT',
    description: 'Event member who can submit projects',
    permissions: [
      'read:event_members',
      'read:event_projects',
      'read:event_info',
      'submit:projects',
      'update:own_project',
    ],
  },
];

// Default passwords for development
const DEFAULT_PASSWORDS = {
  admin: 'Admin1234@',
  testUser: 'User1234@',
};

/**
 * Prompt for password input from terminal
 */
function promptPassword(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    const onData = (char: string) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData);
          break;
        default:
          process.stdout.write('\b \b');
          break;
      }
    };

    rl.question(prompt, (password) => {
      rl.close();
      resolve(password);
    });

    stdin.on('data', onData);
  });
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Validate password strength
 */
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get admin password with smart fallback logic
 */
async function getAdminPassword(): Promise<string> {
  // Priority 1: Check environment variable
  const envPassword = process.env.SEED_ADMIN_PASSWORD;
  if (envPassword) {
    console.log('  ✓ Using admin password from SEED_ADMIN_PASSWORD environment variable');
    return envPassword;
  }

  // Priority 2: Production must have explicit password
  if (isProduction()) {
    // Check if interactive
    if (process.stdin.isTTY) {
      console.log('\n⚠️  PRODUCTION MODE: Password required!\n');
      const password = await promptPassword('Enter admin password: ');
      console.log('\n');

      const validation = validatePassword(password);
      if (!validation.valid) {
        console.error('❌ Password validation failed:');
        validation.errors.forEach(err => console.error(`   - ${err}`));
        process.exit(1);
      }

      return password;
    } else {
      // Non-interactive production: Generate secure password
      const randomPassword = generateSecurePassword();
      console.log('\n⚠️  PRODUCTION MODE: No ADMIN_PASSWORD set. Generated secure password.');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`   ${randomPassword}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚠️  SAVE THIS PASSWORD! It will not be shown again.\n');
      return randomPassword;
    }
  }

  // Priority 3: Development with interactive terminal
  if (process.stdin.isTTY) {
    console.log('\n🔐 Admin Password Setup (Development Mode)');
    console.log('════════════════════════════════════════════════════════════');
    console.log('Press ENTER to use default password, or type a custom one:');
    console.log(`Default: ${DEFAULT_PASSWORDS.admin}`);
    console.log('════════════════════════════════════════════════════════════\n');

    const password = await promptPassword('Enter admin password [press ENTER for default]: ');
    console.log('\n');

    // Use default if empty
    if (!password || password.trim() === '') {
      console.log(`✓ Using default development password: ${DEFAULT_PASSWORDS.admin}\n`);
      return DEFAULT_PASSWORDS.admin;
    }

    // Validate custom password
    const validation = validatePassword(password);
    if (!validation.valid) {
      console.error('❌ Password validation failed:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
      process.exit(1);
    }

    console.log('✅ Using custom password\n');
    return password;
  }

  // Priority 4: Development non-interactive (CI/CD, Docker build)
  console.log(`\n💡 Development Mode: Using default admin password: ${DEFAULT_PASSWORDS.admin}`);
  console.log('   Set ADMIN_PASSWORD environment variable to use a different password.\n');
  return DEFAULT_PASSWORDS.admin;
}

/**
 * Get test user password
 */
function getTestUserPassword(): string {
  // Check environment variable first
  const envPassword = process.env.SEED_TEST_USER_PASSWORD;
  if (envPassword) {
    return envPassword;
  }

  // Production: warn about default
  if (isProduction()) {
    console.warn('⚠️  Production: Using default test user password! Set SEED_TEST_USER_PASSWORD env var.');
  }

  // Use default for development
  return DEFAULT_PASSWORDS.testUser;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Check if seeding has already been done
  const existingRoles = await prisma.role.count();
  if (existingRoles > 0) {
    console.log('✅ Database already seeded. Skipping...');
    console.log('💡 To re-seed, first run: npx prisma migrate reset\n');
    return;
  }

  // 1. Seed Permissions
  console.log('📝 Seeding permissions...');
  const allPermissions = [...PLATFORM_PERMISSIONS, ...EVENT_PERMISSIONS];

  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: {
        action_resource: { action: perm.action, resource: perm.resource },
      },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ Seeded ${allPermissions.length} permissions (${PLATFORM_PERMISSIONS.length} platform + ${EVENT_PERMISSIONS.length} event)\n`);

  // 2. Seed Roles with Permissions
  console.log('👥 Seeding roles...');

  for (const roleData of ROLES) {
    const permissionConnections = roleData.permissions.map(permString => {
      const [action, resource] = permString.split(':');
      return { action_resource: { action, resource } };
    });

    await prisma.role.create({
      data: {
        name: roleData.name,
        scope: roleData.scope,
        description: roleData.description,
        permissions: {
          connect: permissionConnections,
        },
      },
    });

    console.log(`  ✓ Created ${roleData.name} role (${roleData.scope}) with ${roleData.permissions.length} permissions`);
  }

  console.log(`✅ Seeded ${ROLES.length} roles\n`);

  // 3. Create Initial Admin User
  console.log('👤 Creating initial admin user...');

  const adminPassword = await getAdminPassword();
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@iris.local',
      password: hashedAdminPassword,
      active: true,
      status: 'CONFIRMED',
    },
  });

  console.log(`  ✓ Created admin user: ${adminUser.email}`);

  // 4. Assign Admin Role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'Admin' },
  });

  if (adminRole) {
    await prisma.platformStaff.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        active: true,
      },
    });

    console.log(`  ✓ Assigned Admin role to ${adminUser.email}`);
  }

  console.log('✅ Initial admin user created and configured\n');

  // 5. Create Test Regular User
  console.log('👤 Creating test regular user...');

  const testUserPassword = getTestUserPassword();
  const hashedTestPassword = await bcrypt.hash(testUserPassword, 10);

  const testUser = await prisma.user.create({
    data: {
      firstName: 'Aki',
      lastName: 'Hayakawa',
      email: 'aki@iris.local',
      password: hashedTestPassword,
      active: true,
      status: 'CONFIRMED',
    },
  });

  const userRole = await prisma.role.findFirst({
    where: { name: 'User' },
  });

  if (userRole) {
    await prisma.platformStaff.create({
      data: {
        userId: testUser.id,
        roleId: userRole.id,
        active: true,
      },
    });

    console.log(`  ✓ Created test user: ${testUser.email} with USER role`);
  }

  console.log('✅ Test user created and configured\n');

  // 6. Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📋 Summary:');
  console.log(`   • Environment: ${isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`   • Permissions: ${allPermissions.length} (${PLATFORM_PERMISSIONS.length} platform + ${EVENT_PERMISSIONS.length} event)`);
  console.log(`   • Roles: ${ROLES.length} (User, Admin, EventManager, Juror, Participant)`);
  console.log(`   • Admin User: admin@iris.local`);
  console.log(`   • Test User: user@iris.local\n`);
  
  console.log('🔐 Default Credentials (Development):');
  if (!isProduction()) {
    console.log('   • Admin: admin@iris.local');
    console.log(`     Password: ${adminPassword === DEFAULT_PASSWORDS.admin ? DEFAULT_PASSWORDS.admin : '[Custom/Env Var]'}`);
    console.log('   • Test User: user@iris.local');
    console.log(`     Password: ${testUserPassword === DEFAULT_PASSWORDS.testUser ? DEFAULT_PASSWORDS.testUser : '[Env Var]'}\n`);
  } else {
    console.log('   • Credentials set via environment variables\n');
  }

  if (!isProduction() && !process.env.ADMIN_PASSWORD) {
    console.log('📝 Development Note:');
    console.log('   Default passwords are convenient for development.');
    console.log('   For production, ALWAYS set ADMIN_PASSWORD environment variable!\n');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });