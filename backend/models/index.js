import { User } from "./userModel.js";
import { Donation } from "./donationModel.js";
import { Request } from "./requestModel.js";
import { Notification } from "./notificationModel.js";
import { AuditLog } from "./auditLogModel.js";

User.hasMany(Donation, { foreignKey: "donorId", as: "donatedCopies" });
Donation.belongsTo(User, { foreignKey: "donorId", as: "donor" });

Donation.hasMany(Request, { foreignKey: "donationId", as: "requests", onDelete: "CASCADE" });
Request.belongsTo(Donation, { foreignKey: "donationId", as: "donation" });

User.hasMany(Request, { foreignKey: "borrowerId", as: "sentRequests" });
Request.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Donation, Request, Notification, AuditLog };
