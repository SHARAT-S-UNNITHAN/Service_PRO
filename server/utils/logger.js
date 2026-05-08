const db = require('../db');

/**
 * Logs an administrative action to the audit logs table
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} action - Type of action (e.g. 'APPROVE_PROVIDER')
 * @param {string} targetType - Entity type (e.g. 'provider', 'customer')
 * @param {string|number} targetId - ID of the target entity
 * @param {Object} details - Additional JSON data
 */
const logAdminAction = (adminId, action, targetType, targetId, details) => {
  db.run(
    "INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
    [adminId, action, targetType, String(targetId), details ? JSON.stringify(details) : null]
  );
};

module.exports = { logAdminAction };
