import { Op, fn, col, where as sqlWhere } from "sequelize";
import { Donation, User } from "../models/index.js";

const PUBLIC_ATTRIBUTES = [
  "id",
  "title",
  "author",
  "genre",
  "description",
  "image",
  "location",
  "donorId",
  "createdAt",
];

// Partial, case-insensitive match on a plain column - e.g. "gats" matches
// "The Great Gatsby". Every filter is independent and optional; passing
// just one narrows results by that field alone.
function likeCondition(field, value) {
  return sqlWhere(fn("lower", col(field)), { [Op.like]: `%${value.trim().toLowerCase()}%` });
}

// Same idea, but for a column on an included association (e.g. donor.name)
function likeAssocCondition(alias, field, value) {
  return sqlWhere(fn("lower", col(`${alias}.${field}`)), {
    [Op.like]: `%${value.trim().toLowerCase()}%`,
  });
}

function buildTextConditions(filters) {
  const conditions = [];
  if (filters.title) conditions.push(likeCondition("title", filters.title));
  if (filters.author) conditions.push(likeCondition("author", filters.author));
  if (filters.location) conditions.push(likeCondition("location", filters.location));
  if (filters.genre) conditions.push(likeCondition("genre", filters.genre));
  return conditions;
}

export const BookService = {
  getAllBooks: (filters = {}) => {
    const where = { status: "available" };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const include = [];
    if (filters.donorName) {
      include.push({
        model: User,
        as: "donor",
        attributes: [],
        required: true,
        where: likeAssocCondition("donor", "name", filters.donorName),
      });
    }

    return Donation.findAll({
      where,
      include,
      attributes: PUBLIC_ATTRIBUTES,
      order: [["id", "DESC"]],
    });
  },

  getBookById: (id) => Donation.findByPk(id, { attributes: PUBLIC_ATTRIBUTES }),

  donateBook: (data, donorId) =>
    Donation.create({
      title: data.title,
      author: data.author,
      genre: data.genre || null,
      description: data.description || null,
      location: data.location,
      image: data.image,
      donorId,
      status: "available",
    }),

  updateBook: async (id, data, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    if (data.title !== undefined) entry.title = data.title;
    if (data.author !== undefined) entry.author = data.author;
    if (data.genre !== undefined) entry.genre = data.genre;
    if (data.description !== undefined) entry.description = data.description;
    if (data.location !== undefined) entry.location = data.location;
    if (data.image !== undefined) entry.image = data.image;
    await entry.save();

    return { status: "ok", entry };
  },

  deleteBook: async (id, requesterId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.donorId !== requesterId) return { status: "forbidden" };

    await entry.destroy();
    return { status: "ok" };
  },

  takeBook: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };

    const [affectedRows] = await Donation.update(
      { status: "reserved", borrowerId },
      { where: { id, status: "available" } },
    );

    if (affectedRows === 0) return { status: "out_of_stock" };

    const updated = await Donation.findByPk(id, {
      include: [{ model: User, as: "donor", attributes: ["id", "name", "email", "phone"] }],
    });
    return { status: "ok", entry: updated };
  },

  cancelReservation: async (id, borrowerId) => {
    const entry = await Donation.findByPk(id);
    if (!entry) return { status: "not_found" };
    if (entry.status !== "reserved" || entry.borrowerId !== borrowerId) {
      return { status: "forbidden" };
    }

    entry.status = "available";
    entry.borrowerId = null;
    await entry.save();
    return { status: "ok" };
  },

  getMyDonations: (donorId, filters = {}) => {
    const where = { donorId };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    return Donation.findAll({
      where,
      include: [{ model: User, as: "borrower", attributes: ["id", "name", "email", "phone"] }],
      order: [["id", "DESC"]],
    });
  },

  getMyReservation: (borrowerId, filters = {}) => {
    const where = { borrowerId, status: "reserved" };
    const conditions = buildTextConditions(filters);
    if (conditions.length > 0) where[Op.and] = conditions;

    const include = [
      { model: User, as: "donor", attributes: ["id", "name", "email", "phone"] },
    ];
    if (filters.donorName) {
      include[0].required = true;
      include[0].where = likeAssocCondition("donor", "name", filters.donorName);
    }

    return Donation.findAll({ where, include, order: [["id", "DESC"]] });
  },
};
