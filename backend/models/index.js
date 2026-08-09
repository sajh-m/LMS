import { User } from "./userModel.js";
import { Donation } from "./donationModel.js";
import { Notification } from "./notificationModel.js";

User.hasMany(Donation, { foreignKey: "donorId", as: "donatedCopies" });
Donation.belongsTo(User, { foreignKey: "donorId", as: "donor" });

User.hasMany(Donation, { foreignKey: "borrowerId", as: "reservedCopies" });
Donation.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Donation, Notification };
