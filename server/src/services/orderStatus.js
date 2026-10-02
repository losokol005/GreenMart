const STATUSES = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);

const STATUS_MESSAGES = {
  confirmed: 'has been confirmed',
  out_for_delivery: 'is out for delivery',
  delivered: 'has been delivered',
  cancelled: 'has been cancelled',
};

module.exports = { STATUSES, TRANSITIONS, canTransition, STATUS_MESSAGES };
