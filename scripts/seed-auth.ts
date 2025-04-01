import { hash } from "bcrypt";
import { query } from "../app/lib/db";

async function seedDatabase() {
  try {
    // Define roles
    const roles = ["admin", "hod", "faculty", "staff", "student", "guest"];

    // Insert default permissions
    const permissions = [
      // Faculty module
      { name: "faculty_read", resource: "faculty", action: "read" },
      { name: "faculty_create", resource: "faculty", action: "create" },
      { name: "faculty_update", resource: "faculty", action: "update" },
      { name: "faculty_delete", resource: "faculty", action: "delete" },

      // Department module
      { name: "department_read", resource: "department", action: "read" },
      { name: "department_create", resource: "department", action: "create" },
      { name: "department_update", resource: "department", action: "update" },
      { name: "department_delete", resource: "department", action: "delete" },

      // Student module
      { name: "student_read", resource: "student", action: "read" },
      { name: "student_create", resource: "student", action: "create" },
      { name: "student_update", resource: "student", action: "update" },
      { name: "student_delete", resource: "student", action: "delete" },

      // Course module
      { name: "course_read", resource: "course", action: "read" },
      { name: "course_create", resource: "course", action: "create" },
      { name: "course_update", resource: "course", action: "update" },
      { name: "course_delete", resource: "course", action: "delete" },

      // Settings module
      { name: "settings_read", resource: "settings", action: "read" },
      { name: "settings_update", resource: "settings", action: "update" },
    ];

    console.log("Inserting permissions...");
    for (const permission of permissions) {
      await query(
        `
        INSERT IGNORE INTO permissions (name, resource, action)
        VALUES (?, ?, ?)
        `,
        [permission.name, permission.resource, permission.action]
      );
    }

    // Get all permission IDs
    const allPermissions = await query(`SELECT id, name FROM permissions`);

    // Define role-based permissions
    const rolePermissionsMap = {
      admin: allPermissions.map((p: any) => p.id), // Admin has all permissions
      hod: allPermissions
        .filter(
          (p: any) =>
            !p.name.includes("delete") && !p.name.includes("settings_update")
        )
        .map((p: any) => p.id),
      faculty: allPermissions
        .filter(
          (p: any) =>
            p.name.includes("_read") ||
            p.name.includes("faculty_update") ||
            p.name.includes("course_read")
        )
        .map((p: any) => p.id),
      staff: allPermissions
        .filter(
          (p: any) =>
            p.name.includes("_read") ||
            p.name.includes("student_create") ||
            p.name.includes("student_update")
        )
        .map((p: any) => p.id),
      student: allPermissions
        .filter(
          (p: any) => p.name === "course_read" || p.name === "faculty_read"
        )
        .map((p: any) => p.id),
      guest: allPermissions
        .filter((p: any) => p.name === "faculty_read")
        .map((p: any) => p.id),
    };

    // Assign permissions to roles
    console.log("Assigning permissions to roles...");
    for (const role of roles) {
      const permissionIds =
        rolePermissionsMap[role as keyof typeof rolePermissionsMap] || [];

      for (const permissionId of permissionIds) {
        await query(
          `
          INSERT IGNORE INTO role_permissions (role, permission_id)
          VALUES (?, ?)
          `,
          [role, permissionId]
        );
      }
    }

    // Create an admin user if none exists
    const existingAdmin = await query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await hash("admin123", 10);

      await query(
        `
        INSERT INTO users (username, email, password, role, name)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "admin",
          "admin@ims.edu",
          hashedPassword,
          "admin",
          "System Administrator",
        ]
      );

      console.log("Admin user created successfully");
    }

    // Create a test user for each role
    const testRoles = ["hod", "faculty", "staff", "student"];

    for (const role of testRoles) {
      const existingUser = await query(
        `SELECT id FROM users WHERE role = ? LIMIT 1`,
        [role]
      );

      if (existingUser.length === 0) {
        const hashedPassword = await hash(`${role}123`, 10);

        await query(
          `
          INSERT INTO users (username, email, password, role, name)
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            role,
            `${role}@ims.edu`,
            hashedPassword,
            role,
            `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          ]
        );

        console.log(`Test ${role} user created successfully`);
      }
    }

    console.log("Auth seeding completed successfully");
  } catch (error) {
    console.error("Error seeding auth data:", error);
  }
}

seedDatabase();
