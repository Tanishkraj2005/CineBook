const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'BOOKING_CREATED',
      'PAYMENT_COMPLETED',
      'TICKET_ADMITTED',
      'BOOKING_CANCELLED',
      'SEAT_LOCKED',
      'SEATS_RELEASED',
      'CUSTOMER_BLOCKED',
      'CUSTOMER_UNBLOCKED',
      'SHOW_SCHEDULED',
      'MOVIE_PUBLISHED',
    ],
  },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
