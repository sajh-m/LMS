import { User } from "./userModel.js";
import { Donation } from "./donationModel.js";

User.hasMany(Donation, { foreignKey: "donorId", as: "donatedCopies" });
Donation.belongsTo(User, { foreignKey: "donorId", as: "donor" });

User.hasMany(Donation, { foreignKey: "borrowerId", as: "reservedCopies" });
Donation.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

export { User, Donation };
