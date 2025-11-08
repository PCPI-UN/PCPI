import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Platform Permissions (14 total)
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

  // Event Management
  { action: 'manage', resource: 'events', description: 'Full event management (CRUD)' },
  { action: 'read', resource: 'events', description: 'View event information' },
  { action: 'create', resource: 'events', description: 'Create new events' },
  { action: 'update', resource: 'events', description: 'Modify event details' },
  { action: 'delete', resource: 'events', description: 'Delete events' },
  { action: 'manage', resource: 'all_events', description: 'Bypass event membership checks (admin override)' },

  // Course Management
  { action: 'manage', resource: 'courses', description: 'Manage courses within events' },
];

// Event Permissions (7 total)
const EVENT_PERMISSIONS = [
  // Read Permissions (all event members)
  { action: 'read', resource: 'event_members', description: 'View event member list' },
  { action: 'read', resource: 'event_projects', description: 'View projects in event' },
  { action: 'read', resource: 'event_info', description: 'View basic event information' },

  // Juror Permissions
  { action: 'evaluate', resource: 'projects', description: 'Submit evaluations for assigned projects' },
  { action: 'read', resource: 'evaluations', description: 'View evaluations' },

  // Participant Permissions
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

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if seeding has already been done
  const existingRoles = await prisma.role.count();
  if (existingRoles > 0) {
    console.log('✅ Database already seeded. Skipping...');
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

  console.log(`✅ Seeded ${allPermissions.length} permissions (14 platform + 7 event)`);

  // 2. Seed Roles with Permissions
  console.log('👥 Seeding roles...');

  for (const roleData of ROLES) {
    // Create permission connections
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

  console.log('✅ Seeded 4 roles');

  // 3. Create Initial Admin User
  console.log('🔐 Creating initial admin user...');

  const hashedPassword = await bcrypt.hash('Admin12345@', 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@iris.local',
      password: hashedPassword,
      active: true,
      status: 'CONFIRMED',
    },
  });

  console.log(`  ✓ Created admin user: ${adminUser.email}`);

  // 4. Assign Admin Role to Admin User
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

  console.log('✅ Initial admin user created and configured');
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Permissions: ${allPermissions.length} (14 platform + 7 event)`);
  console.log(`   - Roles: 4 (Admin, EventManager, Juror, Participant)`);
  console.log(`   - Admin User: admin@iris.local / Admin12345@`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
