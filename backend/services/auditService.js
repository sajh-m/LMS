import { Op } from "sequelize";
import { AuditLog } from "../models/index.js";

export const AuditService = {
  log: (event, { donation, donorUser, borrowerUser, notes } = {}) =>
    AuditLog.create({
      event,
      bookTitle: donation?.title || "Unknown",
      bookAuthor: donation?.author || "Unknown",
      bookLocation: donation?.location || null,
      donorId: donorUser?.id || donation?.donorId || null,
      donorName: donorUser?.name || null,
      donorEmail: donorUser?.email || null,
      borrowerId: borrowerUser?.id || null,
      borrowerName: borrowerUser?.name || null,
      borrowerEmail: borrowerUser?.email || null,
      notes: notes || null,
    }),

  getAll: (filters = {}) => {
    const where = {};
    if (filters.event) where.event = filters.event;
    if (filters.donorName) where.donorName = { [Op.like]: `%${filters.donorName}%` };
    if (filters.borrowerName) where.borrowerName = { [Op.like]: `%${filters.borrowerName}%` };
    if (filters.bookTitle) where.bookTitle = { [Op.like]: `%${filters.bookTitle}%` };

    return AuditLog.findAll({ where, order: [["createdAt", "DESC"]] });
  },
};
