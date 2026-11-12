const AuditLog = require('../models/AuditLog');

exports.logAudit = async ({ action, entityType, entityId, performedBy, details, ipAddress }) => {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId: String(entityId),
      performedBy: performedBy || null,
      details: details || {},
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    console.error('Audit log failed to write:', err.message);
  }
};
