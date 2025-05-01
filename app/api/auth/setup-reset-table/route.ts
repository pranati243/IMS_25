import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if the password_reset_tokens table exists
    const tablesResult = await query(
      `
      SELECT 
        COUNT(*) as table_exists 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = DATABASE() 
        AND table_name = 'password_reset_tokens'
      `
    ) as Array<{ table_exists: number }>;

    const tableExists = tablesResult[0].table_exists > 0;

    if (!tableExists) {
      // Create the password_reset_tokens table
      await query(`
        CREATE TABLE password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          used TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      return NextResponse.json({
        success: true,
        message: "Password reset tokens table created successfully",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset tokens table already exists",
    });
  } catch (error) {
    console.error("Table setup error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to setup table", error: String(error) },
      { status: 500 }
    );
  }
} 